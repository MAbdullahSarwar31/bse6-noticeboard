# Campus Notice Board — Deployment Guide
**Bahria University Lab 10A | React + Supabase + Vercel**

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** from  
   `Settings → API`
3. Open **SQL Editor**, paste the entire contents of `supabase_setup.sql`, and click **Run**
4. Confirm all 5 policies were created:  
   `Settings → Database → Policies` → look for `profiles` and `notices`

---

## Step 2 — Local Development

```bash
# Clone or enter the project folder
cd campus-noticeboard

# Install dependencies
npm install

# Create your local env file
cp .env.local.example .env.local
```

Edit `.env.local` and paste your credentials:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

```bash
# Start the dev server
npm run dev
```

---

## Step 3 — Git Setup & First Commit

```bash
# Initialise git (skip if already done)
git init

# Verify .gitignore is correct (lab commands)
cat .gitignore | grep env
cat .gitignore | grep node

# Expected output:
# .env.local
# .env
# node_modules/

# Stage and commit
git add .
git commit -m "feat: initial Campus Notice Board — Bahria University Lab 10A"
```

---

## Step 4 — GitHub Repository

```bash
# Create a new EMPTY repo on github.com, then:
git remote add origin https://github.com/<your-username>/campus-noticeboard.git
git branch -M main
git push -u origin main
```

> ⚠ Make sure `.env.local` is listed in `.gitignore` **before** pushing.  
> Run `git status` and confirm `.env.local` does NOT appear in the list.

---

## Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository `campus-noticeboard`
3. Vercel auto-detects **Vite** — no build settings needed
4. Before clicking **Deploy**, open **Environment Variables** and add:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci…` |

5. Click **Deploy** — wait ~60 seconds
6. Copy the deployment URL, e.g. `https://campus-noticeboard-abc123.vercel.app`

---

## Step 6 — Configure Supabase Auth URLs

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL:  
   `https://campus-noticeboard-abc123.vercel.app`
3. Under **Redirect URLs**, add:  
   `https://campus-noticeboard-abc123.vercel.app/**`
4. Click **Save**

> This step is required. Without it, Supabase will reject auth redirects  
> and email confirmation links will fail on the deployed URL.

---

## Step 7 — Post-Deploy Verification Checklist

Work through this 9-item checklist after deploying:

- [ ] **1. Page loads** — Visit your Vercel URL, the Campus Notice Board header appears
- [ ] **2. Auth form** — "Create Account" and "Sign In" tabs both render correctly
- [ ] **3. Sign up** — Create a new account; profile row appears in Supabase `profiles` table
- [ ] **4. Sign in** — Sign in with the new account; header shows your email prefix
- [ ] **5. Post notice** — Click the FAB (+), fill in title/body/category, submit; card appears instantly
- [ ] **6. Realtime** — Open the app in a second tab; post from one tab and confirm it appears in the other without refreshing
- [ ] **7. Category filter** — Click each pill and confirm the grid filters correctly
- [ ] **8. Delete** — Click 🗑 on your own notice, confirm inline prompt, verify it is removed
- [ ] **9. RLS enforced** — Sign out; confirm the notice feed is still visible but the FAB shows a toast "Please sign in to post"

---

## Quick Troubleshooting

| Symptom | Fix |
|---|---|
| "Missing Supabase environment variables" error | Ensure both `VITE_` vars are set in Vercel → Settings → Environment Variables, then redeploy |
| Auth works on localhost but fails on Vercel | Add your Vercel URL to Supabase → Auth → URL Configuration → Redirect URLs |
| Notices not appearing in realtime | Verify `ALTER PUBLICATION supabase_realtime ADD TABLE notices;` was run in SQL Editor |
| Profile not created on signup | Check the `on_auth_user_created` trigger exists in SQL Editor: `SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';` |
