# Selestial Analytics Sync

This directory contains scripts for syncing analytics data from PostgreSQL to Iceberg for historical analysis.

## Overview

The analytics system uses a hybrid approach:
- **Real-time data**: Stored in PostgreSQL for instant access
- **Historical data**: Synced to Iceberg for long-term storage and big data analytics

## Setup

### 1. Install Dependencies

Using uv (recommended):
```bash
uv init analytics-sync
cd analytics-sync
uv add pyiceberg pyarrow pandas supabase python-dotenv
```

Or using pip:
```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file or set environment variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Iceberg Configuration
ICEBERG_WAREHOUSE=your-warehouse-name
ICEBERG_TOKEN=your-iceberg-token
ICEBERG_S3_ACCESS_KEY=your-s3-access-key
ICEBERG_S3_SECRET_KEY=your-s3-secret-key
ICEBERG_S3_REGION=us-west-2
ICEBERG_S3_ENDPOINT=https://your-project.storage.supabase.co/storage/v1/s3
ICEBERG_CATALOG_URI=https://your-project.storage.supabase.co/storage/v1/iceberg
```

## Usage

### Initial Setup (Create Iceberg Tables)

```bash
python iceberg_sync.py --setup
```

### Sync All Data (Last 7 Days)

```bash
python iceberg_sync.py
```

### Sync Specific Data Type

```bash
# Sync only daily aggregates
python iceberg_sync.py --sync-type aggregates

# Sync only events
python iceberg_sync.py --sync-type events

# Sync only metrics
python iceberg_sync.py --sync-type metrics
```

### Sync Custom Date Range

```bash
# Sync last 30 days
python iceberg_sync.py --days 30
```

## Scheduling

### Using Cron

Add to your crontab to run daily at 2 AM:
```cron
0 2 * * * cd /path/to/scripts/analytics && python iceberg_sync.py --days 1
```

### Using Supabase Edge Functions

You can create a Supabase Edge Function to trigger the sync:

```typescript
// supabase/functions/sync-analytics/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Trigger your sync service
  const response = await fetch('https://your-sync-service.com/sync', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('SYNC_API_KEY')}` }
  })
  
  return new Response(JSON.stringify({ status: 'sync triggered' }))
})
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ analytics_events│  │ realtime_metrics│  │daily_aggregates │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │           │
└───────────┼────────────────────┼─────────────────────┼───────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Sync Script (Python)                        │
│                                                                  │
│  • Reads unsynced data from PostgreSQL                          │
│  • Transforms to Iceberg-compatible format                       │
│  • Appends to Iceberg tables                                     │
│  • Marks records as synced                                       │
└─────────────────────────────────────────────────────────────────┘
            │                    │                     │
            ▼                    ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Storage (S3)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ analytics.events│  │ analytics.metrics│  │analytics.daily  │  │
│  │   (Iceberg)     │  │    (Iceberg)     │  │   (Iceberg)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Querying Iceberg Data

### Using Python

```python
from pyiceberg.catalog import load_catalog

catalog = load_catalog("supabase", ...)
table = catalog.load_table(("analytics", "daily_aggregates"))

# Scan all data
df = table.scan().to_pandas()

# Filter by date
df = table.scan(
    row_filter="date >= '2024-01-01'"
).to_pandas()
```

### Using SQL (via DuckDB)

```python
import duckdb

# Connect to Iceberg via DuckDB
conn = duckdb.connect()
conn.execute("""
    INSTALL iceberg;
    LOAD iceberg;
""")

# Query
result = conn.execute("""
    SELECT * FROM iceberg_scan('s3://your-bucket/analytics/daily_aggregates')
    WHERE date >= '2024-01-01'
""").fetchdf()
```

## Troubleshooting

### Connection Errors

1. Check that your Supabase URL and keys are correct
2. Verify the Iceberg credentials are valid
3. Ensure the S3 endpoint is accessible

### Sync Failures

1. Check the `analytics_sync_log` table for error details
2. Verify you have sufficient storage quota
3. Check for schema mismatches

### Performance

For large datasets:
1. Increase batch size in the sync script
2. Run syncs during off-peak hours
3. Consider partitioning Iceberg tables by date
