import { SlideData, ThemeConfig, PresentationPhoto } from './presentationTypes';

// Convert image URL to base64 data URI
async function imageToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

// Get photo URL for given tags, avoiding duplicates
function getPhotoUrl(
  photos: PresentationPhoto[], 
  tags: string[], 
  usedUrls: Set<string>
): string {
  for (const tag of tags) {
    const match = photos.find(p => p.tag === tag && !usedUrls.has(p.url));
    if (match) { usedUrls.add(match.url); return match.url; }
  }
  const fallback = photos.find(p => !usedUrls.has(p.url));
  if (fallback) { usedUrls.add(fallback.url); return fallback.url; }
  return '';
}

// Main function: converts ALL slides to HTML strings with embedded assets
export async function slidesToHtmlStrings(
  slides: SlideData[],
  theme: ThemeConfig,
  photos: PresentationPhoto[],
): Promise<{ html: string; backgroundColor: string }[]> {

  // Step 1: Convert all photos to base64 once
  const photoBase64Map = new Map<string, string>();
  await Promise.all(
    photos.map(async (photo) => {
      const b64 = await imageToBase64(photo.url);
      if (b64) photoBase64Map.set(photo.url, b64);
    })
  );

  // Replace photo URLs with base64
  const b64Photos: PresentationPhoto[] = photos.map(p => ({
    ...p,
    url: photoBase64Map.get(p.url) || p.url,
  }));

  // Step 2: Fetch Google Fonts CSS
  const fontFamilies = [...new Set([theme.headingFont, theme.bodyFont])]
    .filter(Boolean)
    .map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,400;0,600;0,700;0,800;1,400`)
    .join('&');
  
  let fontImport = '';
  try {
    const fontResp = await fetch(
      `https://fonts.googleapis.com/css2?${fontFamilies}&display=block`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
    );
    fontImport = await fontResp.text();
  } catch { /* fonts may load from browser cache in fallback */ }

  // Step 3: Build HTML for each slide
  return slides.map((slide, index) => {
    const usedUrls = new Set<string>();
    const tags = slide.imageTags || [];
    
    // Get photos for this slide (up to 3, no duplicates)
    const photo1 = getPhotoUrl(b64Photos, tags, usedUrls);
    const photo2 = getPhotoUrl(b64Photos, tags, usedUrls);
    const photo3 = getPhotoUrl(b64Photos, tags, usedUrls);

    const agencyName = slide.agencyName || 'PropSite';
    const pageNum = String(index + 1).padStart(2, '0');
    const bg = theme.backgroundColor;
    const text = theme.textColor;
    const accent = theme.accentColor;
    const hFont = theme.headingFont;
    const bFont = theme.bodyFont;

    // Build the inner content based on layout
    const content = buildSlideContent(slide, theme, photo1, photo2, photo3);

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
${fontImport}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  width: 1456px; height: 816px; overflow: hidden;
  background: ${bg}; font-family: '${bFont}', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.slide {
  width: 1456px; height: 816px; position: relative; overflow: hidden;
  background: ${bg};
}
.header {
  position: absolute; top: 0; left: 0; right: 0; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; z-index: 10;
}
.header-agency {
  font-size: 13px; color: ${text}; opacity: 0.5;
  font-family: '${bFont}', sans-serif; font-weight: 500;
  letter-spacing: 0.3px;
}
.header-icon {
  display: flex; flex-direction: column; gap: 4px;
}
.header-icon span {
  display: block; width: 20px; height: 1.5px;
  background: ${text}; opacity: 0.35; border-radius: 1px;
}
.content {
  position: absolute; top: 56px; left: 0; right: 0; bottom: 0;
  overflow: hidden;
}
img {
  display: block; object-fit: cover; object-position: center center;
}
</style>
</head>
<body>
<div class="slide">
  <div class="header">
    <span class="header-agency">${agencyName}</span>
    <div class="header-icon">
      <span></span><span></span><span></span>
    </div>
  </div>
  <div class="content">
    ${content}
  </div>
</div>
</body>
</html>`;

    return { html, backgroundColor: bg };
  });
}

// Build inner HTML content for each layout type
function buildSlideContent(
  slide: SlideData,
  theme: ThemeConfig,
  photo1: string,
  photo2: string,
  photo3: string,
): string {
  const text = theme.textColor;
  const accent = theme.accentColor;
  const hFont = theme.headingFont;
  const bFont = theme.bodyFont;
  const headline = slide.headline || '';
  const body = slide.bodyText || '';
  const sub = slide.subheadline || '';

  const imgTag = (src: string, w: number, h: number, radius = 16, extra = '') =>
    src ? `<img src="${src}" width="${w}" height="${h}" 
      style="border-radius:${radius}px;min-width:${w}px;min-height:${h}px;${extra}" />` : 
    `<div style="width:${w}px;height:${h}px;border-radius:${radius}px;background:${accent}18;"></div>`;

  const numberedItem = (num: string, title: string, body: string) => `
    <div style="display:flex;align-items:flex-start;gap:24px;margin-bottom:20px;">
      <div style="width:56px;height:56px;border-radius:50%;border:2px solid ${text};
        display:flex;align-items:center;justify-content:center;
        font-size:15px;font-weight:600;color:${text};opacity:0.7;flex-shrink:0;
        font-family:'${bFont}',sans-serif;">
        ${num}
      </div>
      <div style="flex:1;padding-top:4px;">
        <div style="font-size:18px;font-weight:700;color:${text};
          font-family:'${bFont}',sans-serif;margin-bottom:8px;">${title}</div>
        <div style="font-size:15px;color:${text};opacity:0.6;
          font-family:'${bFont}',sans-serif;line-height:1.5;">${body}</div>
        <div style="height:1px;background:${text};opacity:0.1;margin-top:20px;"></div>
      </div>
    </div>`;

  switch (slide.layout) {

    case 'cover-editorial': {
      const headlineSize = headline.length <= 12 ? 96 : headline.length <= 20 ? 80 : 64;
      return `
        <div style="position:absolute;left:56px;width:560px;height:100%;">
          <div style="position:absolute;top:80px;font-family:'${hFont}',serif;
            font-size:${headlineSize}px;line-height:0.92;font-weight:700;
            color:${text};letter-spacing:-0.02em;">${headline}</div>
          <div style="position:absolute;top:380px;font-size:20px;color:${text};
            opacity:0.6;max-width:400px;line-height:1.4;
            font-family:'${bFont}',sans-serif;">${sub || body}</div>
        </div>
        <div style="position:absolute;right:40px;top:20px;">
          ${imgTag(photo1, 680, 660, 20)}
        </div>`;
    }

    case 'stats-two-col': {
      const stats = slide.stats || [];
      const s1 = stats[0] || { value: '', label: '', description: '' };
      const s2 = stats[1] || { value: '', label: '', description: '' };
      const valSize = (v: string) => v.length <= 4 ? 140 : v.length <= 6 ? 110 : 80;
      return `
        <div style="display:flex;align-items:center;height:100%;position:relative;">
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 60px;">
            <div style="font-family:'${hFont}',serif;font-size:${valSize(s1.value)}px;
              font-weight:700;color:${text};line-height:0.85;letter-spacing:-0.04em;">${s1.value}</div>
            <div style="width:80%;height:1px;background:${text};opacity:0.2;margin:20px 0;"></div>
            <div style="font-family:'${hFont}',serif;font-size:24px;font-weight:600;
              color:${text};margin-bottom:12px;">${s1.label}</div>
            <div style="font-size:16px;color:${text};opacity:0.55;line-height:1.5;
              font-family:'${bFont}',sans-serif;max-width:280px;">${s1.description || ''}</div>
          </div>
          <div style="width:1px;height:60%;background:${text};opacity:0.12;"></div>
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 60px;">
            <div style="font-family:'${hFont}',serif;font-size:${valSize(s2.value)}px;
              font-weight:700;color:${text};line-height:0.85;letter-spacing:-0.04em;">${s2.value}</div>
            <div style="width:80%;height:1px;background:${text};opacity:0.2;margin:20px 0;"></div>
            <div style="font-family:'${hFont}',serif;font-size:24px;font-weight:600;
              color:${text};margin-bottom:12px;">${s2.label}</div>
            <div style="font-size:16px;color:${text};opacity:0.55;line-height:1.5;
              font-family:'${bFont}',sans-serif;max-width:280px;">${s2.description || ''}</div>
          </div>
        </div>`;
    }

    case 'headline-numbered-list': {
      const items = slide.numberedItems || [];
      return `
        <div style="display:flex;height:100%;">
          <div style="width:480px;padding:56px 40px 56px 56px;flex-shrink:0;">
            <div style="font-family:'${hFont}',serif;font-size:72px;font-weight:700;
              color:${text};line-height:0.95;">${headline}</div>
            ${body ? `<div style="font-size:18px;color:${text};opacity:0.65;
              line-height:1.6;margin-top:24px;font-family:'${bFont}',sans-serif;">${body}</div>` : ''}
          </div>
          <div style="flex:1;padding:48px 56px 48px 40px;overflow:hidden;">
            ${items.map(it => numberedItem(it.number, it.title, it.body)).join('')}
          </div>
        </div>`;
    }

    case 'image-left-headline-numbered': {
      const items = (slide.numberedItems || []).slice(0, 2);
      return `
        <div style="display:flex;height:100%;">
          <div style="width:580px;padding:40px 40px 40px 56px;flex-shrink:0;">
            ${imgTag(photo1, 484, 636, 16)}
          </div>
          <div style="flex:1;padding:48px 56px 48px 24px;">
            <div style="font-family:'${hFont}',serif;font-size:64px;font-weight:700;
              color:${text};line-height:0.95;margin-bottom:40px;">${headline}</div>
            ${items.map(it => numberedItem(it.number, it.title, it.body)).join('')}
          </div>
        </div>`;
    }

    case 'headline-two-images': {
      return `
        <div style="height:240px;padding:40px 56px 24px;display:flex;
          align-items:center;justify-content:space-between;">
          <div style="flex:1;padding-right:40px;">
            <div style="font-family:'${hFont}',serif;font-size:64px;font-weight:700;
              color:${text};line-height:0.95;">${headline}</div>
          </div>
          <div style="width:440px;flex-shrink:0;">
            <div style="font-size:18px;color:${text};opacity:0.65;
              line-height:1.6;font-family:'${bFont}',sans-serif;">${body}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding:0 56px;height:420px;">
          ${imgTag(photo1, 630, 420, 16, 'flex:1;width:630px;')}
          ${imgTag(photo2, 630, 420, 16, 'flex:1;width:630px;')}
        </div>`;
    }

    case 'two-images-headline-numbered': {
      const items = (slide.numberedItems || []).slice(0, 2);
      return `
        <div style="display:flex;height:100%;">
          <div style="width:680px;padding:40px 24px 40px 56px;
            display:flex;gap:16px;flex-shrink:0;">
            ${imgTag(photo1, 290, 636, 16)}
            ${imgTag(photo2, 290, 636, 16)}
          </div>
          <div style="flex:1;padding:48px 56px 48px 24px;">
            <div style="font-family:'${hFont}',serif;font-size:56px;font-weight:700;
              color:${text};line-height:0.95;margin-bottom:32px;">${headline}</div>
            ${items.map(it => numberedItem(it.number, it.title, it.body)).join('')}
            ${body ? `<div style="font-size:15px;color:${text};opacity:0.55;
              margin-top:24px;line-height:1.6;
              font-family:'${bFont}',sans-serif;">${body}</div>` : ''}
          </div>
        </div>`;
    }

    case 'centered-numbered-cols': {
      const items = (slide.numberedItems || []).slice(0, 3);
      return `
        <div style="height:100%;display:flex;flex-direction:column;">
          <div style="padding:48px 56px 36px;text-align:center;">
            <div style="font-family:'${hFont}',serif;font-size:72px;font-weight:700;
              color:${text};line-height:0.95;">${headline}</div>
            ${body ? `<div style="font-size:18px;color:${text};opacity:0.65;
              max-width:700px;margin:20px auto 0;line-height:1.55;
              font-family:'${bFont}',sans-serif;">${body}</div>` : ''}
          </div>
          <div style="flex:1;display:flex;padding:0 56px 40px;">
            ${items.map((it, i) => `
              <div style="flex:1;padding:0 32px;text-align:center;
                ${i < items.length - 1 ? `border-right:1px solid ${text}1A;` : ''}">
                <div style="width:72px;height:72px;border-radius:50%;
                  border:2px solid ${text};display:flex;align-items:center;
                  justify-content:center;font-size:18px;font-weight:600;
                  color:${text};opacity:0.7;margin:0 auto 20px;
                  font-family:'${bFont}',sans-serif;">${it.number}</div>
                <div style="font-size:20px;font-weight:700;color:${text};
                  font-family:'${bFont}',sans-serif;margin-bottom:12px;">${it.title}</div>
                <div style="font-size:15px;color:${text};opacity:0.6;
                  line-height:1.5;font-family:'${bFont}',sans-serif;">${it.body}</div>
              </div>`).join('')}
          </div>
        </div>`;
    }

    case 'content-image-bottom': {
      const items = (slide.numberedItems || []).slice(0, 3);
      return `
        <div style="height:380px;display:flex;padding:24px 0;">
          <div style="width:540px;padding:16px 40px 40px 56px;flex-shrink:0;">
            <div style="font-family:'${hFont}',serif;font-size:64px;font-weight:700;
              color:${text};line-height:0.95;margin-bottom:24px;">${headline}</div>
            <div style="font-size:17px;color:${text};opacity:0.65;line-height:1.65;
              font-family:'${bFont}',sans-serif;">${body}</div>
          </div>
          <div style="flex:1;padding:16px 40px 16px 0;">
            ${imgTag(photo1, 0, 340, 16, 'width:100%;')}
          </div>
        </div>
        <div style="height:1px;background:${text};opacity:0.1;margin:0 56px;"></div>
        <div style="display:flex;padding:24px 56px 0;gap:0;">
          ${items.map((it, i) => `
            <div style="flex:1;padding:0 32px 0 ${i === 0 ? 0 : 32}px;
              ${i > 0 ? `border-left:2px solid ${text}1E;` : ''}">
              <div style="font-size:17px;font-weight:700;color:${text};
                font-family:'${bFont}',sans-serif;margin-bottom:8px;">${it.title}</div>
              <div style="font-size:14px;color:${text};opacity:0.6;line-height:1.55;
                font-family:'${bFont}',sans-serif;">${it.body}</div>
            </div>`).join('')}
        </div>`;
    }

    case 'headline-2x2-numbered': {
      const items = (slide.numberedItems || []).slice(0, 4);
      return `
        <div style="height:220px;display:flex;padding:40px 56px 32px;
          align-items:center;justify-content:space-between;">
          <div style="flex:1;padding-right:40px;">
            <div style="font-family:'${hFont}',serif;font-size:64px;font-weight:700;
              color:${text};line-height:0.95;">${headline}</div>
          </div>
          <div style="width:440px;flex-shrink:0;">
            <div style="font-size:17px;color:${text};opacity:0.65;
              line-height:1.6;font-family:'${bFont}',sans-serif;">${body}</div>
          </div>
        </div>
        <div style="height:1px;background:${text};opacity:0.1;margin:0 56px;"></div>
        <div style="display:flex;flex-wrap:wrap;padding:24px 56px;gap:0;flex:1;">
          ${items.map((it, i) => `
            <div style="width:50%;display:flex;gap:20px;padding:16px 24px;
              box-sizing:border-box;">
              <div style="width:52px;height:52px;border-radius:50%;border:2px solid ${text};
                display:flex;align-items:center;justify-content:center;
                font-size:14px;font-weight:600;color:${text};opacity:0.7;flex-shrink:0;
                font-family:'${bFont}',sans-serif;">${it.number}</div>
              <div>
                <div style="font-size:17px;font-weight:700;color:${text};
                  font-family:'${bFont}',sans-serif;margin-bottom:6px;">${it.title}</div>
                <div style="font-size:13px;color:${text};opacity:0.6;line-height:1.5;
                  font-family:'${bFont}',sans-serif;">${it.body}</div>
              </div>
            </div>`).join('')}
        </div>`;
    }

    case 'contact-split': {
      const c = slide.contactInfo || {};
      const initials = (c.name || 'P').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
      return `
        <div style="display:flex;align-items:center;height:100%;padding:0 56px;">
          <div style="width:560px;padding-right:80px;flex-shrink:0;">
            <div style="font-family:'${hFont}',serif;font-size:64px;font-weight:700;
              color:${text};line-height:0.95;margin-bottom:16px;">${headline}</div>
            <div style="font-size:18px;color:${text};opacity:0.65;line-height:1.6;
              margin-bottom:40px;font-family:'${bFont}',sans-serif;">${body || sub}</div>
          </div>
          <div style="width:1px;height:280px;background:${text};opacity:0.2;flex-shrink:0;"></div>
          <div style="flex:1;padding-left:80px;">
            ${c.name ? `
            <div style="width:72px;height:72px;border-radius:50%;
              border:2px solid ${accent};display:flex;align-items:center;
              justify-content:center;font-size:22px;font-weight:700;
              color:${accent};font-family:'${hFont}',serif;margin-bottom:24px;">${initials}</div>
            <div style="font-size:22px;font-weight:700;color:${text};
              font-family:'${hFont}',serif;margin-bottom:4px;">${c.name}</div>
            <div style="font-size:13px;color:${text};opacity:0.5;letter-spacing:2px;
              text-transform:uppercase;font-family:'${bFont}',sans-serif;
              margin-bottom:32px;">${c.agency || ''}</div>` : ''}
            ${c.phone ? `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
              <div style="width:44px;height:44px;border-radius:50%;
                background:${text}11;display:flex;align-items:center;
                justify-content:center;font-size:18px;">📞</div>
              <span style="font-size:18px;font-weight:500;color:${text};
                font-family:'${bFont}',sans-serif;">${c.phone}</span>
            </div>` : ''}
            ${c.rera && c.rera !== 'N/A' && c.rera !== 'NOT AVAILABLE' ? `
            <div style="font-size:11px;color:${text};opacity:0.3;letter-spacing:2px;
              text-transform:uppercase;font-family:'${bFont}',sans-serif;
              margin-top:16px;">RERA: ${c.rera}</div>` : ''}
          </div>
        </div>`;
    }

    // Fallback for any layout not explicitly handled
    default: {
      return `
        <div style="padding:56px;height:100%;">
          <div style="font-family:'${hFont}',serif;font-size:72px;font-weight:700;
            color:${text};line-height:0.95;margin-bottom:32px;">${headline}</div>
          ${photo1 ? `<div style="margin-top:32px;">${imgTag(photo1, 600, 400, 16)}</div>` : ''}
          <div style="font-size:18px;color:${text};opacity:0.65;line-height:1.6;
            margin-top:24px;font-family:'${bFont}',sans-serif;">${body}</div>
        </div>`;
    }
  }
}
