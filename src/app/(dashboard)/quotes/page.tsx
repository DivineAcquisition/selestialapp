"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { useQuotes } from '@/hooks/useQuotes'
import { usePayments } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter } from '@/components/ui/text-effects'
import { Icon, IconName } from '@/components/ui/icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

type SortField = 'created_at' | 'amount' | 'customer_name' | 'status'
type SortOrder = 'asc' | 'desc'

const statusConfig: Record<string, { label: string; icon: IconName; color: string; bg: string }> = {
  pending: { 
    label: 'Pending', 
    icon: 'clock', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200' 
  },
  new: { 
    label: 'New', 
    icon: 'sparkles', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200' 
  },
  active: { 
    label: 'Active', 
    icon: 'clock', 
    color: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200' 
  },
  sent: { 
    label: 'Sent', 
    icon: 'send', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200' 
  },
  viewed: { 
    label: 'Viewed', 
    icon: 'eye', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50 border-purple-200' 
  },
  won: { 
    label: 'Won', 
    icon: 'checkCircle', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50 border-emerald-200' 
  },
  lost: { 
    label: 'Lost', 
    icon: 'xCircle', 
    color: 'text-red-600', 
    bg: 'bg-red-50 border-red-200' 
  },
  paused: { 
    label: 'Paused', 
    icon: 'alertCircle', 
    color: 'text-gray-600', 
    bg: 'bg-gray-50 border-gray-200' 
  },
  expired: { 
    label: 'Expired', 
    icon: 'alertCircle', 
    color: 'text-gray-600', 
    bg: 'bg-gray-50 border-gray-200' 
  },
}

