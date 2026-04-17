const fs = require('fs');

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

  // We only replace exact known colors to avoid breaking logic.
  let updated = content
    .replace(/color:\s*"#666666"/g, 'color: "#a0a0a0"')
    .replace(/color:\s*"#666"/g,    'color: "#a0a0a0"')
    .replace(/color:\s*"#888888"/g, 'color: "#cccccc"')
    .replace(/color:\s*"#888"/g,    'color: "#cccccc"')
    .replace(/color:\s*"#555555"/g, 'color: "#909090"')
    .replace(/color:\s*"#555"/g,    'color: "#909090"')
    .replace(/color:\s*"#444444"/g, 'color: "#7a7a7a"')
    .replace(/color:\s*"#444"/g,    'color: "#7a7a7a"')
    .replace(/color:\s*"#e0e0e0"/g, 'color: "#ffffff"')
    .replace(/color:\s*"#ccc"/g,    'color: "#ffffff"')
    .replace(/color:\s*"#bbb"/g,    'color: "#ffffff"');

  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Bumped colors in', file);
  }
});
