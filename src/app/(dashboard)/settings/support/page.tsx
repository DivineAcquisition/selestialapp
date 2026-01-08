'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Icon, IconName } from '@/components/ui/icon';
import Layout from '@/components/layout/Layout';

// Form validation schema
const supportFormSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)'),
  priority: z.string(),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

// Support categories
const categories: { value: string; label: string; icon: IconName }[] = [
  { value: 'bug', label: 'Bug Report', icon: 'bug' },
  { value: 'feature', label: 'Feature Request', icon: 'lightbulb' },
  { value: 'billing', label: 'Billing & Payments', icon: 'creditCard' },
  { value: 'account', label: 'Account & Settings', icon: 'settings' },
  { value: 'integration', label: 'Integrations', icon: 'sparkles' },
  { value: 'other', label: 'General Question', icon: 'help' },
];

// Quick links
const quickLinks: { title: string; description: string; icon: IconName; href: string }[] = [
  {
    title: 'Documentation',
    description: 'Browse guides and tutorials',
    icon: 'bookOpen',
    href: 'https://docs.selestial.com',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step walkthroughs',
    icon: 'video',
    href: 'https://selestial.com/tutorials',
  },
  {
    title: 'API Reference',
    description: 'Technical documentation for developers',
    icon: 'fileText',
    href: 'https://docs.selestial.com/api',
  },
  {
    title: 'Community',
    description: 'Join our community forum',
    icon: 'message',
    href: 'https://community.selestial.com',
  },
];

// FAQ items
const faqItems = [
  {
    question: 'How do I import my existing customers?',
    answer:
      'Go to Customers → Import and upload a CSV file. We support imports from most CRM systems including ServiceTitan, Jobber, and Housecall Pro.',
  },
  {
    question: 'Can I customize the SMS templates?',
    answer:
      'Yes! Navigate to Sequences → Templates to edit any message. You can use variables like {{first_name}}, {{service_type}}, and {{appointment_date}}.',
  },
  {
    question: 'How does the health score work?',
    answer:
      "Health scores (0-100) are calculated based on recency of last job, engagement with messages, booking frequency, and payment history. Scores below 50 trigger at-risk alerts.",
  },
  {
    question: 'What integrations do you support?',
    answer:
      'We integrate with Stripe, Twilio, Google Calendar, QuickBooks, and most major home service CRMs. Check Settings → Integrations for the full list.',
  },
];

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      category: '',
      subject: '',
      description: '',
      priority: 'normal',
    },
  });

  async function onSubmit(data: SupportFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit support request');
      }

      setIsSuccess(true);
      toast.success('Support request submitted!', {
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        setIsSuccess(false);
      }, 3000);
    } catch {
      toast.error('Something went wrong', {
        description: 'Please try again or email us directly at support@selestial.io',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout title="Help & Support">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 bg-gradient-to-br from-primary to-[#9D96FF] rounded-xl shadow-lg shadow-primary/20">
            <Icon name="help" size="xl" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-500">
              Get help, report issues, or request new features
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="card-elevated rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="message" size="lg" className="text-primary" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you within 24
                    hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                        <Icon name="checkCircle" size="2xl" className="text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground max-w-sm">
                        Thanks for reaching out. Our team will review your request
                        and respond within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        {/* Category */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem
                                      key={cat.value}
                                      value={cat.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Icon name={cat.icon} size="sm" className="text-muted-foreground" />
                                        {cat.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Priority */}
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                                      Low - General question
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="normal">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                                      Normal - Need help soon
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="high">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                                      High - Affecting my work
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="urgent">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-red-500" />
                                      Urgent - System is down
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Subject */}
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Brief summary of your issue"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Description */}
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide as much detail as possible. Include steps to reproduce if reporting a bug."
                                  rows={6}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Include any relevant details, screenshots, or error
                                messages
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Submit */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Or email us directly at{' '}
                            <a
                              href="mailto:support@selestial.io"
                              className="text-primary hover:underline"
                            >
                              support@selestial.io
                            </a>
                          </p>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Icon name="spinner" size="sm" className="mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Icon name="send" size="sm" className="mr-2" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="card-elevated rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="help" size="lg" className="text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {faqItems.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                        onClick={() =>
                          setExpandedFaq(expandedFaq === index ? null : index)
                        }
                      >
                        <span className="font-medium">{item.question}</span>
                        <motion.span
                          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon name="chevronDown" size="sm" className="text-muted-foreground" />
                        </motion.span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: expandedFaq === index ? 'auto' : 0,
                          opacity: expandedFaq === index ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 text-muted-foreground">
                          {item.answer}
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="card-elevated rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted transition-colors group"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon name={link.icon} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">
                            {link.title}
                          </span>
                          <Icon name="externalLink" size="xs" className="text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {link.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="card-elevated rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600">
                      All Systems Operational
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">API</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">SMS Delivery</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payments</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        Operational
                      </Badge>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <a
                    href="https://status.selestial.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View status page
                    <Icon name="externalLink" size="xs" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="card-elevated rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <a
                      href="mailto:support@selestial.io"
                      className="text-primary hover:underline"
                    >
                      support@selestial.io
                    </a>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="font-medium">Within 24 hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Business Hours</p>
                    <p>Mon-Fri, 9am-6pm EST</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