export default function QuotesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { quotes, loading, refetch, deleteQuote } = useQuotes()
  const { createPaymentLink, loading: paymentLoading } = usePayments()

  // Filters & Search
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all')

  // Sorting
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let result = [...(quotes || [])]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(q => 
        q.customer_name?.toLowerCase().includes(searchLower) ||
        q.service_type?.toLowerCase().includes(searchLower) ||
        q.customer_phone?.includes(search) ||
        q.customer_email?.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(q => q.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const days = dateFilter === '7days' ? 7 : dateFilter === '30days' ? 30 : 90
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      result = result.filter(q => new Date(q.created_at) >= cutoff)
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number, bVal: string | number

      switch (sortField) {
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        case 'amount':
          aVal = a.quote_amount || 0
          bVal = b.quote_amount || 0
          break
        case 'customer_name':
          aVal = a.customer_name?.toLowerCase() || ''
          bVal = b.customer_name?.toLowerCase() || ''
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        default:
          aVal = 0
          bVal = 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return result
  }, [quotes, search, statusFilter, dateFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / pageSize)
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Stats
  const stats = useMemo(() => {
    const all = quotes || []
    return {
      total: all.length,
      pending: all.filter(q => q.status === 'pending' || q.status === 'new' || q.status === 'active').length,
      won: all.filter(q => q.status === 'won').length,
      totalValue: all.reduce((sum, q) => sum + (q.quote_amount || 0), 0),
      wonValue: all.filter(q => q.status === 'won').reduce((sum, q) => sum + (q.quote_amount || 0), 0),
    }
  }, [quotes])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedQuotes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedQuotes.map(q => q.id))
    }
  }

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleCreatePaymentLink = async (quote: typeof quotes[0]) => {
    try {
      const link = await createPaymentLink(quote.id)
      await navigator.clipboard.writeText(link)
      toast({ title: 'Payment link copied!' })
    } catch {
      toast({ title: 'Failed to create link', variant: 'destructive' })
    }
  }

  const handleSendQuote = async (quote: typeof quotes[0]) => {
    try {
      await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: quote.customer_phone,
          message: `Hi ${quote.customer_name}! Your quote for ${quote.service_type} ($${(quote.quote_amount / 100).toFixed(2)}) is ready. View and pay here: ${process.env.NEXT_PUBLIC_APP_URL}/pay/${quote.id}`,
          customerId: quote.customer_id,
          quoteId: quote.id,
        }),
      })
      toast({ title: 'Quote sent!' })
      refetch()
    } catch {
      toast({ title: 'Failed to send', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    
    try {
      await deleteQuote(id)
      toast({ title: 'Quote deleted' })
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleBulkAction = async (action: 'delete' | 'send') => {
    if (action === 'delete') {
      if (!confirm(`Delete ${selectedIds.length} quotes?`)) return
      for (const id of selectedIds) {
        await deleteQuote(id)
      }
      setSelectedIds([])
      toast({ title: `${selectedIds.length} quotes deleted` })
    }
  }

  return (
    <Layout title="Quotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="fileText" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
              <p className="text-gray-500">
                {stats.total} total • ${(stats.totalValue / 100).toLocaleString()} pipeline value
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/quotes/new')}
            className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl"
          >
            <Icon name="plus" size="sm" className="mr-2" />
            New Quote
          </Button>
        </div>

        {/* Stats Cards - Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon name="fileText" size="lg" />
              </div>
              <Icon name="arrowRight" size="sm" className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.total} />
            </div>
            <p className="text-sm text-gray-500">Total Quotes</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Icon name="clock" size="lg" />
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                Active
              </Badge>
            </div>
            <div className="text-3xl font-bold text-amber-600 mb-1">
              <AnimatedCounter value={stats.pending} />
            </div>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Icon name="checkCircle" size="lg" />
              </div>
              <Icon name="sparkles" size="sm" className="text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              <AnimatedCounter value={stats.won} />
            </div>
            <p className="text-sm text-gray-500">Won</p>
          </div>
          
          <div className="group card-elevated p-5 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Icon name="dollar" size="lg" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              ${(stats.wonValue / 100).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Won Value</p>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="card-elevated p-0 overflow-hidden">
          <div className="p-4 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by customer, service, phone..."
                className="pl-10 rounded-xl"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="paused">Paused</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as 'all' | '7days' | '30days' | '90days')
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={loading}
              className="rounded-xl"
            >
              <Icon name="refresh" size="sm" className={cn(loading && "animate-spin")} />
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-3 border-t bg-primary/5 flex items-center gap-4">
              <span className="text-sm font-medium text-primary">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('send')}
                className="text-primary border-primary/30 rounded-xl"
              >
                <Icon name="send" size="xs" className="mr-1" />
                Send All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-200 rounded-xl"
              >
                <Icon name="trash" size="xs" className="mr-1" />
                Delete
              </Button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
              >
                Clear selection
              </button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card className="card-elevated p-0 overflow-hidden">
          {loading && quotes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="spinner" size="2xl" className="text-primary animate-spin" />
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Icon name="fileText" size="3xl" className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No quotes found</h3>
              <p className="text-sm text-gray-500 mb-6">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first quote to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/quotes/new')}
                  className="bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90 rounded-xl"
                >
                  <Icon name="plus" size="sm" className="mr-2" />
                  New Quote
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === paginatedQuotes.length && paginatedQuotes.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('customer_name')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Customer
                          <Icon name="arrowUpDown" size="xs" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('amount')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Amount
                          <Icon name="arrowUpDown" size="xs" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Status
                          <Icon name="arrowUpDown" size="xs" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Created
                          <Icon name="arrowUpDown" size="xs" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedQuotes.map((quote) => {
                      const status = statusConfig[quote.status as string] || statusConfig.pending

                      return (
                        <tr 
                          key={quote.id} 
                          className={cn(
                            "hover:bg-gray-50 transition-colors",
                            selectedIds.includes(quote.id) && "bg-primary/5"
                          )}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(quote.id)}
                              onChange={() => handleSelect(quote.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-semibold text-sm">
                                {quote.customer_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {quote.customer_name || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {quote.customer_phone || quote.customer_email || '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900">{quote.service_type || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">
                              ${((quote.quote_amount || 0) / 100).toFixed(2)}
                            </span>
                            {quote.payment_status === 'paid' && (
                              <Badge className="ml-2 bg-emerald-100 text-emerald-700 border-0 text-xs">
                                Paid
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              status.bg,
                              status.color
                            )}>
                              <Icon name={status.icon} size="xs" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-gray-900">
                                {format(new Date(quote.created_at), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Actions */}
                              <button
                                onClick={() => router.push(`/quotes/${quote.id}`)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="View"
                              >
                                <Icon name="eye" size="sm" />
                              </button>
                              
                              {quote.customer_phone && (
                                <button
                                  onClick={() => handleSendQuote(quote)}
                                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                  title="Send SMS"
                                >
                                  <Icon name="send" size="sm" />
                                </button>
                              )}

                              {/* More Actions Dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === quote.id ? null : quote.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                  <Icon name="more" size="sm" />
                                </button>

                                {openDropdown === quote.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenDropdown(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border z-20 py-1">
                                      <button
                                        onClick={() => {
                                          router.push(`/quotes/${quote.id}`)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Icon name="eye" size="sm" />
                                        View Details
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          router.push(`/quotes/${quote.id}/edit`)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Icon name="fileText" size="sm" />
                                        Edit Quote
                                      </button>

                                      <button
                                        onClick={async () => {
                                          await handleCreatePaymentLink(quote)
                                          setOpenDropdown(null)
                                        }}
                                        disabled={paymentLoading}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Icon name="link" size="sm" />
                                        Copy Payment Link
                                      </button>

                                      {quote.payment_id && (
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/pay/${quote.id}`)
                                            toast({ title: 'Link copied!' })
                                            setOpenDropdown(null)
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                          <Icon name="copy" size="sm" />
                                          Copy Existing Link
                                        </button>
                                      )}

                                      <button
                                        onClick={() => {
                                          router.push(`/inbox?customer=${quote.customer_id}`)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Icon name="message" size="sm" />
                                        Open Conversation
                                      </button>

                                      <div className="border-t my-1" />

                                      <button
                                        onClick={() => {
                                          handleDelete(quote.id)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <Icon name="trash" size="sm" />
                                        Delete Quote
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t bg-gray-50/50 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Showing</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>
                    of {filteredQuotes.length} quotes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl"
                  >
                    <Icon name="chevronLeft" size="sm" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                            currentPage === pageNum
                              ? "bg-primary text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="rounded-xl"
                  >
                    <Icon name="chevronRight" size="sm" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  )
}
