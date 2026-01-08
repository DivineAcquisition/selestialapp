import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getTemplateById } from '@/lib/sequences/templates'

// POST /api/sequences/templates/install - Install a sequence template
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
    
    const { templateId } = await req.json()
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }
    
    // Get template
    const template = getTemplateById(templateId)
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    // Convert template steps to database format
    const steps = template.steps.map((step, index) => ({
      id: `step-${index}`,
      name: step.name || `Step ${index + 1}`,
      channel: step.action === 'sms' ? 'sms' : step.action === 'email' ? 'email' : 'task',
      delay_days: step.delay.type === 'days' ? (step.delay.value || 0) : 0,
      delay_hours: step.delay.type === 'hours' ? (step.delay.value || 0) : 0,
      delay_minutes: step.delay.type === 'minutes' ? (step.delay.value || 0) : 0,
      message: step.message || step.body || '',
      subject: step.subject,
      conditions: step.conditions,
    }))
    
    // Create sequence
    const { data: sequence, error } = await supabase
      .from('sequences')
      .insert({
        business_id: business.id,
        name: template.name,
        description: template.description,
        is_active: false, // Start inactive so user can review
        is_default: false,
        steps: steps,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Create sequence error:', error)
      return NextResponse.json({ error: 'Failed to create sequence' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      sequence,
      message: 'Template installed successfully',
    })
  } catch (error) {
    console.error('Install template API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
