"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatedCounter } from '@/components/ui/text-effects';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatPhone, formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { getRiskLevelColor, getRiskLevelText, type RiskLevel } from '@/lib/sequences/health-score';

export default function CustomersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Map status filter to health score ranges
  const getHealthFilters = () => {
    switch (statusFilter) {
      case 'active':
        return { minHealth: 70 };
      case 'at_risk':
        return { minHealth: 40, maxHealth: 69 };
      case 'churned':
        return { maxHealth: 39 };
      default:
        return {};
    }
  };
  
  const { customers, stats, loading, refetch } = useCustomers({
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    ...getHealthFilters(),
  });
  
  const handleSelectAll = useCallback(() => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  }, [selectedCustomers.length, customers]);
  
  const handleSelectCustomer = useCallback((id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  }, []);
  
  const handleBulkAction = useCallback((action: string) => {
    toast({
      title: `${action} ${selectedCustomers.length} customers`,
      description: 'This feature is coming soon',
    });
    setSelectedCustomers([]);
  }, [selectedCustomers.length, toast]);

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
              <Icon name="users" size="xl" className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-500">Manage and track your customer relationships</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 rounded-xl"
              onClick={() => router.push('/customers/import')}
            >
              <Icon name="upload" size="sm" />
              Import
            </Button>
            <Button 
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
              onClick={() => setShowCreateModal(true)}
            >
              <Icon name="plus" size="sm" />
              Add Customer
            </Button>
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

        {/* Filters & Bulk Actions */}
        <Card className="card-elevated p-0 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">Customer List</h2>
                {selectedCustomers.length > 0 && (
                  <Badge className="bg-primary/10 text-primary border-0">
                    {selectedCustomers.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-[200px] rounded-xl border-gray-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px] rounded-xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetch()} className="rounded-xl">
                  <Icon name="refresh" size="sm" />
                </Button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Bulk actions:</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-lg"
                  onClick={() => handleBulkAction('Message')}
                >
                  <Icon name="message" size="xs" />
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-lg"
                  onClick={() => handleBulkAction('Add to sequence')}
                >
                  <Icon name="workflow" size="xs" />
                  Add to Sequence
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-lg"
                  onClick={() => handleBulkAction('Tag')}
                >
                  <Icon name="tag" size="xs" />
                  Add Tag
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 rounded-lg"
                  onClick={() => handleBulkAction('Export')}
                >
                  <Icon name="download" size="xs" />
                  Export
                </Button>
              </div>
            )}
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
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedCustomers.length === customers.length && customers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                      className={cn(
                        "cursor-pointer hover:bg-gray-50 transition-colors",
                        selectedCustomers.includes(customer.id) && "bg-primary/5"
                      )}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() => handleSelectCustomer(customer.id)}
                        />
                      </TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg">
                              <Icon name="workflow" size="sm" className="mr-2" />
                              Add to Sequence
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg">
                              <Icon name="tag" size="sm" className="mr-2" />
                              Add Tag
                            </DropdownMenuItem>
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
      
      {/* Create Customer Modal */}
      <CreateCustomerModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          refetch();
          setShowCreateModal(false);
        }}
      />
    </Layout>
  );
}

// Create Customer Modal Component
function CreateCustomerModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
    source: 'manual',
    notes: '',
  });
  
  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      return `(${digits}`;
    }
    return '';
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim()) {
      toast({ title: 'First name is required', variant: 'destructive' });
      return;
    }
    
    if (!formData.phone && !formData.email) {
      toast({ title: 'Phone or email is required', variant: 'destructive' });
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create customer');
      }
      
      toast({ title: 'Customer created successfully' });
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address_line1: '',
        city: '',
        state: '',
        zip_code: '',
        source: 'manual',
        notes: '',
      });
      onSuccess();
    } catch (error) {
      toast({ 
        title: 'Error creating customer', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="userPlus" size="lg" className="text-primary" />
            Add New Customer
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Last Name
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Smith"
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: formatPhoneInput(e.target.value) }))}
                placeholder="(555) 123-4567"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Address
            </label>
            <Input
              value={formData.address_line1}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
              placeholder="123 Main St"
              className="rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="City"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                State
              </label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="CA"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                ZIP
              </label>
              <Input
                value={formData.zip_code}
                onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                placeholder="90210"
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Lead Source
            </label>
            <Select 
              value={formData.source} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, source: v }))}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="angi">Angi</SelectItem>
                <SelectItem value="thumbtack">Thumbtack</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this customer..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="gap-2 rounded-xl bg-gradient-to-r from-primary to-[#9D96FF] hover:opacity-90"
            >
              {saving ? (
                <>
                  <Icon name="spinner" size="sm" className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Icon name="plus" size="sm" />
                  Create Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
