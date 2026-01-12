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
}).filter(book => book.Name.trim() !== ''); // Filter out empty lines

// Generate random pastel color
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
    const lightness = 55 + Math.floor(Math.random() * 15); // 55-70%
    return \`hsl(\${hue}, \${saturation}%, \${lightness}%)\`;
}

// Function to format types with colored tags
function formatTypes(typeString) {
    if (!typeString || typeString.trim() === '') return '';
    const types = typeString.split(';');
    return types.map(type => {
        const color = getRandomColor();
        return \`<span class="tag" style="background-color: \${color};">\${type.trim()}</span>\`;
    }).join(' ');
}

// Function to populate the table
function populateTable(dataArray) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';
    dataArray.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = \`
            <td>\${item.Name}</td>
            <td class="status-column">\${item.Status}</td>
            <td>\${formatTypes(item.Type)}</td>
            <td>\${item.Author}</td>
            <td>\${item.Notes}</td>
        \`;
        tableBody.appendChild(row);
    });
}

// Function to sort data
function sortData(column, order) {
    const sortedData = [...data].sort((a, b) => {
        if (order === 'asc') {
            return a[column] > b[column] ? 1 : -1;
        } else {
            return a[column] < b[column] ? 1 : -1;
        }
    });
    populateTable(sortedData);
}

// Initialize table on page load
document.addEventListener('DOMContentLoaded', () => {
    populateTable(data);
});
`;

// Write to public directory (will be copied to dist by Vite)
writeFileSync(
  join(__dirname, '../public/books.js'),
  booksJs,
  'utf-8'
);

console.log('✓ Generated books.js from books.ts');
