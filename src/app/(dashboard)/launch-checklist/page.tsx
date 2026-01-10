"use client";

import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon, IconName } from '@/components/ui/icon';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  critical?: boolean;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: IconName;
  items: ChecklistItem[];
}

const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'auth',
    title: 'Authentication & Onboarding',
    icon: 'key',
    items: [
      { id: 'auth-signup', label: 'Email/password signup works', critical: true },
      { id: 'auth-verify-send', label: 'Verification email sends', critical: true },
      { id: 'auth-verify-link', label: 'Verification link works', critical: true },
      { id: 'auth-login', label: 'Email/password login works', critical: true },
      { id: 'auth-session', label: 'Session persists on refresh', critical: true },
      { id: 'onboard-business', label: 'Onboarding: Business info saves', critical: true },
      { id: 'onboard-phone', label: 'Onboarding: Phone number purchase works', critical: true },
    ],
  },
  {
    id: 'quotes',
    title: 'Quotes',
    icon: 'fileText',
    items: [
      { id: 'quote-list', label: 'Quote list loads', critical: true },
      { id: 'quote-create', label: 'Create quote works', critical: true },
      { id: 'quote-notify-sms', label: 'Quote notification SMS sends', critical: true },
    ],
  },
  {
    id: 'sequences',
    title: 'Sequences',
    icon: 'bolt',
    items: [
      { id: 'seq-list', label: 'Sequence list loads' },
      { id: 'seq-create', label: 'Create sequence works' },
      { id: 'seq-steps', label: 'Add/remove steps works' },
    ],
  },
  {
    id: 'inbox',
    title: 'Inbox',
    icon: 'message',
    items: [
      { id: 'inbox-list', label: 'Conversation list loads', critical: true },
      { id: 'inbox-reply', label: 'Reply sends successfully', critical: true },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'shield',
    items: [
      { id: 'sec-rls', label: 'RLS enabled on all tables', critical: true },
      { id: 'sec-isolation', label: 'User A cannot see User B data', critical: true },
      { id: 'sec-unauth', label: 'Unauthenticated users blocked', critical: true },
    ],
  },
  {
    id: 'go-live',
    title: 'Go-Live',
    icon: 'rocket',
    items: [
      { id: 'live-backup', label: 'Final database backup created', critical: true },
      { id: 'live-ssl', label: 'SSL certificate active', critical: true },
      { id: 'live-stripe', label: 'Stripe in live mode', critical: true },
      { id: 'live-twilio', label: 'Twilio in production', critical: true },
    ],
  },
];

const STORAGE_KEY = 'selestial-launch-checklist';

// Lazy initializer for localStorage
function getInitialCheckedItems(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function LaunchChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(getInitialCheckedItems);
  const isHydratedRef = useRef(false);

  // Save to localStorage whenever checkedItems change (after hydration)
  useEffect(() => {
    // Skip first render to avoid saving initial state
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    if (confirm('Reset all checklist items? This cannot be undone.')) {
      setCheckedItems({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calculate stats
  const totalItems = CHECKLIST_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  const criticalItems = CHECKLIST_SECTIONS.flatMap((s) =>
    s.items.filter((i) => i.critical)
  );
  const criticalChecked = criticalItems.filter((i) => checkedItems[i.id]).length;
  const criticalProgress = Math.round((criticalChecked / criticalItems.length) * 100);

  const getSectionProgress = (section: ChecklistSection) => {
    const checked = section.items.filter((i) => checkedItems[i.id]).length;
    return { checked, total: section.items.length };
  };

  return (
    <Layout title="Launch Checklist">
      <div className="max-w-4xl space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Overall Progress</h3>
              <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                {checkedCount} / {totalItems}
              </Badge>
            </div>
            <Progress value={progress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </Card>

          <Card className="p-6 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="warning" size="sm" className="text-destructive" />
                <h3 className="font-semibold">Critical Items</h3>
              </div>
              <Badge variant={criticalProgress === 100 ? 'default' : 'destructive'}>
                {criticalChecked} / {criticalItems.length}
              </Badge>
            </div>
            <Progress
              value={criticalProgress}
              className="h-3 mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {criticalProgress === 100
                ? 'All critical items verified!'
                : `${criticalItems.length - criticalChecked} critical items remaining`}
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={resetChecklist} className="gap-2">
            <Icon name="refresh" size="sm" />
            Reset Checklist
          </Button>
        </div>

        {/* Checklist Sections */}
        <Card>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <Accordion type="multiple" className="w-full" defaultValue={['auth', 'security']}>
              {CHECKLIST_SECTIONS.map((section) => {
                const { checked, total } = getSectionProgress(section);
                const isComplete = checked === total;

                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              isComplete
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Icon name={section.icon} size="sm" />
                          </div>
                          <span className="font-medium">{section.title}</span>
                        </div>
                        <Badge variant={isComplete ? 'default' : 'secondary'}>
                          {checked} / {total}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-3 pt-2">
                        {section.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => toggleItem(item.id)}
                          >
                            <Checkbox
                              id={item.id}
                              checked={checkedItems[item.id] || false}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={item.id}
                                  className={`text-sm cursor-pointer ${
                                    checkedItems[item.id]
                                      ? 'text-muted-foreground line-through'
                                      : ''
                                  }`}
                                >
                                  {item.label}
                                </label>
                                {item.critical && (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {checkedItems[item.id] ? (
                              <Icon name="checkCircle" size="sm" className="text-primary shrink-0" />
                            ) : (
                              <Icon name="circle" size="sm" className="text-muted-foreground/50 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </Card>
      </div>
    </Layout>
  );
}
