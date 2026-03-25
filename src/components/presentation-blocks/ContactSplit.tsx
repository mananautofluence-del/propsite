import React from 'react';
import { SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import SlideShell from './SlideShell';
import { Globe, Mail, Phone } from 'lucide-react';

interface Props {
  data: SlideData;
  theme: ThemeConfig;
  photos: PresentationPhoto[];
  pageNumber?: number;
}

export default function ContactSplit({ data, theme }: Props) {
  const contact = data.contactInfo;

  return (
    <SlideShell theme={theme} pageNumber={data.pageNumber} agencyName={data.agencyName}>
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        left: '56px', right: '56px', display: 'flex', alignItems: 'center',
      }}>
        
        {/* LEFT */}
        <div style={{ width: '560px', paddingRight: '80px', boxSizing: 'border-box' }}>
          {data.headline && (
            <div style={{
              fontFamily: theme.headingFont, fontSize: '72px',
              fontWeight: 700, color: theme.textColor, lineHeight: 0.95,
              marginBottom: '16px',
            }}>
              {data.headline}
            </div>
          )}
          {data.bodyText && (
            <div style={{
              fontSize: '18px', color: theme.textColor, opacity: 0.65,
              lineHeight: 1.6, marginBottom: '40px',
            }}>
              {data.bodyText}
            </div>
          )}
        </div>

        {/* VERTICAL RULE */}
        <div style={{
          width: '1px', height: '280px',
          backgroundColor: theme.textColor, opacity: 0.25, flexShrink: 0,
        }} />

        {/* RIGHT */}
        <div style={{ flex: 1, paddingLeft: '80px', boxSizing: 'border-box' }}>
          {contact?.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: `${theme.textColor}14`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: theme.textColor,
              }}>
                <Globe size={20} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textColor }}>
                {contact.website.replace(/^https?:\/\//, '')}
              </div>
            </div>
          )}
          
          {contact?.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: `${theme.textColor}14`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: theme.textColor,
              }}>
                <Mail size={20} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textColor }}>
                {contact.email}
              </div>
            </div>
          )}

          {contact?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                backgroundColor: `${theme.textColor}14`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: theme.textColor,
              }}>
                <Phone size={20} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: theme.textColor }}>
                {contact.phone}
              </div>
            </div>
          )}

          {contact?.rera && (
            <div style={{
              fontSize: '12px', color: theme.textColor, opacity: 0.3,
              marginTop: '8px',
            }}>
              RERA REGISTRATION: {contact.rera.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </SlideShell>
  );
}
