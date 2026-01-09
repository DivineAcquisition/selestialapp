'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UsageData {
  sms: {
    sent: number;
    delivered: number;
    failed: number;
    segments: number;
    cost: number;
    included: number;
    overage: number;
  };
  payments: {
    count: number;
    volume: number;
    platformFees: number;
    netToYou: number;
  };
  period: {
    start: string;
    end: string;
  };
}

interface UsageDashboardProps {
  data?: UsageData;
  planName?: string;
}

export function UsageDashboard({ data, planName = 'Pro' }: UsageDashboardProps) {
  const [period, setPeriod] = React.useState('current');

  // Mock data for display
  const usage = data || {
    sms: {
      sent: 847,
      delivered: 832,
      failed: 15,
      segments: 923,
      cost: 23.08,
      included: 500,
      overage: 423,
    },
    payments: {
      count: 34,
      volume: 12450,
      platformFees: 62.25,
      netToYou: 11987.75,
    },
    period: {
      start: '2026-01-01',
      end: '2026-01-31',
    },
  };

  const smsUsagePercent = Math.min(
    (usage.sms.sent / usage.sms.included) * 100,
    100
  );
  const smsOverage = Math.max(usage.sms.sent - usage.sms.included, 0);
  const smsOverageCost = smsOverage * 0.025;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Usage & Billing</h2>
          <p className="text-sm text-muted-foreground">
            Track your SMS and payment processing usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="last">Last Month</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Icon name="download" size="sm" className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* SMS Sent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SMS Sent
              </CardTitle>
              <Icon name="message" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage.sms.sent}</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={smsUsagePercent} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground">
                  {usage.sms.included} incl.
                </span>
              </div>
              {smsOverage > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  +{smsOverage} overage (${smsOverageCost.toFixed(2)})
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* SMS Cost */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                SMS Charges
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon name="info" size="sm" className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>$0.025 per SMS segment</p>
                    <p className="text-xs text-muted-foreground">
                      {usage.sms.included} free with {planName}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${usage.sms.cost.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {usage.sms.segments} segments this period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Volume */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payment Volume
              </CardTitle>
              <Icon name="creditCard" size="sm" className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${usage.payments.volume.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {usage.payments.count} transactions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Platform Fees */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Processing Fees
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon name="info" size="sm" className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>0.5% platform fee on payments</p>
                    <p className="text-xs text-muted-foreground">
                      Plus standard Stripe fees (2.9% + 30¢)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${usage.payments.platformFees.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                You received ${usage.payments.netToYou.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Current Bill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Period Summary</span>
              <Badge variant="secondary">
                <Icon name="calendar" size="xs" className="mr-1" />
                {new Date(usage.period.start).toLocaleDateString()} -{' '}
                {new Date(usage.period.end).toLocaleDateString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">SMS Messages</div>
                    <div className="text-xs text-muted-foreground">
                      Included: {usage.sms.included} | Overage: {smsOverage}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {usage.sms.segments} segments
                  </TableCell>
                  <TableCell className="text-right">$0.025/segment</TableCell>
                  <TableCell className="text-right font-medium">
                    ${smsOverageCost.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Payment Processing</div>
                    <div className="text-xs text-muted-foreground">
                      0.5% platform fee
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    ${usage.payments.volume.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">0.5%</TableCell>
                  <TableCell className="text-right font-medium">
                    ${usage.payments.platformFees.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="font-semibold">
                    Total Usage Charges
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    ${(smsOverageCost + usage.payments.platformFees).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Next invoice</p>
                  <p className="text-sm text-muted-foreground">
                    Charges will be added to your February 1st invoice
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Invoices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="message" size="sm" className="text-violet-600" />
                  SMS Pricing
                </h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Per SMS segment</span>
                    <span className="font-medium">$0.025</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Included in Pro</span>
                    <span className="font-medium">500/month</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Included in Starter</span>
                    <span className="font-medium">100/month</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="creditCard" size="sm" className="text-violet-600" />
                  Payment Processing
                </h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span className="font-medium">0.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Stripe fees</span>
                    <span className="font-medium">2.9% + 30¢</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Payout timing</span>
                    <span className="font-medium">2 business days</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
