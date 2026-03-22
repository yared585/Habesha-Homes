-- ============================================================
-- HABESHA HOMES — SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE property_type AS ENUM (
  'apartment', 'villa', 'house', 'condominium',
  'commercial', 'land', 'office', 'warehouse'
);

CREATE TYPE listing_status AS ENUM (
  'draft', 'pending_review', 'active', 'sold', 
  'rented', 'withdrawn', 'expired'
);

CREATE TYPE listing_intent AS ENUM ('sale', 'rent', 'both');

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'agent', 'admin');

CREATE TYPE transaction_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded'
);

CREATE TYPE payment_type AS ENUM (
  'agent_subscription', 'featured_listing',
  'ai_report', 'due_diligence', 'commission'
);

CREATE TYPE currency AS ENUM ('ETB', 'USD');

CREATE TYPE verification_status AS ENUM (
  'unverified', 'pending', 'verified', 'rejected'
);

CREATE TYPE report_type AS ENUM (
  'valuation', 'fraud_check', 'contract_analysis',
  'neighborhood', 'investment_roi'
);

-- ============================================================
-- USERS & PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  full_name_amharic TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'buyer',
  preferred_language TEXT DEFAULT 'en', -- 'en' or 'am'
  is_diaspora BOOLEAN DEFAULT FALSE,
  diaspora_country TEXT, -- 'US', 'UK', 'CA', etc.
  verification_status verification_status DEFAULT 'unverified',
  id_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table (extends profiles)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT,
  agency_name TEXT,
  agency_name_amharic TEXT,
  bio TEXT,
  bio_amharic TEXT,
  specializations TEXT[], -- ['residential', 'commercial', 'diaspora']
  areas_served TEXT[], -- ['Bole', 'Kazanchis', 'Gerji']
  total_listings INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_plan TEXT DEFAULT 'free', -- 'free', 'basic', 'pro', 'enterprise'
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOCATIONS
-- ============================================================
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_amharic TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  region TEXT DEFAULT 'Addis Ababa',
  description TEXT,
  description_amharic TEXT,
  avg_price_per_sqm_etb DECIMAL(12,2),
  avg_rent_per_sqm_etb DECIMAL(12,2),
  price_trend_12m DECIMAL(5,2), -- percentage change
  safety_score INT, -- 1-10
  transport_score INT, -- 1-10
  amenities_score INT, -- 1-10
  flood_risk TEXT, -- 'low', 'medium', 'high'
  coordinates GEOGRAPHY(POINT, 4326),
  boundary GEOGRAPHY(POLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-populate key Addis Ababa neighborhoods
INSERT INTO neighborhoods (name, name_amharic, avg_price_per_sqm_etb, price_trend_12m, safety_score, transport_score) VALUES
  ('Bole', 'ቦሌ', 78000, 14.3, 9, 8),
  ('Kazanchis', 'ካዛንቺስ', 52000, 11.2, 8, 9),
  ('Megenagna', 'መገናኛ', 58000, 12.1, 8, 9),
  ('Sarbet', 'ሳርቤት', 44000, 10.8, 8, 7),
  ('Gerji', 'ገርጂ', 41000, 9.5, 7, 7),
  ('CMC', 'ሲኤምሲ', 49000, 11.0, 8, 7),
  ('Piassa', 'ፒያሳ', 32000, 8.5, 7, 9),
  ('Kolfe', 'ቆልፌ', 22000, 9.7, 7, 7),
  ('Lebu', 'ሌቡ', 15000, 8.0, 6, 6),
  ('Lideta', 'ልደታ', 38000, 10.2, 7, 8),
  ('Akaki', 'አቃቂ', 18000, 9.0, 7, 6),
  ('Nifas Silk', 'ንፋስ ስልክ', 35000, 10.5, 7, 7);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  title TEXT NOT NULL,
  title_amharic TEXT,
  description TEXT,
  description_amharic TEXT,
  
  -- Classification
  property_type property_type NOT NULL,
  listing_intent listing_intent NOT NULL,
  status listing_status DEFAULT 'draft',
  
  -- Pricing
  price_etb DECIMAL(15,2),
  price_usd DECIMAL(12,2),
  rent_per_month_etb DECIMAL(10,2),
  rent_per_month_usd DECIMAL(8,2),
  is_negotiable BOOLEAN DEFAULT TRUE,
  
  -- Size & specs
  size_sqm DECIMAL(10,2),
  bedrooms INT,
  bathrooms INT,
  floors INT,
  floor_number INT, -- which floor the unit is on
  parking_spaces INT DEFAULT 0,
  year_built INT,
  
  -- Location
  neighborhood_id UUID REFERENCES neighborhoods(id),
  address TEXT,
  address_amharic TEXT,
  city TEXT DEFAULT 'Addis Ababa',
  region TEXT DEFAULT 'Addis Ababa',
  coordinates GEOGRAPHY(POINT, 4326),
  
  -- Media
  cover_image_url TEXT,
  images JSONB DEFAULT '[]', -- [{url, caption, order}]
  virtual_tour_url TEXT,
  floor_plan_url TEXT,
  
  -- Features & amenities
  amenities TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '{}', -- {has_garden, has_pool, has_generator, has_borehole}
  
  -- Ownership
  agent_id UUID REFERENCES agents(id),
  owner_id UUID REFERENCES profiles(id),
  
  -- Verification
  title_document_url TEXT,
  title_verified BOOLEAN DEFAULT FALSE,
  title_verification_report JSONB, -- Claude fraud scan result
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  
  -- AI generated content
  ai_description TEXT, -- Claude generated
  ai_description_amharic TEXT,
  ai_valuation_etb DECIMAL(15,2),
  ai_valuation_report JSONB,
  
  -- Stats
  views INT DEFAULT 0,
  saves INT DEFAULT 0,
  inquiries INT DEFAULT 0,
  
  -- Timestamps
  listed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_properties_search ON properties 
  USING GIN (to_tsvector('english', COALESCE(title,'') || ' ' || COALESCE(description,'')));

CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_price ON properties(price_etb);
CREATE INDEX idx_properties_location ON properties USING GIST(coordinates);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);

