# Cecil Dadzie — Vercel + Supabase deployment

This package keeps the existing portfolio and visual `/admin` forms. It changes content storage to **Supabase PostgreSQL**, login to **Supabase Auth email/password**, and CMS image uploads to **Supabase Storage**. The original images remain in `public/media` for compatibility; any image paths referenced by the seeded content are rewritten to Supabase Storage URLs.

## 1. Supabase project

1. Create a Supabase project and record the project URL, publishable/anon API key, and **secret service-role key** from Supabase project settings. **Never** place the service-role key in `NEXT_PUBLIC_` variables or commit it to Git.
2. Run `supabase/schema.sql` in **Supabase SQL Editor**. It creates one JSONB portfolio document, enables row-level security with no client data policies, and provisions the public `portfolio-media` bucket (5 MB per image). Public images can be read by anyone with their URL; only server-side operations can upload.
3. Open **Authentication → Users** and create/invite a CMS user with an email address and password. Record this email for `ADMIN_EMAILS`. Disable public signups if not needed, and use Supabase email recovery/verification policies as appropriate. Only allowlisted emails can access the CMS after signing in.

## 2. Configure local environment

Copy `.env.example` to `.env.local`, fill in real values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_SERVICE_ROLE_KEY
ADMIN_EMAILS=cecil@example.com
```

Set Vercel **Project Settings → Environment Variables** to these same values (Production, and Preview if you intend to use it). These variables are not included with the archive. Treat `.env.local` as confidential.

## 3. Install, seed and run

```bash
npm install
npm run seed
npm run dev
```

`npm run seed` reads `data/content.json`, uploads files from `public/media` into `portfolio-media/initial/`, updates content image URLs, and inserts row `id=1` into `portfolio_content`. The script runs once; it **rejects overwriting existing content** so your editor changes are not wiped accidentally. Back up Supabase content before any intentional reseed. If you deliberately want to overwrite, set `CONFIRM_OVERWRITE=YES` for that one seed operation.

Open `http://localhost:3000` for the public site; `http://localhost:3000/admin` for the CMS. Sign in with the Supabase Auth email/password, not the previous `ADMIN_PASSWORD`.

## 4. Deploy to Vercel

1. Create a **private** GitHub repository containing the extracted project files. Commit `.env.example`, but **not** `.env.local`, `.env`, `.next` or `node_modules`.
2. Import that repository into Vercel. Choose **Next.js** as the framework and the folder containing `package.json` as the root directory.
3. Configure the four environment variables listed above in Vercel project settings.
4. Deploy. Once the deployment finishes, open the assigned `*.vercel.app` site and verify homepage, expertise pages, project pages, images and `/admin` login.
5. Link a custom domain in Vercel → Domains, then apply its DNS instructions with your domain registrar. Configure any Supabase Auth URL settings if you later enable password-reset links and redirects.

**Important:** Seed the database *before* viewing the public website; otherwise content loading will show a missing-content error. You can seed locally using the same Supabase project before deploying.

## 5. CMS usage

- Open `/admin`, enter the allowlisted email and its Supabase Auth password.
- Choose a section, edit a field, upload a photograph where supported, and click **Save changes**.
- Uploaded images go to `portfolio-media/uploads/` and their public URLs are saved in PostgreSQL when you click Save.
- Entries edited in the CMS become visible on the public site on its next request (public page routes use dynamic rendering).
- The service-role key is used only by trusted server-side code. Public visitors have no database write permission.

## 6. Operational considerations

- Content is stored as a single JSONB document to preserve compatibility with the current CMS forms. Concurrent editors can overwrite one another; use one editor at a time until content versioning is introduced.
- The form-based CMS does **not yet** include draft/publish workflow, image cropping, per-entry roles, audit logs or version history.
- The original image files remain in `public/media` to support legacy hardcoded gallery/hero imagery. They are also uploaded to Storage by the seed command; future work can replace remaining static references with managed media fields.
- Supabase Storage bucket is public so the portfolio can display article and cover imagery; don't upload confidential files.
- Protect the Supabase Auth account with a strong password and MFA if available. Keep secrets out of source control; rotate them if exposed.
- Before deploying, run `npm run lint` and `npm run build`, then complete mobile/browser acceptance checks. This package was source-reviewed but the build could not be completed in the authoring environment because dependency installation timed out.
- Supabase and Vercel may charge for usage beyond their plan allowances; review current prices before choosing a plan.

## 7. Troubleshooting

- **Missing Supabase variables:** Confirm local `.env.local`, or Vercel environment variable settings, and redeploy after edits.
- **Portfolio content missing:** Apply schema, check bucket existence and run `npm run seed` once.
- **401 on CMS:** Sign in to an existing Supabase Auth user and ensure its email appears in `ADMIN_EMAILS` (comma-separated if several).
- **Cannot upload:** Confirm service-role key, `portfolio-media` bucket, image format (JPG/PNG/WebP) and 5 MB limit.
- **Login cookies not retained:** Confirm the site is accessed over HTTPS in production, avoid multiple hostnames during sign-in and verify Supabase URL/key values.
- **Origin invalid:** Access the site through its actual hostname, rather than an embedded cross-origin preview.

## Security notes

The service-role key bypasses RLS and is restricted to server-only helpers. The public website accesses content through server rendering. Auth operations use Supabase's server cookie adapter; admin APIs call `auth.getUser()` and check `ADMIN_EMAILS`. Mutation routes require a matching `Origin` header. Keep these restrictions intact when extending the CMS.
