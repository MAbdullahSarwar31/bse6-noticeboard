# Viva Preparation — Campus Notice Board
**Bahria University Lab 10A | React + Supabase**

---

## Q1 — What does `USING (true)` mean in the notices SELECT policy, and why use it?

`USING (true)` means the condition that must be satisfied for a row to be **visible** is always `true` — every row passes. We use it on the `notices` SELECT policy because notice boards are public: anyone (including unauthenticated visitors) should be able to **read** all notices. This is safe precisely because all other operations (INSERT, DELETE) are protected by stricter policies that check `auth.uid()`.

---

## Q2 — A malicious user calls the Supabase REST API directly to delete another user's notice. What happens?

Supabase evaluates the RLS policy `notices_delete_own` which has `USING (auth.uid() = user_id)` **on the database server**, not in the app. The attacker's JWT identifies them by their own `auth.uid()`, which will not match the `user_id` of the target notice. PostgreSQL returns **zero rows deleted** — the delete silently fails. Even if the attacker has the anon key, they cannot forge a different `auth.uid()` because that value is extracted from the cryptographically signed JWT by Supabase's server.

---

## Q3 — Why is the `anon` key safe to expose in the frontend, but the `service_role` key is not?

The `anon` key instructs Supabase to treat the request as an **unauthenticated (anonymous) user** and therefore every request is still subject to all RLS policies. The `service_role` key is a **superuser bypass key** — it completely skips RLS, meaning anyone holding it can read, update, or delete any row in any table. Exposing `service_role` in a frontend bundle would give anyone who inspects the JavaScript source file unrestricted access to the entire database.

---

## Q4 — Where is `auth.uid()` evaluated — in our React code or somewhere else?

`auth.uid()` is a **PostgreSQL function** evaluated entirely on the **Supabase database server** at query time. Our React code never calls it directly. When we call `supabase.from('notices').delete()`, Supabase's PostgREST layer extracts the user's identity from the JWT bearer token attached to the request, converts it to a `uuid`, and makes it available as `auth.uid()` inside every RLS policy expression during that transaction. It is impossible for client-side code to spoof this value.

---

## Q5 — The app works on localhost but Supabase Auth fails after deploying to Vercel. Most likely cause and fix?

The most likely cause is that Supabase's **Allowed Redirect URLs** list only contains `http://localhost:5173` and does not include the Vercel production URL. After a user clicks an email confirmation link, Supabase redirects them back to the app — if the redirect URL is not on the allowlist, Supabase blocks it as a security measure. **Fix:** Go to Supabase Dashboard → Authentication → URL Configuration, set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`), and add `https://your-app.vercel.app/**` to the **Redirect URLs** list, then save.

---

## Q6 — What is the difference between DaaS and BaaS? Use two specific features of this app as examples.

**BaaS (Backend-as-a-Service)** provides ready-made backend services — authentication, a hosted database, storage, and APIs — without the developer building or managing any server code. **DaaS (Database-as-a-Service)** is narrower: it provides only a managed, hosted database (provisioning, backups, scaling) while the developer still writes all API and business logic layers.

In this app, **Supabase Auth** (sign-up, sign-in, JWT management) is a pure **BaaS** feature — we consumed it with two lines of code and wrote zero server logic. **Supabase PostgreSQL** (the `notices` and `profiles` tables we created) acts as **DaaS** — a fully managed relational database where we wrote SQL and RLS policies but Supabase handled hosting, replication, and scaling.
