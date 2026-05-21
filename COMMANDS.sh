# ============================================================
# DEPLOYMENT QUICK-START — Run these commands in order
# from:  d:\CC OEL\campus-noticeboard
# ============================================================

# STEP 1 — Install dependencies
npm install

# STEP 2 — Create your .env.local (fill in YOUR Supabase values)
# Copy the example file and edit it:
copy .env.local.example .env.local
# Then open .env.local and paste your Supabase URL + anon key

# STEP 3 — Verify the build compiles without errors
npm run build

# STEP 4 — Initialise Git
git init
git add .
git commit -m "feat: Campus Notice Board — Bahria University Lab 10A"

# STEP 5 — Create GitHub repo (replace YOUR_USERNAME)
# Go to https://github.com/new and create an EMPTY repo named: campus-noticeboard
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/campus-noticeboard.git
git branch -M main
git push -u origin main

# STEP 6 — Deploy via Vercel CLI (optional — or use vercel.com UI)
# Install Vercel CLI globally:
npm install -g vercel
# Login:
vercel login
# Deploy (it will prompt for env vars):
vercel --prod
