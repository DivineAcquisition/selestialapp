-- ============================================================================
-- BOOKING WIDGET DEEP CUSTOMIZATION SCHEMA
-- ============================================================================

-- ============================================================================
-- SERVICE AREAS (Geographic Zones)
-- ============================================================================
DROP TABLE IF EXISTS cleaning_service_areas CASCADE;
CREATE TABLE cleaning_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Zone Identity
  name VARCHAR(100) NOT NULL, -- "Downtown", "Suburbs", "Extended Area"
  slug VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Geographic Definition
  zone_type VARCHAR(20) DEFAULT 'zip' CHECK (zone_type IN ('zip', 'radius', 'polygon', 'city', 'county')),
  
  -- For zip code zones
  zip_codes TEXT[] DEFAULT '{}',
  
  -- For radius zones (miles from center point)
  center_lat DECIMAL(10, 7),
  center_lng DECIMAL(10, 7),
  radius_miles DECIMAL(5, 2),
  
  -- For polygon zones (GeoJSON)
  polygon_geojson JSONB,
  
  -- For city/county zones
  cities TEXT[] DEFAULT '{}',
  counties TEXT[] DEFAULT '{}',
  state VARCHAR(2),
  
  -- Pricing Adjustments
  price_adjustment_type VARCHAR(20) DEFAULT 'none' 
    CHECK (price_adjustment_type IN ('none', 'percentage', 'flat', 'multiplier')),
  price_adjustment_value DECIMAL(10, 2) DEFAULT 0,
  -- Examples: 
  --   percentage: 10 = +10% 
  --   flat: 25 = +$25
  --   multiplier: 1.15 = 1.15x
  
  -- Minimum order for this area
  minimum_order DECIMAL(10, 2) DEFAULT 0,
  
  -- Travel/Trip Fee
  travel_fee DECIMAL(10, 2) DEFAULT 0,
  travel_fee_waive_above DECIMAL(10, 2), -- Waive if order > this amount
  
  -- Availability Rules
  available BOOLEAN DEFAULT TRUE,
  available_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat'], -- Days we service this area
  lead_time_hours INTEGER, -- Override default lead time for this area
  max_bookings_per_day INTEGER, -- Limit bookings in this zone
  
  -- Scheduling Windows (override business hours for this area)
  custom_hours JSONB, -- Same format as operating_hours
  
  -- Display
  display_order INTEGER DEFAULT 0,
  color VARCHAR(20), -- For map display
  show_on_map BOOLEAN DEFAULT TRUE,
  
  -- Messaging
  area_message TEXT, -- "We're excited to serve the downtown area!"
  travel_message TEXT, -- "A $15 travel fee applies to this area"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX idx_service_areas_business ON cleaning_service_areas(business_id);
CREATE INDEX idx_service_areas_zips ON cleaning_service_areas USING GIN(zip_codes);

