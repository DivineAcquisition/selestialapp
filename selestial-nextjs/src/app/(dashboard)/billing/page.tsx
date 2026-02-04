"use client";

import Layout from '@/components/layout/Layout';
import SubscriptionCard from '@/components/settings/SubscriptionCard';

export default function BillingPage() {
  return (
    <Layout title="Billing">
      <div className="max-w-2xl">
        <SubscriptionCard />
      </div>
    </Layout>
  );
}
