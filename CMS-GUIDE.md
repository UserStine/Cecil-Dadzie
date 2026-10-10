# Cecil Dadzie — visual CMS

Open `/admin` on the website and sign in using the password configured for your deployment.

## Set up locally

1. Copy `.env.example` to `.env.local`.
2. Set a strong `ADMIN_PASSWORD` and a separate long `ADMIN_SESSION_SECRET`.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000/admin`.

## How Cecil uses it

- Choose a section from the sidebar (Profile, Projects, Publications, Expertise, Education, Volunteering, Certifications or Organisations).
- Select an entry to edit it, or choose **Add new**.
- Fill out the labelled text fields. For projects and publications, use the image uploader to choose an image from the computer or phone.
- Press **Save changes** to make the edits available to the public site. Use **View website** to check the result.
- To delete an entry, open it, choose **Delete entry**, then **Save changes**.

## Important deployment limitations

This release is a form-based administrative UI on top of the existing local JSON content storage. It **does not yet use Payload CMS or PostgreSQL**, and it does not yet include email login, forgot-password emails, multiple admins, draft/publish workflow, or cloud media storage. Auth uses a password in `.env.local` and a signed HTTP-only cookie.

Content is written to `data/content.json` (or `CONTENT_FILE` if configured). Uploaded images are written to `public/media/`. Both locations **must be writable and persistent**. Do not deploy this version to a serverless filesystem such as standard Vercel functions: edits and image uploads won't persist correctly. A persistent VM or other writable host is required until the database and cloud storage upgrade.

Back up both the content JSON file and uploaded `public/media/` images regularly. Some file paths refer to bundled images; deleting a content record does not delete a physical media file.

The CMS is useful for a single administrator on a persistent server. Production hardening still requires rate limiting on sign-in, a full deployment review, and preferably a managed authentication/database/media setup.
