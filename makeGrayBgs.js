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
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  let updated = content
    .replace(/#0a0a0a/gi, '#161616')
    .replace(/#090909/gi, '#161616')
    .replace(/#080b10/gi, '#161616')
    
    .replace(/#111111/gi, '#1e1e1e')
    .replace(/#111(?![0-9a-fA-F])/g, '#1e1e1e')
    
    .replace(/#161616/gi, '#252525')
    .replace(/#151515/gi, '#252525')
    
    .replace(/#1a1a1a/gi, '#2a2a2a')
    
    .replace(/#1e1e1e/gi, '#303030')
    .replace(/#222222/gi, '#323232')
    
    .replace(/#2a2a2a/gi, '#3a3a3a')
    
    .replace(/#3a3a3a/gi, '#4a4a4a')
    .replace(/#333333/gi, '#424242')
    .replace(/#333(?![0-9a-fA-F])/g, '#424242');

  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Bumped grays in', file);
  }
});
