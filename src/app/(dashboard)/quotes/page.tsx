"use client"

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import { useQuotes } from '@/hooks/useQuotes'
import { usePayments } from '@/hooks/usePayments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Send,
  Link2,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  Copy,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

type SortField = 'created_at' | 'amount' | 'customer_name' | 'status'
type SortOrder = 'asc' | 'desc'

const statusConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  pending: { 
    label: 'Pending', 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200' 
  },
  new: { 
    label: 'New', 
    icon: Clock, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200' 
  },
  active: { 
    label: 'Active', 
    icon: Clock, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50 border-amber-200' 
  },
  sent: { 
    label: 'Sent', 
    icon: Send, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 border-blue-200' 
  },
  viewed: { 
    label: 'Viewed', 
    icon: Eye, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50 border-purple-200' 
  },
  won: { 
    label: 'Won', 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50 border-emerald-200' 
  },
  lost: { 
    label: 'Lost', 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50 border-red-200' 
  },
  paused: { 
    label: 'Paused', 
    icon: AlertCircle, 
    color: 'text-gray-600', 
    bg: 'bg-gray-50 border-gray-200' 
  },
  expired: { 
    label: 'Expired', 
    icon: AlertCircle, 
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
      let aVal: any, bVal: any

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
    } catch (error) {
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
    } catch (error) {
      toast({ title: 'Failed to send', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    
    try {
      await deleteQuote(id)
      toast({ title: 'Quote deleted' })
    } catch (error) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
            <p className="text-gray-500 mt-1">
              {stats.total} total • ${(stats.totalValue / 100).toLocaleString()} pipeline value
            </p>
          </div>

          <Button
            onClick={() => router.push('/quotes/new')}
            className="bg-[#5500FF] hover:bg-[#4400CC] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Quotes</span>
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Pending</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Won</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.won}</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Won Value</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ${(stats.wonValue / 100).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by customer, service, phone..."
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5500FF]"
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
                setDateFilter(e.target.value as any)
                setCurrentPage(1)
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5500FF]"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
            </select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="px-4 py-3 border-t bg-[#5500FF]/5 flex items-center gap-4">
              <span className="text-sm font-medium text-[#5500FF]">
                {selectedIds.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('send')}
                className="text-[#5500FF] border-[#5500FF]/30"
              >
                <Send className="w-3 h-3 mr-1" />
                Send All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-200"
              >
                <Trash2 className="w-3 h-3 mr-1" />
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading && quotes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#5500FF] animate-spin" />
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No quotes found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first quote to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/quotes/new')}
                  className="bg-[#5500FF] hover:bg-[#4400CC] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Quote
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === paginatedQuotes.length && paginatedQuotes.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-[#5500FF] focus:ring-[#5500FF]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('customer_name')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Customer
                          <ArrowUpDown className="w-3 h-3" />
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
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Status
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-900"
                        >
                          Created
                          <ArrowUpDown className="w-3 h-3" />
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
                      const StatusIcon = status.icon

                      return (
                        <tr 
                          key={quote.id} 
                          className={cn(
                            "hover:bg-gray-50 transition-colors",
                            selectedIds.includes(quote.id) && "bg-[#5500FF]/5"
                          )}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(quote.id)}
                              onChange={() => handleSelect(quote.id)}
                              className="w-4 h-4 rounded border-gray-300 text-[#5500FF] focus:ring-[#5500FF]"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#5500FF]/10 rounded-full flex items-center justify-center text-[#5500FF] font-medium text-sm">
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
                              <span className="ml-2 px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">
                                Paid
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              status.bg,
                              status.color
                            )}>
                              <StatusIcon className="w-3 h-3" />
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
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {quote.customer_phone && (
                                <button
                                  onClick={() => handleSendQuote(quote)}
                                  className="p-2 text-gray-400 hover:text-[#5500FF] hover:bg-[#5500FF]/10 rounded-lg"
                                  title="Send SMS"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}

                              {/* More Actions Dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === quote.id ? null : quote.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {openDropdown === quote.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenDropdown(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                                      <button
                                        onClick={() => {
                                          router.push(`/quotes/${quote.id}`)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                      </button>
                                      
                                      <button
                                        onClick={() => {
                                          router.push(`/quotes/${quote.id}/edit`)
                                          setOpenDropdown(null)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <FileText className="w-4 h-4" />
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
                                        <Link2 className="w-4 h-4" />
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
                                          <Copy className="w-4 h-4" />
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
                                        <MessageSquare className="w-4 h-4" />
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
                                        <Trash2 className="w-4 h-4" />
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
              <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t bg-gray-50 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Showing</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-sm"
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
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                            "w-8 h-8 rounded text-sm font-medium",
                            currentPage === pageNum
                              ? "bg-[#5500FF] text-white"
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
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