-- ============================================================================
-- PRICING MODEL CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_pricing_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- Primary Pricing Method
  primary_method VARCHAR(30) DEFAULT 'bedroom_bathroom' CHECK (primary_method IN (
    'bedroom_bathroom',  -- Price per bed/bath
    'sqft',              -- Price per square foot
    'sqft_tiered',       -- Tiered sqft pricing
    'flat_rate',         -- Fixed prices per service
    'hourly',            -- Hourly rate
    'room_count',        -- Total rooms
    'hybrid'             -- Combination
  )),
  
  -- ============================================================================
  -- BEDROOM/BATHROOM PRICING
  -- ============================================================================
  bed_bath_config JSONB DEFAULT '{
    "base_price": 80,
    "price_per_bedroom": 25,
    "price_per_bathroom": 20,
    "price_per_half_bath": 10,
    "price_per_additional_room": 15,
    "max_bedrooms": 10,
    "max_bathrooms": 8,
    "studio_price": 70,
    "include_common_areas": true
  }',
  
  -- ============================================================================
  -- SQUARE FOOTAGE PRICING
  -- ============================================================================
  sqft_config JSONB DEFAULT '{
    "price_per_sqft": 0.10,
    "minimum_sqft": 500,
    "maximum_sqft": 10000,
    "minimum_charge": 100,
    "round_to_nearest": 100
  }',
  
  -- Tiered sqft pricing
  sqft_tiers JSONB DEFAULT '[
    {"min_sqft": 0, "max_sqft": 1000, "price_per_sqft": 0.12, "label": "Small"},
    {"min_sqft": 1001, "max_sqft": 2000, "price_per_sqft": 0.10, "label": "Medium"},
    {"min_sqft": 2001, "max_sqft": 3000, "price_per_sqft": 0.08, "label": "Large"},
    {"min_sqft": 3001, "max_sqft": 999999, "price_per_sqft": 0.07, "label": "XL"}
  ]',
  
  -- ============================================================================
  -- FLAT RATE PRICING (per service type)
  -- ============================================================================
  flat_rate_config JSONB DEFAULT '{
    "use_property_size_tiers": true,
    "property_size_tiers": [
      {"name": "Small", "max_sqft": 1000, "max_beds": 2, "multiplier": 0.8},
      {"name": "Medium", "max_sqft": 2000, "max_beds": 3, "multiplier": 1.0},
      {"name": "Large", "max_sqft": 3000, "max_beds": 4, "multiplier": 1.3},
      {"name": "XL", "max_sqft": 999999, "max_beds": 99, "multiplier": 1.6}
    ]
  }',
  
  -- ============================================================================
  -- HOURLY PRICING
  -- ============================================================================
  hourly_config JSONB DEFAULT '{
    "base_hourly_rate": 45,
    "minimum_hours": 2,
    "hour_increments": 0.5,
    "estimate_hours_per_bedroom": 0.5,
    "estimate_hours_per_bathroom": 0.5,
    "estimate_hours_base": 1.5,
    "show_time_estimate": true,
    "allow_customer_select_hours": false
  }',
  
  -- ============================================================================
  -- ROOM COUNT PRICING
  -- ============================================================================
  room_count_config JSONB DEFAULT '{
    "price_per_room": 20,
    "base_price": 60,
    "count_bedrooms": true,
    "count_bathrooms": true,
    "count_kitchen": true,
    "count_living_areas": true,
    "kitchen_multiplier": 1.5,
    "bathroom_multiplier": 1.2
  }',
  
  -- ============================================================================
  -- HYBRID PRICING (combine methods)
  -- ============================================================================
  hybrid_config JSONB DEFAULT '{
    "primary_method": "bedroom_bathroom",
    "secondary_method": "sqft",
    "secondary_weight": 0.3,
    "use_higher_price": true,
    "blend_prices": false
  }',
  
  -- ============================================================================
  -- SERVICE TYPE MULTIPLIERS
  -- ============================================================================
  service_multipliers JSONB DEFAULT '{
    "standard": 1.0,
    "deep": 1.5,
    "move": 2.0,
    "construction": 2.5,
    "airbnb": 1.2
  }',
  
  -- ============================================================================
  -- GLOBAL ADJUSTMENTS
  -- ============================================================================
  
  -- Day of week pricing
  day_pricing JSONB DEFAULT '{
    "enabled": false,
    "adjustments": {
      "mon": 0,
      "tue": 0,
      "wed": 0,
      "thu": 0,
      "fri": 0,
      "sat": 10,
      "sun": 15
    },
    "adjustment_type": "percentage"
  }',
  
  -- Time of day pricing
  time_pricing JSONB DEFAULT '{
    "enabled": false,
    "early_bird": {"start": "07:00", "end": "09:00", "adjustment": -5},
    "prime_time": {"start": "10:00", "end": "14:00", "adjustment": 0},
    "evening": {"start": "17:00", "end": "20:00", "adjustment": 10}
  }',
  
  -- Last minute / rush pricing
  rush_pricing JSONB DEFAULT '{
    "enabled": false,
    "same_day": {"adjustment": 25, "type": "percentage"},
    "next_day": {"adjustment": 15, "type": "percentage"},
    "within_48h": {"adjustment": 10, "type": "percentage"}
  }',
  
  -- Minimum order
  minimum_order DECIMAL(10, 2) DEFAULT 75,
  minimum_order_message TEXT DEFAULT 'Minimum order of $75 required',
  
  -- Rounding
  round_to_nearest INTEGER DEFAULT 5, -- Round final price to nearest $5
  
  -- Tax
  tax_rate DECIMAL(5, 4) DEFAULT 0, -- 0.0825 = 8.25%
  tax_included BOOLEAN DEFAULT FALSE,
  tax_label VARCHAR(50) DEFAULT 'Sales Tax',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEASONAL / PROMOTIONAL CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL,
  internal_notes TEXT,
  
  -- Type
  promo_type VARCHAR(30) DEFAULT 'banner' CHECK (promo_type IN (
    'banner',           -- Top banner
    'badge',            -- Badge on services
    'popup',            -- Popup modal
    'inline',           -- Inline message
    'countdown',        -- Countdown timer
    'seasonal_pricing', -- Price adjustments
    'flash_sale'        -- Limited time
  )),
  
  -- Scheduling
  active BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Display schedule (show only during certain times)
  display_schedule JSONB DEFAULT '{
    "all_day": true,
    "start_time": "00:00",
    "end_time": "23:59",
    "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  }',
  
  -- ============================================================================
  -- BANNER CONFIGURATION
  -- ============================================================================
  banner_config JSONB DEFAULT '{
    "position": "top",
    "sticky": false,
    "dismissible": true,
    "show_icon": true,
    "icon": "sparkles",
    "background_type": "solid",
    "background_color": "#7c3aed",
    "gradient_from": "#7c3aed",
    "gradient_to": "#4f46e5",
    "text_color": "#ffffff",
    "border_radius": "0",
    "padding": "12px 16px",
    "animation": "none"
  }',
  
  -- ============================================================================
  -- CONTENT
  -- ============================================================================
  headline TEXT, -- "🌸 Spring Cleaning Special!"
  subheadline TEXT, -- "Book this week and save 20%"
  description TEXT,
  cta_text VARCHAR(100), -- "Book Now"
  cta_link VARCHAR(255),
  
  -- Rich content (for popups/modals)
  rich_content JSONB DEFAULT '{
    "show_image": false,
    "image_url": null,
    "bullet_points": [],
    "terms_text": null
  }',
  
  -- ============================================================================
  -- COUNTDOWN CONFIGURATION
  -- ============================================================================
  countdown_config JSONB DEFAULT '{
    "show_days": true,
    "show_hours": true,
    "show_minutes": true,
    "show_seconds": false,
    "expired_message": "Offer has ended",
    "style": "boxes"
  }',
  
  -- ============================================================================
  -- PRICING IMPACT
  -- ============================================================================
  has_pricing_impact BOOLEAN DEFAULT FALSE,
  
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'flat', 'fixed_price')),
  discount_value DECIMAL(10, 2),
  
  -- Conditions
  discount_conditions JSONB DEFAULT '{
    "applies_to_services": [],
    "applies_to_frequencies": [],
    "minimum_order": null,
    "first_time_only": false,
    "new_customers_only": false,
    "requires_code": false
  }',
  
  -- Promo code
  promo_code VARCHAR(50),
  promo_code_case_sensitive BOOLEAN DEFAULT FALSE,
  
  -- Usage limits
  max_uses INTEGER, -- Total uses allowed
  max_uses_per_customer INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- ============================================================================
  -- BADGE CONFIGURATION
  -- ============================================================================
  badge_config JSONB DEFAULT '{
    "text": "SALE",
    "color": "#ef4444",
    "text_color": "#ffffff",
    "position": "top-right",
    "animate": true
  }',
  
  -- ============================================================================
  -- TARGETING
  -- ============================================================================
  targeting JSONB DEFAULT '{
    "show_to_new_visitors": true,
    "show_to_returning": true,
    "show_to_logged_in": true,
    "geo_target_areas": [],
    "device_types": ["desktop", "mobile", "tablet"],
    "referrer_contains": null
  }',
  
  -- Priority (higher = shows first if multiple active)
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(business_id, slug)
);

