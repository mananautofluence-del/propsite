import pptxgen from "pptxgenjs";
import type { PresentationData, ThemeKey } from "./presentationState";

interface ThemeStrategy {
  createCoverSlide: (pptx: pptxgen, data: PresentationData) => void;
  createOverviewSlide: (pptx: pptxgen, data: PresentationData) => void;
  createFeaturesSlide: (pptx: pptxgen, data: PresentationData) => void;
  createGallerySlide: (pptx: pptxgen, data: PresentationData) => void;
  createAgentSlide: (pptx: pptxgen, data: PresentationData) => void;
}

// --------------------------------------------------------------------------------
// Helper: Safe Image Path (In a real app, convert remote URLs to base64 if needed, 
// but pptxgenjs supports remote HTTP URLs out of the box).
// --------------------------------------------------------------------------------
const getMockImage = (type: string) => {
  return "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
};

// --------------------------------------------------------------------------------
// 1. Signature Theme Strategy (Clean, Minimalist, Green Accents)
// --------------------------------------------------------------------------------
const signatureStrategy: ThemeStrategy = {
  createCoverSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.color = "111111";
    slide.background = { color: "FFFFFF" };

    slide.addImage({ path: getMockImage('hero'), x: "50%", y: 0, w: "50%", h: "100%", sizing: { type: "cover", w: "50%", h: "100%" } });
    slide.addText(data.title.toUpperCase(), { x: 0.5, y: 2.0, w: "45%", h: 1, fontSize: 36, bold: true, fontFace: "Helvetica" });
    slide.addText(data.subtitle, { x: 0.5, y: 3.0, w: "45%", h: 0.5, fontSize: 16, color: "666666", fontFace: "Helvetica" });
    slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 3.8, w: 0.5, h: 0.05, fill: { color: "1A5C3A" } });
    slide.addText(data.location, { x: 0.5, y: 4.2, w: "45%", h: 0.5, fontSize: 14, fontFace: "Helvetica" });
    slide.addText(data.price, { x: 0.5, y: 4.6, w: "45%", h: 0.5, fontSize: 18, bold: true, color: "1A5C3A", fontFace: "Helvetica" });
  },
  createOverviewSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addText("PROPERTY OVERVIEW", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 12, bold: true, color: "1A5C3A", fontFace: "Helvetica" });
    slide.addText(data.description, { x: 0.5, y: 1.2, w: "50%", h: 3, fontSize: 14, color: "333333", fontFace: "Helvetica", align: "left" });
    
    // Grid of stats
    const stats = [
      { l: "Type", v: data.propertyType },
      { l: "Beds", v: data.bedrooms },
      { l: "Baths", v: data.bathrooms },
      { l: "Area", v: data.area }
    ];
    stats.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      slide.addText(s.l, { x: 6.0 + (col * 2), y: 1.5 + (row * 1), w: 1.5, h: 0.3, fontSize: 10, color: "888888", fontFace: "Helvetica" });
      slide.addText(s.v, { x: 6.0 + (col * 2), y: 1.8 + (row * 1), w: 1.5, h: 0.5, fontSize: 16, bold: true, fontFace: "Helvetica" });
    });
  },
  createFeaturesSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F9FAFB" };
    slide.addText("AMENITIES & FEATURES", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 24, bold: true, fontFace: "Helvetica" });
    
    data.features.forEach((feat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      // Checkmark box
      slide.addShape(pptx.ShapeType.rect, { x: 0.5 + (col * 4.5), y: 1.5 + (row * 0.8), w: 0.2, h: 0.2, fill: { color: "1A5C3A" } });
      slide.addText(feat, { x: 0.8 + (col * 4.5), y: 1.4 + (row * 0.8), w: 3.5, h: 0.4, fontSize: 14, fontFace: "Helvetica" });
    });
  },
  createGallerySlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addImage({ path: getMockImage('hero'), x: 0.5, y: 0.5, w: 4.25, h: 2.5, sizing: { type: "cover", w: 4.25, h: 2.5 } });
    slide.addImage({ path: getMockImage('interior'), x: 5.25, y: 0.5, w: 4.25, h: 2.5, sizing: { type: "cover", w: 4.25, h: 2.5 } });
    slide.addImage({ path: getMockImage('bedroom'), x: 0.5, y: 3.5, w: 9.0, h: 1.5, sizing: { type: "cover", w: 9.0, h: 1.5 } });
  },
  createAgentSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "111111" };
    slide.addText("CONTACT AGENT", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 12, bold: true, color: "1A5C3A", fontFace: "Helvetica" });
    slide.addText(data.brokerName, { x: 0.5, y: 1.5, w: "50%", h: 0.8, fontSize: 32, bold: true, color: "FFFFFF", fontFace: "Helvetica" });
    slide.addText(data.brokerTitle + " | " + data.brokerAgency, { x: 0.5, y: 2.3, w: "50%", h: 0.4, fontSize: 14, color: "AAAAAA", fontFace: "Helvetica" });
    slide.addText(data.brokerPhone, { x: 0.5, y: 3.5, w: "50%", h: 0.4, fontSize: 16, color: "FFFFFF", fontFace: "Helvetica" });
    slide.addText(data.brokerEmail, { x: 0.5, y: 4.0, w: "50%", h: 0.4, fontSize: 16, color: "FFFFFF", fontFace: "Helvetica" });
  }
};

