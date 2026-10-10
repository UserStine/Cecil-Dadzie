# Cecil Dadzie — Editorial Portfolio + Content Manager

## Local development

1. Install Node.js 20.9+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`, and replace BOTH sample secrets.
4. Run `npm run dev` and visit http://localhost:3000.
5. Visit http://localhost:3000/admin and log in with `ADMIN_PASSWORD`.

## Content manager

The admin lets you edit all site sections, expertise, publications, projects, volunteering, education, certifications and organisations as structured JSON. Select a section, edit its values while keeping property names, click **Save changes**, then refresh the public site. `data/content.json` provides the initial content and is updated on save. Admin requests require a signed, HttpOnly cookie, protected by `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.

**Deployment:** This file-backed CMS works on local machines or VPS deployments with a persistent writable disk. On Vercel or another read-only/ephemeral environment, replace file storage with Postgres/managed CMS before production. Treat `/admin` as a simple owner interface, not a multi-user publishing workflow. Set strong environment secrets, use HTTPS and restrict admin access as appropriate. Media file uploads are not included; place assets in `public/media`, and refer to them with `/media/...` paths.

## Source and verification

The site content includes education, volunteering and organisations transcribed from the supplied LinkedIn screenshots. The public profile screenshots include many certifications whose tiny labels cannot be confidently read; the initial certification list therefore includes only legible entries and should be completed using source records before publishing. Project cards are explicitly experience spotlights, not outcome claims. Three provided newspaper clippings are featured in Publications.

Contact CTAs open Cecil's LinkedIn profile, rather than a placeholder email. Expertise arrows open `/expertise/[slug]`, and project thumbnails open `/work/[slug]`.

## Commands
`npm run dev` · `npm run build` · `npm run lint` · `npm start`


## Brand identity update

The header and footer now use Cecil Dadzie’s selected monogram and wordmark.
The source logo has been cropped for the website and saved at `public/media/cecil-dadzie-logo.png`.
The monogram is at `public/media/cecil-dadzie-monogram.png` and a browser icon is generated at `app/icon.png`.
For other sizes or placements, update `.site-logo` and `.footer-logo` in `app/globals.css`.


## October 2026 media update

- Replaced the presentation/award handover photo in the portfolio gallery with Cecil presenting.
- The Curious Minds work spotlight and gallery now use the supplied photograph of Cecil in yellow.
- Added the barber communication article to Publications (publication date to confirm).
- Added IPR Ghana, Digital Marketers Conference, Asaase Radio, and UniMAC event features.
- Expanded the moments gallery with speaking and training photos.
- Original media files live under `public/media/` and references can be changed in `data/content.json`.


## Visual content management

The `/admin` interface now uses labelled forms, entry lists, search, and photo upload instead of JSON editing. See [CMS-GUIDE.md](CMS-GUIDE.md) for setup, usage and production limitations.
