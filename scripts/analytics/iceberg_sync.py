#!/usr/bin/env python3
"""
Selestial Analytics - Iceberg Sync Script

This script syncs analytics data from PostgreSQL to Iceberg tables for historical analysis.
Run this as a scheduled job (e.g., daily via cron or Supabase Edge Function).

Usage:
    python iceberg_sync.py [--days N] [--sync-type TYPE]

Environment Variables Required:
    - SUPABASE_URL: Supabase project URL
    - SUPABASE_SERVICE_ROLE_KEY: Service role key for database access
    - ICEBERG_WAREHOUSE: Iceberg warehouse name
    - ICEBERG_TOKEN: Iceberg catalog token
    - ICEBERG_S3_ACCESS_KEY: S3 access key
    - ICEBERG_S3_SECRET_KEY: S3 secret key
    - ICEBERG_S3_ENDPOINT: S3 endpoint URL
    - ICEBERG_CATALOG_URI: Iceberg catalog URI
"""

import os
import sys
import argparse
import datetime
from typing import Optional

# ============================================================================
# CONFIGURATION
# ============================================================================

# Supabase Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://thbegonbonhswsbgszxi.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Iceberg Configuration
PROJECT_REF = "thbegonbonhswsbgszxi"
WAREHOUSE = os.environ.get("ICEBERG_WAREHOUSE", "selestialuusers")
TOKEN = os.environ.get("ICEBERG_TOKEN", "sb_secret_J__mwFClC1FxNpsw3kuZhA_VQ5MNtga")
S3_ACCESS_KEY = os.environ.get("ICEBERG_S3_ACCESS_KEY", "5f2d7f13ef20ee5dabf84ee75f773b45")
S3_SECRET_KEY = os.environ.get("ICEBERG_S3_SECRET_KEY", "87999a1582ffda77d389ba2aa1d792f932eddcb397b28b47f30b558fcdea2175")
S3_REGION = os.environ.get("ICEBERG_S3_REGION", "us-west-2")
S3_ENDPOINT = os.environ.get("ICEBERG_S3_ENDPOINT", f"https://{PROJECT_REF}.storage.supabase.co/storage/v1/s3")
CATALOG_URI = os.environ.get("ICEBERG_CATALOG_URI", f"https://{PROJECT_REF}.storage.supabase.co/storage/v1/iceberg")


def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import pyiceberg
        import pyarrow
        import pandas
        from supabase import create_client
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("\nInstall required packages:")
        print("  pip install pyiceberg pyarrow pandas supabase")
        return False


def get_iceberg_catalog():
    """Initialize and return the Iceberg catalog."""
    from pyiceberg.catalog import load_catalog
    
    catalog = load_catalog(
        "supabase",
        type="rest",
        warehouse=WAREHOUSE,
        uri=CATALOG_URI,
        token=TOKEN,
        **{
            "py-io-impl": "pyiceberg.io.pyarrow.PyArrowFileIO",
            "s3.endpoint": S3_ENDPOINT,
            "s3.access-key-id": S3_ACCESS_KEY,
            "s3.secret-access-key": S3_SECRET_KEY,
            "s3.region": S3_REGION,
            "s3.force-virtual-addressing": False,
        },
    )
    
    return catalog