// --------------------------------------------------------------------------------
// 2. Penthouse Theme Strategy (Dark, Luxurious, Glassmorphic)
// --------------------------------------------------------------------------------
const penthouseStrategy: ThemeStrategy = {
  createCoverSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.color = "F0EDE8";
    slide.background = { color: "0A0A0A" };

    slide.addImage({ path: getMockImage('hero'), x: 0, y: 0, w: "100%", h: "100%", sizing: { type: "cover", w: "100%", h: "100%" } });
    // Overlay hack (black semi transparent rect)
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: "000000", transparency: 50 } });
    
    slide.addText(data.title.toUpperCase(), { x: 0.5, y: 2.0, w: "90%", h: 1, fontSize: 40, bold: true, fontFace: "Georgia", color: "FFFFFF", align: "center" });
    slide.addText(data.subtitle, { x: 0.5, y: 3.0, w: "90%", h: 0.5, fontSize: 16, color: "C9A96E", fontFace: "Verdana", align: "center" });
  },
  createOverviewSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0A0A0A" };
    slide.addText("THE RESIDENCE", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 12, color: "C9A96E", fontFace: "Verdana", charSpacing: 2 });
    slide.addText(data.description, { x: 0.5, y: 1.5, w: "90%", h: 2, fontSize: 16, color: "F0EDE8", fontFace: "Georgia", align: "center" });
  },
  createFeaturesSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0A0A0A" };
    slide.addText("FEATURES", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 12, color: "C9A96E", fontFace: "Verdana", charSpacing: 2 });
    data.features.forEach((feat, i) => {
      slide.addText("• " + feat, { x: 1.0, y: 1.5 + (i * 0.5), w: 8.0, h: 0.4, fontSize: 16, color: "F0EDE8", fontFace: "Georgia" });
    });
  },
  createGallerySlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0A0A0A" };
    slide.addImage({ path: getMockImage('hero'), x: 0, y: 0, w: "33%", h: "100%", sizing: { type: "cover", w: "33%", h: "100%" } });
    slide.addImage({ path: getMockImage('interior'), x: "33%", y: 0, w: "34%", h: "100%", sizing: { type: "cover", w: "34%", h: "100%" } });
    slide.addImage({ path: getMockImage('bedroom'), x: "67%", y: 0, w: "33%", h: "100%", sizing: { type: "cover", w: "33%", h: "100%" } });
  },
  createAgentSlide: (pptx, data) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0A0A0A" };
    slide.addText("EXCLUSIVE AGENT", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 12, color: "C9A96E", fontFace: "Verdana", charSpacing: 2 });
    slide.addText(data.brokerName, { x: 0.5, y: 2.0, w: "90%", h: 0.8, fontSize: 32, color: "FFFFFF", fontFace: "Georgia", align: "center" });
    slide.addText(data.brokerPhone + " | " + data.brokerEmail, { x: 0.5, y: 3.0, w: "90%", h: 0.4, fontSize: 14, color: "C9A96E", fontFace: "Verdana", align: "center" });
  }
};

// Fallback logic for all other themes mapping to Signature for now, 
// to ensure zero runtime drops in a fast iteration MVP.
const defaultStrategy = signatureStrategy;

export const generateDeck = async (data: PresentationData, themeId: ThemeKey) => {
  try {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';

    let strategy = signatureStrategy;
    if (themeId === 'penthouse') strategy = penthouseStrategy;
    else if (themeId === 'corporate') strategy = signatureStrategy; // Map to signature in MVP
    else if (themeId === 'highstreet') strategy = signatureStrategy;
    else if (themeId === 'logistics') strategy = signatureStrategy;
    else if (themeId === 'estate') strategy = signatureStrategy;

    strategy.createCoverSlide(pptx, data);
    strategy.createOverviewSlide(pptx, data);
    strategy.createFeaturesSlide(pptx, data);
    strategy.createGallerySlide(pptx, data);
    strategy.createAgentSlide(pptx, data);

    const fileName = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation.pptx`;
    await pptx.writeFile({ fileName });
    return true;
  } catch (error) {
    console.error("PPTX Generation Error:", error);
    throw error;
  }
};
