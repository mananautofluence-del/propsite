import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/manan/Downloads/propsite-74d23134-main/propsite-74d23134-main/src/components/presentation-blocks';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx') && file !== 'SlideShell.tsx') {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Globally strip any line that contains letterSpacing
    const newContent = content.replace(/^.*letterSpacing:.*$\n/gm, '');
    
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent);
      console.log(`Stripped letterSpacing from ${file}`);
    }
  }
});
