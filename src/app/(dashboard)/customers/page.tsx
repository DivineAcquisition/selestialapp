"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { useCustomers } from '@/hooks/useCustomers';
import { format } from 'date-fns';
import { formatPhone, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { customers, stats, loading, refetch } = useCustomers({
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (score >= 30) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 70) return <Icon name="trendUp" size="xs" />;
    if (score >= 40) return <Icon name="heart" size="xs" />;
    return <Icon name="trendDown" size="xs" />;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-700 border-0">VIP</Badge>;
      case 'recurring':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Recurring</Badge>;
      case 'at_risk':
        return <Badge className="bg-orange-100 text-orange-700 border-0">At Risk</Badge>;
      case 'lost':
        return <Badge className="bg-red-100 text-red-700 border-0">Lost</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">One-time</Badge>;
    }
  };

  return (
    <Layout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Icon name="users" size="xl" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500">Manage and track your customer relationships</p>
          </div>
        </div>

        {/* Stats Cards - Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon name="users" size="lg" />
              </div>
              <Icon name="arrowRight" size="sm" className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.total} />
            </div>
            <p className="text-sm text-gray-500">Total Customers</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Icon name="userCheck" size="lg" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                Active
              </Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.recurring} />
            </div>
            <p className="text-sm text-gray-500">Recurring</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <Icon name="warning" size="lg" />
              </div>
              <Icon name="sparkles" size="sm" className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              <AnimatedCounter value={stats.atRisk} />
            </div>
            <p className="text-sm text-gray-500">At Risk</p>
          </div>
          
          <div className="group card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-gray-500 group-hover:text-white transition-colors">
                <Icon name="clock" size="lg" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              <AnimatedCounter value={stats.dormant} />
            </div>
            <p className="text-sm text-gray-500">Dormant (30+ days)</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-elevated p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
            <h2 className="font-semibold text-gray-900">Customer List</h2>
            <div className="flex gap-3">
              <div className="relative">
                <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[250px] rounded-xl border-gray-200"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] rounded-xl">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refetch} className="rounded-xl">
                <Icon name="refresh" size="sm" />
              </Button>
            </div>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="spinner" size="2xl" className="animate-spin text-primary" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="users" size="2xl" className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Customers will appear here when synced via webhooks or created from quotes
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-medium">Customer</TableHead>
                    <TableHead className="font-medium">Type</TableHead>
                    <TableHead className="font-medium">Health</TableHead>
                    <TableHead className="font-medium">Total Spent</TableHead>
                    <TableHead className="font-medium">Jobs</TableHead>
                    <TableHead className="font-medium">Last Service</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{formatPhone(customer.phone)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(customer.customer_type)}
                      </TableCell>
                      <TableCell>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border",
                          getHealthColor(customer.health_score)
                        )}>
                          {getHealthIcon(customer.health_score)}
                          {customer.health_score}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(customer.total_spent / 100)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-700">{customer.total_jobs}</span>
                      </TableCell>
                      <TableCell>
                        {customer.last_service_at ? (
                          <span className="text-sm text-gray-600">
                            {format(new Date(customer.last_service_at), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="rounded-lg">
                              <Icon name="more" size="sm" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="rounded-lg">
                              <Icon name="message" size="sm" className="mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">
                              <Icon name="phone" size="sm" className="mr-2" />
                              Call
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem className="rounded-lg">
                                <Icon name="email" size="sm" className="mr-2" />
                                Email
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
