"use client";

import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminTestPage() {
  return (
    <Layout title="Admin Test">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Admin Test Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page is for testing and administrative purposes.
          </p>
          <Button variant="outline" className="w-full" onClick={() => console.log('Test button clicked')}>
            Test Button
          </Button>
        </CardContent>
      </Card>
    </Layout>
  );
}
