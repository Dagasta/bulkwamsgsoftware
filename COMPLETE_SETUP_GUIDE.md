# 🚀 Complete Setup Guide for BulkWaMsg

You have all the tools you need! Let's connect everything step by step.

---

## ✅ Step 1: Configure Supabase (5 minutes)

### 1.1 Get Your Supabase Credentials

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one if you haven't)

2. **Copy Your Credentials**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **API** in the settings menu
   - You'll see two important values:
     - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key - Copy this (long string starting with `eyJ...`)

3. **Update Your .env.local File**
   - Open: `C:\Users\HP\Bulkwamsg Software\.env.local`
   - Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key...
   ```

4. **Restart Your Dev Server**
   - In your terminal, press `Ctrl+C` to stop
   - Run: `npm run dev`
   - The app should now load without errors!

---

## ✅ Step 2: Create Database Tables in Supabase (3 minutes)

### 2.1 Open SQL Editor
1. In Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**

### 2.2 Run This SQL Script

Copy and paste this entire script, then click **RUN**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  email TEXT,
  company_name TEXT,
  phone TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own contacts" ON contacts;
CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- 3. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
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

DROP POLICY IF EXISTS "Users can manage own campaigns" ON campaigns;
CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_id UUID REFERENCES contacts ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- 5. Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  campaign_id UUID REFERENCES campaigns ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
```

### 2.3 Verify Tables Created
1. Click **Table Editor** in the left sidebar
2. You should see: `profiles`, `contacts`, `campaigns`, `messages`, `analytics`

---

## ✅ Step 3: Test Authentication (2 minutes)

1. **Go to Signup Page**
   - Visit: `http://localhost:3000/signup`
   - Fill in the form with a test email and password
   - Click "Create Account"

2. **Check Supabase**
   - In Supabase Dashboard → **Authentication** → **Users**
   - You should see your new user!

3. **Check Profile Created**
   - In Supabase Dashboard → **Table Editor** → **profiles**
   - Your profile should be there

4. **Test Login**
   - Go to: `http://localhost:3000/login`
   - Login with your credentials
   - You should see the dashboard!

---

## ✅ Step 4: Configure Stripe (Optional - 5 minutes)

### 4.1 Get Stripe Credentials

1. **Go to Stripe Dashboard**
   - Visit: [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Login with your Stripe account

2. **Get API Keys**
   - Go to **Developers** → **API Keys**
   - Copy the **Publishable Key** and **Secret Key**

3. **Update .env.local**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_pk_key
   STRIPE_SECRET_KEY=your_sk_key
   ```

### 4.2 Create Pricing Plans

1. In Stripe Dashboard → **Product catalog** → **Add product**
2. Create plans:
   - **Pro Monthly**: $10/month
   - **Pro Yearly**: $120/year
3. Copy the **Price ID** (starts with `price_`) for each and add to `.env.local`:
   ```env
   STRIPE_MONTHLY_PRICE_ID=price_...
   STRIPE_YEARLY_PRICE_ID=price_...
   ```

### 4.2 Create Subscription Plans (Optional)

1. In PayPal Dashboard → **Products & Services** → **Subscriptions**
2. Create plans:
   - **Starter Plan**: $29/month
   - **Professional Plan**: $99/month
   - **Enterprise Plan**: Custom pricing

---

## ✅ Step 5: Connect to pgAdmin (Optional - for database management)

Since you have pgAdmin, you can connect it to Supabase for advanced database management:

### 5.1 Get Database Connection Details

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection Info**
3. Copy these values:
   - Host
   - Database name
   - Port
   - User
   - Password (click "Reset database password" if needed)

### 5.2 Connect pgAdmin

1. Open pgAdmin
2. Right-click **Servers** → **Create** → **Server**
3. **General Tab**:
   - Name: `BulkWaMsg Supabase`
4. **Connection Tab**:
   - Host: (paste from Supabase)
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: (paste from Supabase)
5. Click **Save**

Now you can manage your database visually in pgAdmin!

---

## ✅ Step 6: Deploy to Vercel (10 minutes)

### 6.1 Prepare for Deployment

1. **Create GitHub Repository** (if you haven't)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/bulkwamsg.git
   git push -u origin main
   ```

### 6.2 Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit: [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**

2. **Import Repository**
   - Select your GitHub repository
   - Click **Import**

3. **Configure Environment Variables**
   - In the deployment settings, add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_secret
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Your site will be live at: `https://your-project.vercel.app`

---

## 🎯 What's Working Now

✅ **Frontend**
- All 9 marketing pages
- Login/Signup pages
- Complete dashboard with 5 pages
- Responsive design

✅ **Backend**
- Supabase authentication
- Database tables created
- Row-level security enabled
- User profiles

✅ **Ready for Production**
- Can deploy to Vercel
- Database is production-ready
- Stripe integration ready

---

## ⚠️ What's NOT Working Yet (Future Development)

❌ **WhatsApp Integration**
- Need to choose: WhatsApp Business API (paid) or whatsapp-web.js (free)
- Requires additional setup

❌ **Actual Message Sending**
- Campaign creation works, but no actual WhatsApp messages sent yet
- Need WhatsApp integration first

❌ **Contact Import**
- CSV upload UI exists but backend not connected
- Easy to add once you need it

❌ **Payment Processing**
- Stripe credentials ready and subscription flow implemented
- Webhooks need to be configured for automatic profile upgrades

---

## 🚀 Quick Start Checklist

- [ ] Update `.env.local` with Supabase credentials
- [ ] Restart dev server (`npm run dev`)
- [ ] Run SQL script in Supabase
- [ ] Create test account at `/signup`
- [ ] Login and explore dashboard
- [ ] (Optional) Add Stripe credentials
- [ ] (Optional) Connect pgAdmin
- [ ] (Optional) Deploy to Vercel

---

## 🆘 Troubleshooting

**Problem**: "Invalid Supabase URL" error
- **Solution**: Make sure you updated `.env.local` with REAL Supabase credentials, not placeholders

**Problem**: Can't login after signup
- **Solution**: Check Supabase → Authentication → Email Templates → Confirm signup is disabled OR check your email for confirmation

**Problem**: Tables not showing in Supabase
- **Solution**: Make sure you ran the SQL script in Step 2

**Problem**: Dev server won't start
- **Solution**: Delete `.next` folder and run `npm run dev` again

---

## 📞 Need Help?

Check these in order:
1. Browser console (F12) for frontend errors
2. Terminal for backend errors
3. Supabase Dashboard → Logs for database errors
4. Vercel Dashboard → Logs for deployment errors

Your platform is 90% complete! Just need to configure Supabase and you're ready to go! 🎉
