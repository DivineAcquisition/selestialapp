-- ============================================
-- DATABASE OPTIMIZATION INDEXES FOR PRODUCTION
-- ============================================

-- Core quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_business_status ON quotes(business_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_phone ON quotes(customer_phone);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_payment_status ON quotes(payment_status);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_quote ON messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_business ON messages(business_id);

-- Message queue indexes for efficient processing
CREATE INDEX IF NOT EXISTS idx_message_queue_pending ON message_queue(scheduled_for) 
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_message_queue_business ON message_queue(business_id);
CREATE INDEX IF NOT EXISTS idx_message_queue_status ON message_queue(status);

-- Inbound messages indexes
CREATE INDEX IF NOT EXISTS idx_inbound_business ON inbound_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_inbound_from ON inbound_messages(from_phone);
CREATE INDEX IF NOT EXISTS idx_inbound_created ON inbound_messages(created_at DESC);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_health ON customers(health_score);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_business ON payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_quote ON payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Payment links indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_quote ON payment_links(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(status);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_business ON activity_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_quote ON activity_logs(quote_id);

-- Stripe connected accounts indexes
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_business ON stripe_connected_accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_id ON stripe_connected_accounts(stripe_account_id);

-- Sequences indexes
CREATE INDEX IF NOT EXISTS idx_sequences_business ON sequences(business_id);

-- Phone numbers indexes
CREATE INDEX IF NOT EXISTS idx_phone_numbers_business ON phone_numbers(business_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_number ON phone_numbers(phone_number);