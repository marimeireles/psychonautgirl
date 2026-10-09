import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the TypeScript file
const booksTs = readFileSync(
  join(__dirname, '../src/data/books.ts'),
  'utf-8'
);

// Extract just the dataString content
const dataStringMatch = booksTs.match(/const dataString =\s*`([\s\S]*?)`/);

if (!dataStringMatch) {
  throw new Error('Could not find dataString in books.ts');
}

const dataString = dataStringMatch[1];

// Generate the JavaScript file
const booksJs = `const dataString =
\`${dataString}\`

// Parse the data into an array of objects
const data = dataString.split('\\n').slice(1).map(line => {
    const [Name, Status, Type, Author, Notes] = line.split(',');
    return {
        Name: Name || '',
        Status: Status || '',
        Type: Type || '',
        Author: Author || '',
        Notes: Notes || ''
    };
}).filter(book => book.Name.trim() !== '') // Filter out empty lines
  .reverse(); // Newest additions (appended last) first

// Pastel colour per tag: tags sorted alphabetically, hues spaced by the
// golden angle so every tag is distinct.
const tagHues = (() => {
    const tags = new Set();
    data.forEach(b => b.Type.split(';').map(t => t.trim().toLowerCase()).filter(Boolean).forEach(t => tags.add(t)));
    const hues = {};
    [...tags].sort().forEach((tag, i) => { hues[tag] = (i * 137.508) % 360; });
    return hues;
})();

function getTagStyle(tag) {
    const hue = tagHues[tag.toLowerCase()] || 0;
    const tilt = ((Math.random() - 0.5) * 7).toFixed(1);   // each post-it stuck on a little crooked
    return \`background-color: hsl(\${hue}, 90%, 84%); color: hsl(\${hue}, 45%, 30%); transform: rotate(\${tilt}deg);\`;
}

// Function to format types with colored tags
function formatTypes(typeString) {
    if (!typeString || typeString.trim() === '') return '';
    const types = typeString.split(';').map(t => t.trim()).filter(Boolean);
    return types.map(type => {
        return \`<span class="tag" style="\${getTagStyle(type)}">\${type}</span>\`;
    }).join(' ');
}

// Each entry gets its own handwriting. Sizes are nudged per face so rows stay
// roughly the same height; the pick is by row index so it's stable on reload.
const handwriting = [
    ["Caveat", 1.25],
    ["Kalam", 1.0],
    ["Patrick Hand", 1.1],
    ["Indie Flower", 1.05],
    ["Reenie Beanie", 1.35],
    ["Nanum Pen Script", 1.3],
    ["Shadows Into Light", 1.15],
    ["Gloria Hallelujah", 0.95],
    ["Zeyada", 1.45],
    ["Homemade Apple", 0.9],
    ["Covered By Your Grace", 1.15],
    ["Just Another Hand", 1.45],
    ["Architects Daughter", 0.95],
    ["La Belle Aurore", 1.15],
    ["Waiting for the Sunrise", 1.2],
    ["Rock Salt", 0.8],
];

function rowFontStyle(i) {
    const [face, scale] = handwriting[i % handwriting.length];
    return \`font-family: '\${face}', 'Patrick Hand', cursive; font-size: \${scale}em;\`;
}

// Weathering: wrap each glyph so it can be nudged a little, like uneven pen pressure.
// Some glyphs get a thin transparent band cut through them, like a ballpoint skipping.
// Glyphs are grouped per word so lines still only break at spaces.
function weather(text) {
    if (!text) return '';
    return String(text).split(' ').map(word => {
        if (!word) return '';
        let out = '';
        for (const ch of word) {
            const size = (0.92 + Math.random() * 0.16).toFixed(2);     // 0.92 - 1.08 em
            const rot = ((Math.random() - 0.5) * 5).toFixed(1);          // -2.5 - 2.5 deg
            const dy = ((Math.random() - 0.5) * 2).toFixed(1);           // -1 - 1 px
            const op = (0.78 + Math.random() * 0.22).toFixed(2);         // ink pressure
            let style = \`font-size:\${size}em;transform:rotate(\${rot}deg) translateY(\${dy}px);opacity:\${op}\`;
            if (Math.random() < 0.12) {
                // pen skip: a band of the glyph goes missing
                const angle = Math.floor(Math.random() * 180);
                const at = Math.floor(Math.random() * 80);
                const gap = 4 + Math.floor(Math.random() * 8);
                style += \`;color:transparent;-webkit-background-clip:text;background-clip:text;background-image:linear-gradient(\${angle}deg, var(--ink) \${at}%, transparent \${at}%, transparent \${at + gap}%, var(--ink) \${at + gap}%)\`;
            } else if (Math.random() < 0.05) {
                // faint patch: ink ran dry a bit
                style += ';opacity:0.5';
            }
            out += \`<span class="ch" style="\${style}">\${ch}</span>\`;
        }
        return \`<span class="word">\${out}</span>\`;
    }).join(' ');
}

// Function to populate the table
function populateTable(dataArray) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    dataArray.forEach((item, i) => {
        const row = document.createElement('tr');
        row.style.cssText = rowFontStyle(i);
        row.innerHTML = \`
            <td>\${weather(item.Name)}</td>
            <td class="status-column">\${weather(item.Status)}</td>
            <td>\${formatTypes(item.Type)}</td>
            <td>\${weather(item.Author)}</td>
            <td>\${weather(item.Notes)}</td>
        \`;
        tableBody.appendChild(row);
    });
}

// ---- View: search + sort + pagination all work on the data, not the DOM
const PAGE_SIZE = 200;
let view = data.slice();
let page = 0;
let currentSort = null; // { column, order }
let query = '';

function applyView() {
    const q = query.toLowerCase();
    view = q
        ? data.filter(b => Object.values(b).some(v => String(v).toLowerCase().includes(q)))
        : data.slice();
    if (currentSort) {
        const { column, order } = currentSort;
        view.sort((a, b) => {
            const x = String(a[column]).toLowerCase(), y = String(b[column]).toLowerCase();
            if (x === y) return 0;
            return (x > y ? 1 : -1) * (order === 'asc' ? 1 : -1);
        });
    }
    const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
    page = Math.min(page, pages - 1);
    render();
}

function render() {
    const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
    populateTable(view.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
    if (window.setScribblePage) window.setScribblePage(page);
    const pager = document.getElementById('pager');
    if (!pager) return;
    pager.style.display = pages > 1 ? '' : 'none';
    document.getElementById('pager-label').innerHTML = weather(\`page \${page + 1} of \${pages}\`);
    document.getElementById('pager-prev').disabled = page === 0;
    document.getElementById('pager-next').disabled = page >= pages - 1;
}

function goPage(delta) {
    const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
    const next = Math.max(0, Math.min(pages - 1, page + delta));
    if (next === page) return;
    page = next;
    render();
    document.getElementById('paper-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to sort data
function sortData(column, order) {
    currentSort = { column, order };
    page = 0;
    applyView();
}

// Called from the search box
function filterData() {
    query = document.getElementById('searchInput').value;
    page = 0;
    applyView();
}

// Initialize table on page load
document.addEventListener('DOMContentLoaded', () => {
    applyView();
});
`;

// Write to public directory (will be copied to dist by Vite)
writeFileSync(
  join(__dirname, '../public/books.js'),
  booksJs,
  'utf-8'
);

console.log('✓ Generated books.js from books.ts');
