-- Run this in Supabase SQL Editor to clear the old HTML content
-- and start fresh with markdown

UPDATE collaborative_dashboard
SET
  content = '# Welcome to the Dashboard

This is a **collaborative** markdown editor!

## Features
- [Links work](https://example.com)
- **Bold text**
- `inline code`
- Lists

```javascript
// Code blocks with syntax highlighting
const greeting = "Hello World";
console.log(greeting);
```

Click "Edit" to start writing your own markdown!',
  last_updated_by = 'System',
  updated_at = NOW()
WHERE id = 1;
