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

  // Change 1: Update Props
  const propsRegex = /interface\s+Props\s*{\s*data:\s*SlideData;\s*theme:\s*ThemeConfig;\s*photos:\s*PresentationPhoto\[\];\s*}/;
  content = content.replace(propsRegex, `interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}`);

  // Change 2: Update component signature
  // Assuming format like: export default function CoverEditorial({ data, theme, photos }: Props) {
  const sigRegex = /export\s+default\s+function\s+([A-Za-z0-9_]+)\(\{\s*data,\s*theme,\s*photos\s*\}\s*:\s*Props\)\s*\{/;
  content = content.replace(sigRegex, `export default function $1({ data, theme, photos, pageNumber }: Props) {`);

  // Change 3: Replace photo helper functions
  // Currently they are like:
  // function getPhoto(photos: PresentationPhoto[], tag?: string): string { ... }
  // function getPhotos(...){...} (if exists)
  // We'll replace any occurrence of function getPhoto... until the next function or component, but to be safer:
  // The helpers are typically placed outside the component, or inside. Previously I placed them outside the exported component at bottom or above it.
  
  // Actually, wait, let's just strip out old getPhoto / getPhotos blocks entirely, 
  // and inject the new one right below imports.
  
  content = content.replace(/function\s+getPhoto\s*\([\s\S]*?\}\n/g, '');
  content = content.replace(/function\s+getPhotos\s*\([\s\S]*?\}\n/g, '');
  
  // Inject the new helper below imports/Props
  const injectAfterProps = `  pageNumber?: number;\n}\n\n${helperSnippet}\n`;
  content = content.replace(/pageNumber\?:\s*number;\n\}/, injectAfterProps);
  
  // Fix signature one more time in case it had spaces
  // It's already fixed for '{ data, theme, photos }' -> '{ data, theme, photos, pageNumber }'
  
  // Change 4: Add crossOrigin="anonymous" and objectPosition/display block
  // We look for `<img src={` or `<img src={` and modify it.
  // We can just add crossOrigin="anonymous" directly if it's an img tag.
  // And append the styles.
  
  content = content.replace(/<img\s+(.*?)style=\{\{(.*?)\}\}(.*?)>/gs, (match, before, styleStr, after) => {
    // avoid double crossOrigin
    let newBefore = before;
    if (!newBefore.includes('crossOrigin')) {
      newBefore = newBefore + 'crossOrigin="anonymous" ';
    }
    
    let newStyle = styleStr;
    if (!newStyle.includes('objectPosition')) {
      newStyle += `, objectPosition: 'center center'`;
    }
    if (!newStyle.includes('display')) {
      newStyle += `, display: 'block'`;
    }
    
    return \`<img \${newBefore}style={{\${newStyle}}}\${after}>\`;
  });
  
  // Pass pageNumber and agencyName to SlideShell
  content = content.replace(/<SlideShell\s+theme=\{theme\}>/g, \`<SlideShell theme={theme} pageNumber={pageNumber} agencyName={data.agencyName}>\`);
  
  fs.writeFileSync(filepath, content, 'utf8');
});

console.log('Slides updated!');