def get_supabase_client():
    """Initialize and return the Supabase client."""
    from supabase import create_client
    
    if not SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
    
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def create_analytics_tables(catalog):
    """Create Iceberg tables for analytics data if they don't exist."""
    import pyarrow as pa
    
    # Create namespace if not exists
    print("Creating namespace 'analytics'...")
    catalog.create_namespace_if_not_exists("analytics")
    
    # Schema for daily aggregates
    daily_aggregates_schema = pa.schema([
        pa.field("id", pa.string()),
        pa.field("business_id", pa.string()),
        pa.field("date", pa.date32()),
        pa.field("quotes_created", pa.int32()),
        pa.field("quotes_won", pa.int32()),
        pa.field("quotes_lost", pa.int32()),
        pa.field("quote_value_total", pa.float64()),
        pa.field("quote_value_won", pa.float64()),
        pa.field("quote_conversion_rate", pa.float64()),
        pa.field("customers_new", pa.int32()),
        pa.field("customers_active", pa.int32()),
        pa.field("customers_at_risk", pa.int32()),
        pa.field("messages_sent", pa.int32()),
        pa.field("messages_received", pa.int32()),
        pa.field("payments_count", pa.int32()),
        pa.field("payments_volume", pa.float64()),
        pa.field("bookings_created", pa.int32()),
        pa.field("booking_revenue", pa.float64()),
        pa.field("synced_at", pa.timestamp("ms")),
    ])
    
    print("Creating table 'daily_aggregates'...")
    catalog.create_table_if_not_exists(
        ("analytics", "daily_aggregates"),
        schema=daily_aggregates_schema
    )
    
    # Schema for analytics events
    events_schema = pa.schema([
        pa.field("id", pa.string()),
        pa.field("business_id", pa.string()),
        pa.field("event_name", pa.string()),
        pa.field("event_category", pa.string()),
        pa.field("event_data", pa.string()),  # JSON as string
        pa.field("user_id", pa.string()),
        pa.field("session_id", pa.string()),
        pa.field("source", pa.string()),
        pa.field("event_timestamp", pa.timestamp("ms")),
        pa.field("event_date", pa.date32()),
    ])
    
    print("Creating table 'events'...")
    catalog.create_table_if_not_exists(
        ("analytics", "events"),
        schema=events_schema
    )
    
    # Schema for realtime metrics (hourly snapshots)
    metrics_schema = pa.schema([
        pa.field("id", pa.string()),
        pa.field("business_id", pa.string()),
        pa.field("metric_name", pa.string()),
        pa.field("metric_category", pa.string()),
        pa.field("time_bucket", pa.timestamp("ms")),
        pa.field("granularity", pa.string()),
        pa.field("value_count", pa.int64()),
        pa.field("value_sum", pa.float64()),
        pa.field("value_avg", pa.float64()),
        pa.field("value_min", pa.float64()),
        pa.field("value_max", pa.float64()),
    ])
    
    print("Creating table 'metrics'...")
    catalog.create_table_if_not_exists(
        ("analytics", "metrics"),
        schema=metrics_schema
    )
    
    print("All analytics tables created.")


def sync_daily_aggregates(catalog, supabase, days: int = 7):
    """Sync daily aggregates to Iceberg."""
    import pyarrow as pa
    import pandas as pd
    import json
    
    print(f"\nSyncing daily aggregates for the last {days} days...")
    
    # Get unsynced aggregates
    start_date = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime('%Y-%m-%d')
    
    response = supabase.table('daily_aggregates').select('*').gte('date', start_date).eq('synced_to_iceberg', False).execute()
    
    if not response.data:
        print("No unsynced daily aggregates found.")
        return 0
    
    print(f"Found {len(response.data)} records to sync.")
    
    # Convert to PyArrow table
    df = pd.DataFrame(response.data)
    
    # Convert date strings to date objects
    df['date'] = pd.to_datetime(df['date']).dt.date
    df['synced_at'] = datetime.datetime.now()
    
    # Select only the columns we need
    columns_to_sync = [
        'id', 'business_id', 'date', 'quotes_created', 'quotes_won', 'quotes_lost',
        'quote_value_total', 'quote_value_won', 'quote_conversion_rate',
        'customers_new', 'customers_active', 'customers_at_risk',
        'messages_sent', 'messages_received', 'payments_count', 'payments_volume',
        'bookings_created', 'booking_revenue', 'synced_at'
    ]
    
    # Fill missing columns with defaults
    for col in columns_to_sync:
        if col not in df.columns:
            if col in ['quote_value_total', 'quote_value_won', 'quote_conversion_rate', 'payments_volume', 'booking_revenue']:
                df[col] = 0.0
            elif col == 'synced_at':
                df[col] = datetime.datetime.now()
            else:
                df[col] = 0
    
    df = df[columns_to_sync]
    
    # Convert to PyArrow table
    table = pa.Table.from_pandas(df)
    
    # Append to Iceberg table
    iceberg_table = catalog.load_table(("analytics", "daily_aggregates"))
    iceberg_table.append(table)
    
    # Mark as synced in PostgreSQL
    ids = [row['id'] for row in response.data]
    for record_id in ids:
        supabase.table('daily_aggregates').update({
            'synced_to_iceberg': True,
            'synced_at': datetime.datetime.now().isoformat()
        }).eq('id', record_id).execute()
    
    print(f"Successfully synced {len(ids)} daily aggregate records.")
    return len(ids)


def sync_events(catalog, supabase, days: int = 7):
    """Sync analytics events to Iceberg."""
    import pyarrow as pa
    import pandas as pd
    import json
    
    print(f"\nSyncing analytics events for the last {days} days...")
    
    start_date = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime('%Y-%m-%d')
    
    # Get events (in batches to handle large volumes)
    batch_size = 1000
    offset = 0
    total_synced = 0
    
    while True:
        response = supabase.table('analytics_events').select('*').gte('event_date', start_date).range(offset, offset + batch_size - 1).execute()
        
        if not response.data:
            break
        
        print(f"Processing batch of {len(response.data)} events...")
        
        # Convert to DataFrame
        df = pd.DataFrame(response.data)
        
        # Convert event_data to JSON string
        df['event_data'] = df['event_data'].apply(lambda x: json.dumps(x) if x else '{}')
        
        # Convert timestamps
        df['event_timestamp'] = pd.to_datetime(df['event_timestamp'])
        df['event_date'] = pd.to_datetime(df['event_date']).dt.date
        
        # Select columns
        columns = ['id', 'business_id', 'event_name', 'event_category', 'event_data',
                   'user_id', 'session_id', 'source', 'event_timestamp', 'event_date']
        
        for col in columns:
            if col not in df.columns:
                df[col] = None
        
        df = df[columns]
        
        # Convert to PyArrow table
        table = pa.Table.from_pandas(df)
        
        # Append to Iceberg table
        iceberg_table = catalog.load_table(("analytics", "events"))
        iceberg_table.append(table)
        
        total_synced += len(response.data)
        offset += batch_size
        
        if len(response.data) < batch_size:
            break
    
    print(f"Successfully synced {total_synced} events.")
    return total_synced


