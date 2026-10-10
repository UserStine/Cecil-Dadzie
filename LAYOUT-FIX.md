# Root layout runtime error

The previous ZIP already contained `<html>` and `<body>` in `app/layout.tsx`. This package rewrites that layout with explicit multi-line markup. If the error persists, check that you are running this project folder (not an older extracted copy), stop the server, remove `.next` and restart.

Windows PowerShell from the project root:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
npm run dev
```

Confirm the project root contains `package.json`, `app/layout.tsx`, `app/page.tsx` and `components/Home.tsx`. Do not create another nested `app` folder. CMS persists as before.
