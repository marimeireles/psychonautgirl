This whole thing is free for you to use, study, share & improve.

![](https://fsfe.org/contribute/promopics/ilovefs-sticker_burgundy_thumb.png)

---

## Supabase Setup

For chat, guestbook, scratch pad, and secret anki features:

1. Add your credentials to `.env`:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

2. Run `supabase-schema.sql` in your Supabase SQL Editor.

---

## Updating the reading list

1. Edit `src/data/books.ts` — one book per line in the CSV: `Name,Status,Type,Author,Notes`
   - Status: `Read`, `Reading`, `Want to read`, `Stalled`, `Abandoned`, `Reference`
   - Type: use semicolons for multiple tags (e.g. `philosophy;buddhism`)
2. `public/books.js` is auto-generated — don't edit it directly.
   It syncs automatically on `npm run dev` and `npm run build` via `scripts/generate-books-js.js`.

---

git add -A
git commit -m "Some change"
git push origin master   # or main

then

npm run deploy