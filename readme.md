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

In order to update the reading-list you have to directly edit the file here: `public/books.js`

---

git add -A
git commit -m "Some change"
git push origin master   # or main

then

npm run deploy