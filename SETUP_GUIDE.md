# BulkWaMsg Setup Guide

## 🚀 Quick Start

### Step 1: Configure Supabase (REQUIRED)

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization (if you don't have one)
   - Create a new project with these settings:
     - Name: `bulkwamsg` (or your preferred name)
     - Database Password: Choose a strong password
     - Region: Choose closest to your users
     - Pricing Plan: Free tier is fine to start

2. **Get Your Supabase Credentials**
   - Once your project is created, go to **Settings** → **API**
   - Copy these two values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public key** (long string starting with `eyJ...`)

3. **Update `.env.local` File**
   - Open the file: `C:\Users\HP\Bulkwamsg Software\.env.local`
   - Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart Your Dev Server**
   - Stop the current server (Ctrl+C in terminal)
   - Run: `npm run dev`
   - The Supabase error should now be gone!

---

### Step 2: Create Database Tables

Run these SQL commands in Supabase SQL Editor (**SQL Editor** tab in Supabase dashboard):

```sql
-- 1. User Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  email TEXT,
  company_name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- 3. Campaigns Table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

-- 4. Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_id UUID REFERENCES contacts,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Analytics Table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);
```

---

### Step 3: Test Authentication

1. **Sign Up**
   - Go to: `http://localhost:3000/signup`
   - Create a test account
   - You should be redirected to the dashboard

2. **Verify in Supabase**
   - Go to Supabase → **Authentication** → **Users**
   - You should see your new user

3. **Check Profile**
   - Go to Supabase → **Table Editor** → **profiles**
   - Your profile should be created automatically

---

## 📊 Next Steps (Optional Features)

### WhatsApp Integration Options

**Option 1: WhatsApp Business API (Official)**
- Requires business verification
- More reliable but costs money
- Best for production use
- Setup: [https://developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)

**Option 2: whatsapp-web.js (Unofficial)**
- Free and easier to set up
- Uses WhatsApp Web
- Good for testing/small scale
- Install: `npm install whatsapp-web.js qrcode-terminal`

**Option 3: Baileys (Unofficial)**
- Free, no browser needed
- More complex setup
- Install: `npm install @whiskeysockets/baileys`

### Stripe Integration (NEW)

1. **Create Stripe Account**
   - Go to: [https://stripe.com](https://stripe.com)
   - Enable Live mode or use Test mode.

2. **Get Credentials**
   - Copy Publishable Key and Secret Key from Developers → API Keys.
   - Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_pk_key
   STRIPE_SECRET_KEY=your_sk_key
   ```

3. **Create Pricing Plans**
   - In Stripe Dashboard, create products for Monthly and Yearly.
   - Copy the Price IDs and add to `.env.local`.

---

## 🔧 Common Issues

### "Supabase URL/Key Required" Error
- Make sure `.env.local` exists with correct values
- Restart dev server after updating `.env.local`

### "Failed to Login" Error
- Check Supabase project is active
- Verify credentials in `.env.local`
- Check browser console for detailed errors

### Pages Not Loading
- Clear browser cache
- Check terminal for build errors
- Verify all dependencies installed: `npm install`

---

## 📝 Current Features Status

✅ **Working:**
- All marketing pages
- Authentication (login/signup)
- Dashboard UI
- Protected routes

⏳ **Needs Setup:**
- Database tables (follow Step 2)
- WhatsApp connection
- Stripe webhook configuration
- Actual message sending

---

## 🆘 Need Help?

1. Check the terminal for error messages
2. Check browser console (F12) for frontend errors
3. Verify Supabase credentials are correct
4. Make sure dev server is running: `npm run dev`

---

## 🎯 Recommended Setup Order

1. ✅ Configure Supabase (Step 1) - **DO THIS FIRST**
2. ✅ Create database tables (Step 2)
3. ✅ Test authentication (Step 3)
4. Choose WhatsApp integration method
5. Set up Stripe (Step 5 in README)
6. Deploy to production (Vercel recommended)
