

# Supabase Database Build - Complete Schema

## What Will Be Created

### Core Tables (9 tables)
| Table | Purpose |
|-------|---------|
| `businesses` | Primary tenant table with settings, Twilio, Stripe config |
| `sequences` | Automated follow-up sequences with JSONB steps |
| `quotes` | Quote tracking with status, payments, conversation data |
| `customers` | Customer profiles with health scoring |
| `messages` | Sent message history |
| `message_queue` | Scheduled outbound messages |
| `inbound_messages` | Customer replies |
| `phone_numbers` | Twilio phone numbers |
| `activity_logs` | Activity tracking |

### AI and Smart Features (3 tables)
| Table | Purpose |
|-------|---------|
| `ai_settings` | AI configuration per business |
| `ai_suggestions` | AI suggestion history |
| `ai_prompt_templates` | Industry-specific AI guidance |

### Marketing (3 tables)
| Table | Purpose |
|-------|---------|
| `seasonal_campaigns` | Marketing campaigns |
| `campaign_recipients` | Campaign send tracking |
| `campaign_templates` | Reusable campaign templates |

### Analytics (2 tables)
| Table | Purpose |
|-------|---------|
| `business_metrics` | Analytics snapshots |
| `industry_benchmarks` | Performance benchmarks |

### Reviews (1 table)
| Table | Purpose |
|-------|---------|
| `review_requests` | Review request tracking |

### Payments (3 tables)
| Table | Purpose |
|-------|---------|
| `billing_events` | Stripe webhook events |
| `payment_links` | Payment link tracking |
| `stripe_connected_accounts` | Stripe Connect accounts |

### Integrations (1 table)
| Table | Purpose |
|-------|---------|
| `integrations` | Third-party integrations (Jobber, etc.) |

### Reference Data (4 tables)
| Table | Purpose |
|-------|---------|
| `industries` | Industry configurations |
| `industry_service_types` | Services per industry |
| `sequence_templates` | Pre-built sequence templates |
| `campaign_templates` | Pre-built campaign templates |

### Retention (2 tables)
| Table | Purpose |
|-------|---------|
| `retention_sequences` | Customer retention sequences |
| `retention_queue` | Retention message scheduling |

### Admin (1 table)
| Table | Purpose |
|-------|---------|
| `admin_users` | Admin user roles and permissions |

---

## Additional Database Objects

### Functions
- `update_updated_at()` - Auto-update timestamps
- `create_default_sequence()` - Create default sequence for new business
- `log_activity()` - Log activities
- `replace_merge_fields()` - Replace template variables
- `adjust_to_business_hours()` - Adjust scheduling to business hours
- `schedule_next_message()` - Schedule next sequence message
- `advance_to_next_step()` - Move to next step after message sent
- `update_customer_health_score()` - Recalculate health score
- `system_health_check()` - System health check for admin
- `verify_database_schema()` - Schema verification
- `seed_test_data()` - Test data seeding

### Triggers
- Timestamp auto-update triggers on all tables
- Quote creation trigger to start sequences
- Quote status change trigger
- Conversation summary update trigger

### Indexes
- Performance indexes on `business_id`, `status`, `created_at`, `scheduled_for`
- Phone and email lookup indexes

### RLS Policies
- All tables will have Row Level Security enabled
- Users can only access their own business data
- Service role has full access for edge functions

### Seed Data
- 18 industry types with configurations
- Service types per industry
- Industry benchmarks
- Campaign templates
- Sequence templates
- AI prompt templates

---

## Execution Plan

I will create these in multiple migrations to keep them organized:

1. **Migration 1**: Enums and core tables (businesses, customers)
2. **Migration 2**: Sequences and quotes tables
3. **Migration 3**: Messages and queue tables
4. **Migration 4**: AI tables
5. **Migration 5**: Marketing and campaigns tables
6. **Migration 6**: Analytics and metrics tables
7. **Migration 7**: Payments and billing tables
8. **Migration 8**: Reference tables with seed data
9. **Migration 9**: Retention tables
10. **Migration 10**: Admin tables
11. **Migration 11**: Functions and triggers
12. **Migration 12**: Indexes and RLS policies

---

## Technical Notes

- All tables use UUID primary keys
- Timestamps use TIMESTAMPTZ for timezone awareness
- Money values stored in cents (INTEGER)
- Multi-tenant isolation via `business_id` foreign keys
- JSONB used for flexible step/metadata storage
- All foreign keys have appropriate ON DELETE behavior

