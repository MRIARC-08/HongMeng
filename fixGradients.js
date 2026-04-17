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
    .replace(/linear-gradient\(135deg, #ff4500, #[a-f0-9]+\)/gi, '#ff4500')
    .replace(/linear-gradient\(90deg, #ff4500, #[a-f0-9]+\)/gi, '#ff4500')
    .replace(/linear-gradient\(90deg, \${card\.color}, transparent\)/gi, 'var(--accent)') // fallback
    .replace(/linear-gradient\(180deg, #303030 0%, #0e0e0e 100%\)/gi, '#161616')
    .replace(/linear-gradient\(135deg, rgba\(255,69,0,0\.06\) 0%, rgba\(255,69,0,0\.02\) 100%\)/gi, 'rgba(255,69,0,0.06)')
    .replace(/radial-gradient\(ellipse, rgba\(255,69,0,0\.08\) 0%, transparent 70%\)/gi, 'transparent')
    .replace(/radial-gradient\(circle, rgba\(255,106,51,0\.05\) 0%, transparent 70%\)/gi, 'transparent')
    .replace(/radial-gradient\(ellipse at 40% 50%, rgba\(255,69,0,0\.04\) 0%, transparent 60%\)/gi, 'transparent')
    .replace(/radial-gradient\(ellipse, rgba\(255,69,0,0\.06\) 0%, transparent 70%\)/gi, 'transparent')
    .replace(/background: linear-gradient\(90deg, #303030 0%, #303030 50%, #303030 100%\);/g, 'background: #303030;');

  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Removed gradients in', file);
  }
});
