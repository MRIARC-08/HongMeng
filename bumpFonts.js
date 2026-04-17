const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
    let size = parseInt(p1, 10);
    return `fontSize: ${size + 1}`;
  });
  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Bumped fonts in', file);
  }
});