-- ============================================================
-- SAVED PROPERTIES & SEARCHES
-- ============================================================
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  filters JSONB NOT NULL, -- {neighborhoods, types, min_price, max_price, bedrooms}
  alert_enabled BOOLEAN DEFAULT TRUE,
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INQUIRIES & MESSAGING
-- ============================================================
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id),
  agent_id UUID REFERENCES agents(id),
  message TEXT NOT NULL,
  message_amharic TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  is_diaspora BOOLEAN DEFAULT FALSE,
  preferred_viewing_date DATE,
  status TEXT DEFAULT 'new', -- 'new', 'replied', 'viewing_scheduled', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  content_amharic TEXT,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI CHAT SESSIONS
-- ============================================================
CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  property_id UUID REFERENCES properties(id),
  session_type TEXT DEFAULT 'general', -- 'property_qa', 'fraud_check', 'valuation', 'neighborhood'
  language TEXT DEFAULT 'en',
  messages JSONB DEFAULT '[]', -- conversation history
  total_tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI REPORTS
-- ============================================================
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  requested_by UUID REFERENCES profiles(id),
  report_type report_type NOT NULL,
  
  -- Results
  result JSONB NOT NULL, -- full AI analysis result
  verdict TEXT, -- 'safe', 'risky', 'fraud', 'buy', 'negotiate', 'pass'
  confidence_score DECIMAL(4,3), -- 0.000 to 1.000
  summary TEXT,
  summary_amharic TEXT,
  
  -- Document analyzed (for fraud checks)
  document_url TEXT,
  
  -- PDF report
  pdf_url TEXT,
  
  -- Payment
  is_paid BOOLEAN DEFAULT FALSE,
  payment_id UUID,
  price_etb DECIMAL(8,2),
  price_usd DECIMAL(6,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS & TRANSACTIONS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  
  -- Amount
  amount_etb DECIMAL(12,2),
  amount_usd DECIMAL(10,2),
  currency currency DEFAULT 'ETB',
  
  -- Type & reference
  payment_type payment_type NOT NULL,
  reference_id UUID, -- agent_id, property_id, report_id
  description TEXT,
  
  -- Gateway
  gateway TEXT NOT NULL, -- 'stripe', 'telebirr', 'cbe'
  gateway_payment_id TEXT,
  gateway_status TEXT,
  
  -- Status
  status transaction_status DEFAULT 'pending',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Agent subscriptions
CREATE TABLE agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'basic', 'pro', 'enterprise'
  
  -- Pricing
  price_per_month_usd DECIMAL(6,2),
  price_per_month_etb DECIMAL(8,2),
  
  -- Limits
  max_listings INT,
  max_featured INT,
  ai_reports_per_month INT,
  
  -- Status
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Stripe
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS & RATINGS
-- ============================================================
CREATE TABLE agent_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  property_id UUID REFERENCES properties(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  review_amharic TEXT,
  is_verified_transaction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VIEWINGS
-- ============================================================
CREATE TABLE viewings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id),
  agent_id UUID REFERENCES agents(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  is_virtual BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, only edit their own
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_write" ON profiles FOR ALL USING (auth.uid() = id);

-- Properties: active listings are public, agents manage their own
CREATE POLICY "properties_public_read" ON properties
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR 
    agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid()));

CREATE POLICY "properties_agent_write" ON properties
  FOR ALL USING (
    owner_id = auth.uid() OR
    agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
  );

-- Saved properties: private to user
CREATE POLICY "saved_own" ON saved_properties FOR ALL USING (user_id = auth.uid());

-- Inquiries: buyer sees their own, agent sees inquiries for their properties
CREATE POLICY "inquiries_buyer" ON inquiries FOR ALL USING (buyer_id = auth.uid());
CREATE POLICY "inquiries_agent" ON inquiries FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE profile_id = auth.uid())
);

-- AI sessions: private to user
CREATE POLICY "ai_sessions_own" ON ai_chat_sessions FOR ALL USING (user_id = auth.uid());

-- Payments: private to user
CREATE POLICY "payments_own" ON payments FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update agent stats when a property is sold
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sold' AND OLD.status != 'sold' THEN
    UPDATE agents SET total_sales = total_sales + 1
    WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agent_sales AFTER UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_agent_stats();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('property-images', 'property-images', true),
--   ('title-documents', 'title-documents', false),  -- private
--   ('agent-avatars', 'agent-avatars', true),
--   ('ai-reports', 'ai-reports', false);            -- private

-- ============================================================
-- SEED DATA — Agent subscription plans
-- ============================================================
INSERT INTO agent_subscriptions (agent_id, plan, price_per_month_usd, price_per_month_etb, max_listings, max_featured, ai_reports_per_month, status)
SELECT 
  id, 'free', 0, 0, 3, 0, 2, 'active'
FROM agents
ON CONFLICT DO NOTHING;