CREATE INDEX idx_promotions_business ON cleaning_promotions(business_id);
CREATE INDEX idx_promotions_active ON cleaning_promotions(active, start_date, end_date);

-- ============================================================================
-- WIDGET APPEARANCE & BRANDING
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_widget_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- ============================================================================
  -- COLORS
  -- ============================================================================
  colors JSONB DEFAULT '{
    "primary": "#7c3aed",
    "primary_hover": "#6d28d9",
    "primary_light": "#ede9fe",
    "secondary": "#10b981",
    "accent": "#f59e0b",
    "background": "#ffffff",
    "surface": "#f9fafb",
    "border": "#e5e7eb",
    "text_primary": "#111827",
    "text_secondary": "#6b7280",
    "text_muted": "#9ca3af",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6"
  }',
  
  -- ============================================================================
  -- TYPOGRAPHY
  -- ============================================================================
  typography JSONB DEFAULT '{
    "font_family": "Inter, system-ui, sans-serif",
    "font_family_headings": null,
    "font_size_base": "16px",
    "font_size_sm": "14px",
    "font_size_lg": "18px",
    "font_size_xl": "24px",
    "font_weight_normal": "400",
    "font_weight_medium": "500",
    "font_weight_semibold": "600",
    "font_weight_bold": "700",
    "line_height": "1.5",
    "letter_spacing": "0"
  }',
  
  -- ============================================================================
  -- SPACING & LAYOUT
  -- ============================================================================
  layout JSONB DEFAULT '{
    "border_radius_sm": "6px",
    "border_radius_md": "8px",
    "border_radius_lg": "12px",
    "border_radius_xl": "16px",
    "border_radius_full": "9999px",
    "shadow_sm": "0 1px 2px rgba(0,0,0,0.05)",
    "shadow_md": "0 4px 6px rgba(0,0,0,0.1)",
    "shadow_lg": "0 10px 15px rgba(0,0,0,0.1)",
    "spacing_unit": "4px",
    "container_max_width": "1200px",
    "widget_padding": "24px",
    "card_padding": "20px"
  }',
  
  -- ============================================================================
  -- LOGO & IMAGES
  -- ============================================================================
  branding_assets JSONB DEFAULT '{
    "logo_url": null,
    "logo_height": "40px",
    "logo_position": "left",
    "favicon_url": null,
    "background_image_url": null,
    "background_overlay": "rgba(0,0,0,0.5)",
    "hero_image_url": null,
    "trust_badges": []
  }',
  
  -- ============================================================================
  -- BUTTON STYLES
  -- ============================================================================
  buttons JSONB DEFAULT '{
    "primary": {
      "background": "var(--primary)",
      "text": "#ffffff",
      "border": "none",
      "border_radius": "8px",
      "padding": "12px 24px",
      "font_weight": "600",
      "hover_background": "var(--primary-hover)",
      "hover_transform": "translateY(-1px)",
      "shadow": "0 2px 4px rgba(124,58,237,0.3)"
    },
    "secondary": {
      "background": "transparent",
      "text": "var(--text-primary)",
      "border": "1px solid var(--border)",
      "border_radius": "8px",
      "padding": "12px 24px",
      "font_weight": "500",
      "hover_background": "var(--surface)",
      "hover_transform": "none",
      "shadow": "none"
    },
    "ghost": {
      "background": "transparent",
      "text": "var(--primary)",
      "border": "none",
      "padding": "8px 16px",
      "hover_background": "var(--primary-light)"
    }
  }',
  
  -- ============================================================================
  -- INPUT STYLES
  -- ============================================================================
  inputs JSONB DEFAULT '{
    "background": "#ffffff",
    "border": "1px solid var(--border)",
    "border_radius": "8px",
    "padding": "12px 16px",
    "focus_border": "var(--primary)",
    "focus_ring": "0 0 0 3px var(--primary-light)",
    "placeholder_color": "var(--text-muted)",
    "error_border": "var(--error)",
    "disabled_background": "var(--surface)"
  }',
  
  -- ============================================================================
  -- CARD STYLES
  -- ============================================================================
  cards JSONB DEFAULT '{
    "background": "#ffffff",
    "border": "1px solid var(--border)",
    "border_radius": "12px",
    "shadow": "0 1px 3px rgba(0,0,0,0.1)",
    "hover_shadow": "0 4px 12px rgba(0,0,0,0.15)",
    "hover_border": "var(--primary)",
    "selected_border": "2px solid var(--primary)",
    "selected_background": "var(--primary-light)"
  }',
  
  -- ============================================================================
  -- ANIMATIONS
  -- ============================================================================
  animations JSONB DEFAULT '{
    "enabled": true,
    "duration_fast": "150ms",
    "duration_normal": "200ms",
    "duration_slow": "300ms",
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
    "hover_scale": 1.02,
    "tap_scale": 0.98,
    "page_transition": "fade",
    "loading_animation": "pulse"
  }',
  
  -- ============================================================================
  -- CUSTOM CSS
  -- ============================================================================
  custom_css TEXT, -- Advanced users can add custom CSS
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WIDGET COPY & MESSAGING
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_widget_copy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- ============================================================================
  -- STEP TITLES & DESCRIPTIONS
  -- ============================================================================
  step_content JSONB DEFAULT '{
    "service": {
      "title": "What type of cleaning?",
      "description": "Choose the service that best fits your needs",
      "help_text": null
    },
    "property": {
      "title": "Tell us about your home",
      "description": "This helps us give you an accurate price",
      "help_text": null
    },
    "addons": {
      "title": "Want any extras?",
      "description": "Add deep cleaning for specific areas",
      "help_text": "These are optional - skip if not needed"
    },
    "frequency": {
      "title": "How often?",
      "description": "Regular cleanings save money and keep your home fresh",
      "help_text": null
    },
    "schedule": {
      "title": "Pick a date & time",
      "description": "Choose when you''d like us to come",
      "help_text": null
    },
    "contact": {
      "title": "Your information",
      "description": "We''ll send confirmation and updates here",
      "help_text": null
    },
    "payment": {
      "title": "Complete your booking",
      "description": "Secure payment powered by Stripe",
      "help_text": null
    }
  }',
  
  -- ============================================================================
  -- BUTTON LABELS
  -- ============================================================================
  buttons JSONB DEFAULT '{
    "next": "Continue",
    "back": "Back",
    "submit": "Book Now",
    "submit_with_deposit": "Book & Pay {amount}",
    "skip": "Skip",
    "add": "Add",
    "remove": "Remove",
    "apply_code": "Apply",
    "clear": "Clear"
  }',
  
  -- ============================================================================
  -- LABELS
  -- ============================================================================
  labels JSONB DEFAULT '{
    "bedrooms": "Bedrooms",
    "bathrooms": "Bathrooms",
    "sqft": "Square Feet",
    "full_name": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "address": "Street Address",
    "apt": "Apt/Suite",
    "city": "City",
    "state": "State",
    "zip": "ZIP Code",
    "promo_code": "Promo Code",
    "special_requests": "Special Requests",
    "access_instructions": "Access Instructions",
    "pets": "I have pets"
  }',
  
  -- ============================================================================
  -- PLACEHOLDERS
  -- ============================================================================
  placeholders JSONB DEFAULT '{
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "address": "123 Main St",
    "apt": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "promo_code": "Enter code",
    "special_requests": "Any special requests or notes?",
    "access_instructions": "Gate code, parking info, key location..."
  }',
  
  -- ============================================================================
  -- PRICE SUMMARY
  -- ============================================================================
  price_summary JSONB DEFAULT '{
    "title": "Your Price",
    "subtotal": "Subtotal",
    "discount": "Discount",
    "travel_fee": "Travel Fee",
    "tax": "Tax",
    "total": "Total",
    "deposit": "Deposit Due Today",
    "balance": "Balance Due at Service",
    "estimated_time": "Estimated Time",
    "savings": "You''re saving {amount} with {frequency}!"
  }',
  
  -- ============================================================================
  -- SUCCESS / ERROR MESSAGES
  -- ============================================================================
  messages JSONB DEFAULT '{
    "booking_success_title": "Booking Confirmed!",
    "booking_success_message": "Your cleaning is scheduled for {date} at {time}. We''ve sent a confirmation to {email}.",
    "booking_pending_title": "Almost There!",
    "booking_pending_message": "Complete your payment to confirm your booking.",
    "error_generic": "Something went wrong. Please try again.",
    "error_payment": "Payment failed. Please check your card details.",
    "error_unavailable": "This time slot is no longer available.",
    "error_minimum": "Minimum order of {amount} required.",
    "validation_required": "This field is required",
    "validation_email": "Please enter a valid email",
    "validation_phone": "Please enter a valid phone number"
  }',
  
  -- ============================================================================
  -- TRUST SIGNALS
  -- ============================================================================
  trust_signals JSONB DEFAULT '{
    "show_trust_badges": true,
    "badges": [
      {"icon": "shield", "text": "Insured & Bonded"},
      {"icon": "star", "text": "5-Star Rated"},
      {"icon": "clock", "text": "On-Time Guarantee"},
      {"icon": "creditCard", "text": "Secure Payment"}
    ],
    "testimonial": null,
    "satisfaction_guarantee": "100% Satisfaction Guaranteed"
  }',
  
  -- ============================================================================
  -- POLICIES
  -- ============================================================================
  policies JSONB DEFAULT '{
    "cancellation_policy": "Free cancellation up to 24 hours before your appointment.",
    "rescheduling_policy": "Reschedule anytime at no extra charge with 24 hours notice.",
    "payment_policy": "A {deposit_percent}% deposit is required to secure your booking.",
    "terms_url": null,
    "privacy_url": null,
    "show_policies_in_footer": true
  }',
  
  -- ============================================================================
  -- FOOTER
  -- ============================================================================
  footer JSONB DEFAULT '{
    "show_footer": true,
    "show_powered_by": true,
    "powered_by_text": "Powered by Selestial",
    "show_contact_info": true,
    "contact_text": "Questions? Call us at {phone}",
    "custom_footer_html": null
  }',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WIDGET BEHAVIOR & SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS cleaning_widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  
  -- ============================================================================
  -- STEP CONFIGURATION
  -- ============================================================================
  steps JSONB DEFAULT '{
    "order": ["service", "property", "addons", "frequency", "schedule", "contact", "payment"],
    "service": {"enabled": true, "required": true, "skippable": false},
    "property": {"enabled": true, "required": true, "skippable": false},
    "addons": {"enabled": true, "required": false, "skippable": true},
    "frequency": {"enabled": true, "required": false, "skippable": true},
    "schedule": {"enabled": true, "required": true, "skippable": false},
    "contact": {"enabled": true, "required": true, "skippable": false},
    "payment": {"enabled": true, "required": true, "skippable": false}
  }',
  
  -- ============================================================================
  -- FIELD REQUIREMENTS
  -- ============================================================================
  required_fields JSONB DEFAULT '{
    "customer_name": true,
    "customer_email": true,
    "customer_phone": true,
    "address_line1": true,
    "city": true,
    "state": true,
    "zip_code": true,
    "address_line2": false,
    "access_instructions": false,
    "special_requests": false,
    "sqft": false
  }',
  
  -- ============================================================================
  -- PROPERTY INPUT OPTIONS
  -- ============================================================================
  property_input JSONB DEFAULT '{
    "show_presets": true,
    "show_custom_input": true,
    "show_sqft": false,
    "require_sqft": false,
    "sqft_input_type": "slider",
    "sqft_slider_min": 500,
    "sqft_slider_max": 5000,
    "sqft_slider_step": 100,
    "bedroom_min": 0,
    "bedroom_max": 10,
    "bathroom_min": 1,
    "bathroom_max": 8,
    "bathroom_increments": 0.5,
    "show_property_type": false,
    "property_types": ["house", "apartment", "condo", "townhouse", "other"]
  }',
  
  -- ============================================================================
  -- SCHEDULING OPTIONS
  -- ============================================================================
  scheduling JSONB DEFAULT '{
    "show_calendar": true,
    "calendar_style": "scroll",
    "days_to_show": 14,
    "show_time_slots": true,
    "time_slot_duration": 30,
    "show_duration_estimate": true,
    "allow_specific_time_request": false,
    "show_availability_count": false,
    "timezone_display": "business",
    "date_format": "MMM D, YYYY",
    "time_format": "12h"
  }',
  
  -- ============================================================================
  -- ADDON DISPLAY
  -- ============================================================================
  addon_display JSONB DEFAULT '{
    "layout": "list",
    "show_descriptions": true,
    "show_time_added": true,
    "group_by_category": false,
    "max_visible": null,
    "show_popular_first": true,
    "show_recommended": true,
    "recommended_addon_ids": []
  }',
  
  -- ============================================================================
  -- FREQUENCY DISPLAY
  -- ============================================================================
  frequency_display JSONB DEFAULT '{
    "layout": "cards",
    "show_savings": true,
    "show_per_visit_price": true,
    "highlight_best_value": true,
    "default_selection": null,
    "show_comparison_table": false
  }',
  
  -- ============================================================================
  -- PAYMENT OPTIONS
  -- ============================================================================
  payment JSONB DEFAULT '{
    "collect_payment": true,
    "payment_timing": "deposit",
    "accept_cards": true,
    "accept_apple_pay": true,
    "accept_google_pay": true,
    "show_payment_icons": true,
    "save_card_for_future": false,
    "show_secure_badge": true
  }',
  
  -- ============================================================================
  -- PROMO CODES
  -- ============================================================================
  promo_codes JSONB DEFAULT '{
    "enabled": true,
    "show_input_always": false,
    "show_toggle": true,
    "toggle_text": "Have a promo code?",
    "success_message": "Code applied! You saved {amount}",
    "error_message": "Invalid or expired code"
  }',
  
  -- ============================================================================
  -- PROGRESS INDICATOR
  -- ============================================================================
  progress JSONB DEFAULT '{
    "show_progress": true,
    "style": "bar",
    "show_step_names": false,
    "show_step_numbers": false,
    "position": "top"
  }',
  
  -- ============================================================================
  -- MOBILE SETTINGS
  -- ============================================================================
  mobile JSONB DEFAULT '{
    "sticky_price_summary": true,
    "collapsible_summary": true,
    "full_screen_steps": false,
    "swipe_navigation": true,
    "bottom_nav": true
  }',
  
  -- ============================================================================
  -- ACCESSIBILITY
  -- ============================================================================
  accessibility JSONB DEFAULT '{
    "high_contrast_mode": false,
    "large_text_mode": false,
    "reduce_motion": false,
    "screen_reader_announcements": true,
    "keyboard_navigation": true,
    "focus_visible_style": "ring"
  }',
  
  -- ============================================================================
  -- ANALYTICS & TRACKING
  -- ============================================================================
  tracking JSONB DEFAULT '{
    "google_analytics_id": null,
    "facebook_pixel_id": null,
    "track_step_completion": true,
    "track_abandonment": true,
    "track_promo_usage": true,
    "custom_events": []
  }',
  
  -- ============================================================================
  -- EMBED OPTIONS
  -- ============================================================================
  embed JSONB DEFAULT '{
    "responsive": true,
    "min_width": "320px",
    "max_width": "100%",
    "min_height": "600px",
    "allow_popup_mode": true,
    "popup_trigger_text": "Book Now",
    "popup_trigger_style": "button"
  }',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE cleaning_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_pricing_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_widget_settings ENABLE ROW LEVEL SECURITY;

