const fs = require('fs');
const path = require('path');

// Get all markdown files from the posts directory
const postsDir = path.join(__dirname, '../public/posts');
const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.md'))
  .map(file => ({ file }));

// Write the list to a JSON file
fs.writeFileSync(
  path.join(postsDir, 'post-list.json'),
  JSON.stringify(files, null, 2)
);
