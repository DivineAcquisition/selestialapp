"use client";

import Layout from '@/components/layout/Layout';
import ConnectionsSettings from '@/components/settings/ConnectionsSettings';

export default function ConnectionsPage() {
  return (
    <Layout title="Connections">
      <div className="max-w-4xl">
        <ConnectionsSettings />
      </div>
    </Layout>
  );
}
