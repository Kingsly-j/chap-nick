# Chap Nic Pictures

A Next.js 16 App Router photography portfolio with TypeScript, React, Firebase Analytics, and server-only Firebase Admin helpers.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000 (or use `npm run dev -- --port 3100`). Production: `npm run build`, then `npm start`.

## Portfolio content

- `src/lib/media.json`: 40 curated photographs and a film cover, including original source URLs and descriptive alt text.
- `public/photos/`: local copies of the selected images for reliable rendering.
- `src/lib/films.json`: 10 YouTube films discovered in the supplied Pixieset video collection.
- `src/lib/collections.ts`: chapter titles, copy, and original collection links.
- `src/components/portfolio.tsx`: hero slideshow, scroll effects, collection categories, click-to-play film viewer, mobile menu, and email enquiry composer.
- `src/app/globals.css`: responsive editorial design and reduced-motion support.

Photo sources: https://chapnicpictures.pixieset.com/chapnicpicturesportfolio/ (weddings, portraits, events, architecture, baby, videos). Biography, location, phone, and email were sourced from https://chapnicpictures.pixieset.com/. No testimonials or client claims have been invented. The about-section photograph is labeled as portfolio work, not a portrait of the photographer.

The enquiry form opens the visitor's email app; it does not submit or store enquiries on a server. Film playback uses YouTube embeds and needs internet access. Font families load from Google Fonts, with local fallbacks. Motion can be paused in the hero or footer; system reduced-motion preferences are respected.

## Firebase

Copy `.env.local.example` to `.env.local` on a fresh checkout. Browser Analytics initializes only in supported environments. Admin helpers are protected with `server-only` and load private credentials from the local path in `GOOGLE_APPLICATION_CREDENTIALS`. Never commit service-account JSON or put Admin credentials in `NEXT_PUBLIC_` variables. Configure a production credential source separately; the local Windows file path is not portable.

## Studio dashboard

Open `/admin`. The first administrator is `cheking1270@gmail.com`. Use the private link in `.private/first-admin-setup.txt` to choose a password, or use **Set or reset password** on the sign-in page. The setup file is excluded from Git.

Administrators can create and edit collections, add one or multiple direct photo URLs, choose a cover, set the category and display order, write a collection story and per-slide captions, reorder frames, save drafts, publish, and delete collections. The **Administrators** tab grants the same access to additional email addresses. New accounts receive a private setup link in the dashboard; no invitation email is automatically sent. Existing accounts retain their current password.

Published collections are stored in Firestore at `portfolioCollections`. Visitors browse cards by category and open `/gallery/[id]` for the full story and keyboard-accessible slideshow. Draft pages are not publicly accessible. All writes use server-side Firebase token verification and current admin-role checks. Direct client Firestore access remains denied.

`node scripts/setup-studio.mjs` provisions the first admin and only creates missing starter collections; it does not overwrite existing edits. The Mic Monsta spotlight is near the top of the homepage and links to the editable `mic-monsta` collection.

## Validation

`npm run build` includes TypeScript validation. The local browser check covers desktop/mobile layout, gallery filtering, keyboard lightbox, film selection, and mobile navigation.

Run `node --experimental-strip-types --test tests/collection-validation.test.mjs` to check collection limits, URL handling, required image descriptions, valid dates, and draft flags.
