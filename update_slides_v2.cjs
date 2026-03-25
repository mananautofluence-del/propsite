const fs = require('fs');
const path = require('path');

const blocksDir = path.join(__dirname, 'src', 'components', 'presentation-blocks');
const files = fs.readdirSync(blocksDir).filter(f => f.endsWith('.tsx') && f !== 'SlideShell.tsx');

const helperSnippet = `function getPhotos(photos: PresentationPhoto[], tags: string[], count: number): string[] {
  const result: string[] = [];
  const used = new Set<string>();
  for (const tag of (tags || [])) {
    if (result.length >= count) break;
    const match = photos.find(p => p.tag === tag && !used.has(p.url));
    if (match) { result.push(match.url); used.add(match.url); }
  }
  for (const photo of photos) {
    if (result.length >= count) break;
    if (!used.has(photo.url)) { result.push(photo.url); used.add(photo.url); }
  }
  return result;
}
function getPhoto(photos: PresentationPhoto[], tags: string[]): string {
  return getPhotos(photos, tags || [], 1)[0] || '';
}`;

files.forEach(file => {
  const filepath = path.join(blocksDir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Replace Props interface entirely
  const propsRegex = /interface\s+Props\s*\{[\s\S]*?\}/;
  content = content.replace(propsRegex, `interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}`);

  // 2. Replace photo helper functions. They typically live right above 'export default function ComponentName'
  // So we strip everything from 'function getPhoto' up to the exact line before 'export default function'
  content = content.replace(/function\s+getPhoto(?:s)?[\s\S]*?(?=\bexport\s+default\s+function)/, helperSnippet + '\n\n');

  // 3. Update component signature
  // e.g. export default function CoverEditorial({ data, theme, photos }: Props)
  const sigRegex = /(export\s+default\s+function\s+[A-Za-z0-9_]+)\(\{\s*data,\s*theme,\s*photos\s*\}\s*:\s*Props\)/;
  content = content.replace(sigRegex, '$1({ data, theme, photos, pageNumber }: Props)');

  // 4. Transform <img ...> tags
  content = content.replace(/<img([^>]*)>/g, (match, attrs) => {
    let newAttrs = attrs;
    if (!newAttrs.includes('crossOrigin')) {
      newAttrs = newAttrs + ' crossOrigin="anonymous" ';
    }
    
    // Check if it has a style prop
    const styleMatch = newAttrs.match(/style=\{\{([^}]*)\}\}/);
    if (styleMatch) {
      let styleContent = styleMatch[1];
      if (!styleContent.includes('objectPosition')) {
        styleContent += `, objectPosition: 'center center'`;
      }
      if (!styleContent.includes('display')) {
        styleContent += `, display: 'block'`;
      }
      newAttrs = newAttrs.replace(styleMatch[0], `style={{${styleContent}}}`);
    } else {
      // no style prop internally, add one
      newAttrs += ` style={{ objectPosition: 'center center', display: 'block' }}`;
    }
    
    return `<img${newAttrs}>`;
  });

  fs.writeFileSync(filepath, content, 'utf8');
});

console.log('Slides updated!');
