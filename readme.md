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

If you're interested in copying the CSV visualizer, be my guest!
You need `books.html`, `books.js` and the `fonts`.
The "CSV" is just within the `books.js` file, I know that's bad but you know what's worse? To have to edit a CSV file everytime you want to update something to your table, trust me.

git add -A
git commit -m "Some change"
git push origin master   # or main

then

npm run deploy