-- Business owner policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own service areas') THEN
    CREATE POLICY "Users can manage own service areas"
      ON cleaning_service_areas FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own pricing models') THEN
    CREATE POLICY "Users can manage own pricing models"
      ON cleaning_pricing_models FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own promotions') THEN
    CREATE POLICY "Users can manage own promotions"
      ON cleaning_promotions FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own branding') THEN
    CREATE POLICY "Users can manage own branding"
      ON cleaning_widget_branding FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own copy') THEN
    CREATE POLICY "Users can manage own copy"
      ON cleaning_widget_copy FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own settings') THEN
    CREATE POLICY "Users can manage own settings"
      ON cleaning_widget_settings FOR ALL
      USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
  END IF;
END $$;

-- Public read policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active service areas') THEN
    CREATE POLICY "Public can read active service areas"
      ON cleaning_service_areas FOR SELECT USING (available = true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read pricing models') THEN
    CREATE POLICY "Public can read pricing models"
      ON cleaning_pricing_models FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active promotions') THEN
    CREATE POLICY "Public can read active promotions"
      ON cleaning_promotions FOR SELECT 
      USING (active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read branding') THEN
    CREATE POLICY "Public can read branding"
      ON cleaning_widget_branding FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read copy') THEN
    CREATE POLICY "Public can read copy"
      ON cleaning_widget_copy FOR SELECT USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read settings') THEN
    CREATE POLICY "Public can read settings"
      ON cleaning_widget_settings FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get all widget customization for a business
CREATE OR REPLACE FUNCTION get_widget_customization(p_business_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'service_areas', COALESCE((
      SELECT jsonb_agg(row_to_json(sa))
      FROM cleaning_service_areas sa
      WHERE sa.business_id = p_business_id AND sa.available = true
    ), '[]'::jsonb),
    'pricing_model', COALESCE((
      SELECT row_to_json(pm)
      FROM cleaning_pricing_models pm
      WHERE pm.business_id = p_business_id
    )::jsonb, '{}'::jsonb),
    'promotions', COALESCE((
      SELECT jsonb_agg(row_to_json(pr))
      FROM cleaning_promotions pr
      WHERE pr.business_id = p_business_id 
        AND pr.active = true
        AND (pr.start_date IS NULL OR pr.start_date <= NOW())
        AND (pr.end_date IS NULL OR pr.end_date >= NOW())
    ), '[]'::jsonb),
    'branding', COALESCE((
      SELECT row_to_json(br)
      FROM cleaning_widget_branding br
      WHERE br.business_id = p_business_id
    )::jsonb, '{}'::jsonb),
    'copy', COALESCE((
      SELECT row_to_json(cp)
      FROM cleaning_widget_copy cp
      WHERE cp.business_id = p_business_id
    )::jsonb, '{}'::jsonb),
    'settings', COALESCE((
      SELECT row_to_json(st)
      FROM cleaning_widget_settings st
      WHERE st.business_id = p_business_id
    )::jsonb, '{}'::jsonb)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