def sync_metrics(catalog, supabase, days: int = 7):
    """Sync realtime metrics to Iceberg."""
    import pyarrow as pa
    import pandas as pd
    
    print(f"\nSyncing realtime metrics for the last {days} days...")
    
    start_date = (datetime.datetime.now() - datetime.timedelta(days=days)).isoformat()
    
    response = supabase.table('realtime_metrics').select('*').gte('time_bucket', start_date).execute()
    
    if not response.data:
        print("No metrics found to sync.")
        return 0
    
    print(f"Found {len(response.data)} metric records to sync.")
    
    # Convert to DataFrame
    df = pd.DataFrame(response.data)
    
    # Convert timestamps
    df['time_bucket'] = pd.to_datetime(df['time_bucket'])
    
    # Select columns
    columns = ['id', 'business_id', 'metric_name', 'metric_category', 'time_bucket',
               'granularity', 'value_count', 'value_sum', 'value_avg', 'value_min', 'value_max']
    
    for col in columns:
        if col not in df.columns:
            df[col] = None
    
    df = df[columns]
    
    # Convert to PyArrow table
    table = pa.Table.from_pandas(df)
    
    # Append to Iceberg table
    iceberg_table = catalog.load_table(("analytics", "metrics"))
    iceberg_table.append(table)
    
    print(f"Successfully synced {len(response.data)} metric records.")
    return len(response.data)


def log_sync_job(supabase, sync_type: str, status: str, records_synced: int, error_message: Optional[str] = None):
    """Log sync job to database."""
    supabase.table('analytics_sync_log').insert({
        'sync_type': sync_type,
        'sync_status': status,
        'records_synced': records_synced,
        'error_message': error_message,
        'started_at': datetime.datetime.now().isoformat(),
        'completed_at': datetime.datetime.now().isoformat() if status in ['completed', 'failed'] else None,
    }).execute()


def main():
    parser = argparse.ArgumentParser(description='Sync analytics data to Iceberg')
    parser.add_argument('--days', type=int, default=7, help='Number of days to sync (default: 7)')
    parser.add_argument('--sync-type', type=str, default='all', 
                        choices=['all', 'aggregates', 'events', 'metrics'],
                        help='Type of data to sync (default: all)')
    parser.add_argument('--setup', action='store_true', help='Create Iceberg tables')
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    print("=" * 60)
    print("Selestial Analytics - Iceberg Sync")
    print("=" * 60)
    
    try:
        # Initialize
        print("\nInitializing connections...")
        catalog = get_iceberg_catalog()
        supabase = get_supabase_client()
        print("Connections established.")
        
        # Setup tables if requested
        if args.setup:
            create_analytics_tables(catalog)
        
        # Run sync
        total_synced = 0
        
        if args.sync_type in ['all', 'aggregates']:
            try:
                count = sync_daily_aggregates(catalog, supabase, args.days)
                total_synced += count
                log_sync_job(supabase, 'daily_aggregates', 'completed', count)
            except Exception as e:
                print(f"Error syncing aggregates: {e}")
                log_sync_job(supabase, 'daily_aggregates', 'failed', 0, str(e))
        
        if args.sync_type in ['all', 'events']:
            try:
                count = sync_events(catalog, supabase, args.days)
                total_synced += count
                log_sync_job(supabase, 'events', 'completed', count)
            except Exception as e:
                print(f"Error syncing events: {e}")
                log_sync_job(supabase, 'events', 'failed', 0, str(e))
        
        if args.sync_type in ['all', 'metrics']:
            try:
                count = sync_metrics(catalog, supabase, args.days)
                total_synced += count
                log_sync_job(supabase, 'metrics', 'completed', count)
            except Exception as e:
                print(f"Error syncing metrics: {e}")
                log_sync_job(supabase, 'metrics', 'failed', 0, str(e))
        
        print("\n" + "=" * 60)
        print(f"Sync complete! Total records synced: {total_synced}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nFatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
