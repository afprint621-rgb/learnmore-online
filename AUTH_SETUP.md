# Parent account setup

The account pages are connected to Supabase Auth and a database schema with row-level security. They are **not ready for real family data until you configure and test a Supabase project**. The browser code uses only the Supabase publishable/anon key; never put the service-role key in the website or this repository.

## Set up the backend

1. Create a Supabase project at [supabase.com](https://supabase.com/). Keep the database password private.
2. In the Supabase SQL Editor, run the contents of `supabase-schema.sql`.
3. In Supabase project settings, copy the **Project URL** and the **publishable key** (or legacy anon key). Do not copy the service-role/secret key.
4. Replace the two placeholder values in `supabase-config.js` with the Project URL and publishable/anon key. These two values are intended to be used in a browser; database row-level security is what protects the records.
5. In Supabase Authentication settings, enable email confirmations. Configure the site URL and allowed redirect URLs for your local preview and eventual deployed site. For local testing, use the same origin and port that serves the files, such as `http://localhost:8000/**`.
6. Serve the repository over HTTP; ES modules will not work by opening the HTML files as `file://` URLs. For example, from the project folder run `python -m http.server 8000`, then visit `http://localhost:8000/auth.html`.
7. Create a test parent account, confirm its email, sign in, add two test learner profiles, and verify a third is rejected. Test that signing out and signing in works. Do not use children’s real information while testing.

## What the account pages do

- `auth.html`: adult email/password sign-up and sign-in; password confirmation is handled by Supabase Auth.
- `account.html`: adult profile name and up to two learner profiles, including grade and preferred language.
- `supabase-schema.sql`: parent/learner tables, ownership policies, and a database-enforced two-child limit.

## Security and remaining work before production

- This is a starter implementation, not a completed security or compliance review. Test database policies and account recovery with a qualified developer before launch.
- Use HTTPS in deployment, configure email verification and password reset, and restrict Supabase Auth redirect URLs to your actual domains.
- Keep child profiles minimal. Do not add full names, birthdays, school names, addresses, photos, or other sensitive child data unless there is a clear need and an appropriate privacy/legal review.
- Never upload payment proof to a public repository or expose it to other parents. Payment review needs a separate private, access-controlled workflow.
- The current account pages do not implement subscriptions, manual EcoCash payment verification, videos, quizzes, progress, shop orders, admin roles, or native mobile apps.
- The static landing page and old dashboard mock-up still contain demo content; they are not authenticated account pages. Use `auth.html` for the connected parent sign-in and `account.html` for the connected family account.
