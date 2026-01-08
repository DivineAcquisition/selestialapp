import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface CustomerData {
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  source?: string
  notes?: string
  tags?: string
  _row?: number
}

// POST /api/customers/import - Bulk import customers from CSV
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    
    const { customers, duplicateHandling = 'skip' } = await req.json()
    
    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ error: 'No customers to import' }, { status: 400 })
    }
    
    // Get existing customers for duplicate detection
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id, phone, email')
      .eq('business_id', business.id)
    
    const existingPhones = new Set(existingCustomers?.map(c => c.phone?.replace(/\D/g, '')).filter(Boolean))
    const existingEmails = new Set(existingCustomers?.map(c => c.email?.toLowerCase()).filter(Boolean))
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: 0,
      errorMessages: [] as string[],
    }
    
    const toInsert: Array<{
      business_id: string
      name: string
      phone: string
      email: string | null
      address: string | null
      source: string
      notes: string | null
      customer_type: string
      health_score: number
      total_spent: number
      total_jobs: number
    }> = []
    
    for (const customer of customers as CustomerData[]) {
      // Validate required fields
      if (!customer.first_name?.trim()) {
        results.errors++
        results.errorMessages.push(`Row ${customer._row || '?'}: Missing first name`)
        continue
      }
      
      if (!customer.phone && !customer.email) {
        results.errors++
        results.errorMessages.push(`Row ${customer._row || '?'}: Missing phone and email`)
        continue
      }
      
      // Format phone
      let formattedPhone: string | null = null
      if (customer.phone) {
        const phoneDigits = customer.phone.replace(/\D/g, '')
        if (phoneDigits.length === 10) {
          formattedPhone = `+1${phoneDigits}`
        } else if (phoneDigits.length === 11 && phoneDigits.startsWith('1')) {
          formattedPhone = `+${phoneDigits}`
        } else if (phoneDigits.length >= 7) {
          formattedPhone = customer.phone
        }
      }
      
      // Ensure we have a valid phone if no email
      if (!formattedPhone && !customer.email) {
        results.errors++
        results.errorMessages.push(`Row ${customer._row || '?'}: Invalid phone format and no email`)
        continue
      }
      
      // Check for duplicates
      const phoneDigits = formattedPhone?.replace(/\D/g, '') || ''
      const emailLower = customer.email?.toLowerCase()
      
      const isDuplicate = (phoneDigits && existingPhones.has(phoneDigits)) ||
                         (emailLower && existingEmails.has(emailLower))
      
      if (isDuplicate) {
        if (duplicateHandling === 'skip') {
          results.skipped++
          continue
        } else if (duplicateHandling === 'update') {
          // TODO: Implement update logic if needed
          results.skipped++
          continue
        }
        // 'create_new' falls through to create
      }
      
      // Build address
      const addressParts = [
        customer.address_line1,
        customer.address_line2,
        customer.city,
        customer.state,
        customer.zip_code,
      ].filter(Boolean)
      
      // Prepare record - phone is required so use empty string as fallback (will use email as primary contact)
      toInsert.push({
        business_id: business.id,
        name: `${customer.first_name.trim()} ${customer.last_name?.trim() || ''}`.trim(),
        phone: formattedPhone || '',
        email: emailLower || null,
        address: addressParts.length > 0 ? addressParts.join(', ') : null,
        source: customer.source || 'csv_import',
        notes: customer.notes || null,
        customer_type: 'one_time',
        health_score: 100,
        total_spent: 0,
        total_jobs: 0,
      })
      
      // Add to existing sets to catch in-batch duplicates
      if (phoneDigits) existingPhones.add(phoneDigits)
      if (emailLower) existingEmails.add(emailLower)
    }
    
    // Batch insert
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('customers')
        .insert(toInsert)
      
      if (error) {
        console.error('Batch insert error:', error)
        results.errors += toInsert.length
        results.errorMessages.push(`Database error: ${error.message}`)
      } else {
        results.imported = toInsert.length
      }
    }
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Import customers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
