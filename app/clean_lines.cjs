const fs = require('fs');

function cleanFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/^\s*\d+:\s/gm, '');
  fs.writeFileSync(path, content);
}

cleanFile('src/tabs/AchieveTab.jsx');
cleanFile('src/tabs/InactionTab.jsx');
console.log('Cleaned tabs');
