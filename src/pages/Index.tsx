import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check } from 'lucide-react';

function HeroBrowserMockup() {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] relative">
      <div className="h-7 bg-surface-2 border-b border-border flex items-center px-3 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-border-mid" />
        <div className="w-2.5 h-2.5 rounded-full bg-border-mid" />
        <div className="w-2.5 h-2.5 rounded-full bg-border-mid" />
        <div className="flex-1 mx-8 h-4 bg-background rounded-sm" />
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-2 rounded-md p-2.5">
              <div className="w-full h-16 bg-border rounded-sm mb-2" />
              <div className="h-2 bg-border-mid rounded-sm w-3/4 mb-1" />
              <div className="h-2 bg-border rounded-sm w-1/2" />
              <div className="h-2.5 bg-primary/20 rounded-sm w-1/3 mt-2" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-2 -right-2 bg-surface border border-border rounded-lg px-3 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] hidden lg:flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-soft" />
        <span className="text-2xs font-medium text-text-1">47 views this week</span>
      </div>
    </div>
  );
}

function PricingCard({ name, price, period, features, popular }: { name: string; price: string; period?: string; features: string[]; popular?: boolean }) {
  return (
    <div className={`card-base p-5 ${popular ? 'border-2 border-primary relative' : ''}`}>
      {popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-live text-2xs px-3 py-0.5">Most Popular</div>}
      <div className="text-label text-text-3 mb-1">{name}</div>
      <div className="font-display text-2xl font-medium text-text-1">{price}</div>
      {period && <div className="text-xs text-text-3">{period}</div>}
      <div className="mt-4 space-y-2">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-text-2">
            <Check size={14} className="text-primary mt-0.5 shrink-0" /> {f}
          </div>
        ))}
      </div>
      <button className={`w-full mt-4 ${popular ? 'btn-primary' : 'btn-secondary'} text-xs`}>
        {name === 'FREE' ? 'Start Free' : 'Choose Plan'}
      </button>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* FIX 6: Hero — responsive mobile */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
            <ScrollReveal>
              <div className="text-[10px] md:text-[11px] font-sans font-medium uppercase tracking-[0.04em] text-text-3 mb-3 md:mb-4">AI-Powered Listing Platform</div>
              <h1 className="font-display text-[28px] md:text-[40px] lg:text-[3.5rem] font-medium leading-[1.2] md:leading-[1.1] text-text-1 mb-4 md:mb-5 max-w-[540px]">
                Turn WhatsApp clutter into premium property listings.
              </h1>
              <p className="text-sm md:text-base text-text-2 leading-relaxed mb-6 md:mb-8 max-w-md">
                Upload photos, describe a property, and get a beautiful shareable link in under 3 minutes. 
                Every broker on WhatsApp sharing 100 messy photos becomes a broker sharing one clean premium link.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-6">
                <Link to="/create" className="btn-primary inline-flex items-center justify-center gap-1">Create Free Listing →</Link>
                <Link to="/l/prestige-towers-3bhk-worli" className="btn-ghost inline-flex items-center justify-center">See a sample →</Link>
              </div>
              <p className="text-xs text-text-3">1,200+ brokers · Mumbai · Pune · Bangalore</p>
            </ScrollReveal>
            {/* Hide browser mockup on mobile */}
            <ScrollReveal delay={200} className="relative hidden lg:block">
              <HeroBrowserMockup />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding border-t border-border">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-h2 text-text-1 mb-12 text-center">How it works</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: '01', title: 'Forward or describe', desc: 'Paste your WhatsApp message or describe the property. In any language.' },
              { num: '02', title: 'AI fills every field', desc: 'Our AI extracts all property details, writes a premium description, and fills the listing.' },
              { num: '03', title: 'Share link, track views', desc: 'Get a shareable link. See who viewed, for how long, and who tapped WhatsApp.' },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="font-display text-5xl font-medium text-border-mid mb-3">{s.num}</div>
                <div className="text-h4 text-text-1 mb-2">{s.title}</div>
                <p className="text-sm text-text-2 leading-relaxed">{s.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Listings */}
      <section id="features" className="section-padding border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="text-label text-primary mb-3">Smart Listings</div>
              <h2 className="text-h2 text-text-1 mb-4">Every field, auto-filled by AI.</h2>
              <p className="text-sm text-text-2 leading-relaxed mb-4">
                From a single WhatsApp message, our AI extracts property type, price, area, amenities, 
                and writes a premium description. Review, edit, and publish in minutes.
              </p>
              <div className="flex items-center gap-2">
                <span className="badge-live text-2xs">✦ AI Generated</span>
                <span className="text-xs text-text-3">Supports English, Hindi, and Hinglish</span>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="card-base p-4 space-y-3">
                {['Headline', 'Property Type', 'Price', 'Location', 'Description'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 flex-1 bg-surface-2 rounded-md px-3 flex items-center text-xs text-text-2">{f}</div>
                    {i < 4 && <span className="text-2xs text-primary bg-[hsl(var(--green-light))] px-1.5 py-0.5 rounded">✦ AI</span>}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feature: Analytics — Dark */}
      <section className="py-20 bg-dark">
        <div className="container">
          <ScrollReveal>
            <div className="text-label text-text-3 mb-3">Real-Time Analytics</div>
            <h2 className="text-h2 text-surface mb-10">Know who's looking.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            {[
              { val: '47', label: 'Views' },
              { val: '8:14', label: 'Avg Time' },
              { val: '6', label: 'WhatsApp Taps' },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="text-stat text-surface">{s.val}</div>
                <div className="text-xs text-text-3 mt-1">{s.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature: Listing Page */}
      <section className="section-padding border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={100}>
              <div className="card-base overflow-hidden">
                <div className="h-40 bg-surface-2" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-border-mid rounded w-3/4" />
                  <div className="h-2 bg-border rounded w-1/2" />
                  <div className="h-4 bg-primary/20 rounded w-1/3 mt-3" />
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="text-label text-primary mb-3">Property Microsite</div>
              <h2 className="text-h2 text-text-1 mb-4">The page your client sees.</h2>
              <p className="text-sm text-text-2 leading-relaxed">
                A private property microsite with photo gallery, detailed specs, 
                and one-tap WhatsApp contact. Beautiful on every phone.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Feature: Comparison */}
      <section className="section-padding border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="text-label text-primary mb-3">Comparison Mode</div>
              <h2 className="text-h2 text-text-1 mb-4">Send 2–3 properties in one link.</h2>
              <p className="text-sm text-text-2 leading-relaxed">
                Clients swipe between properties like browser tabs. 
                Side-by-side comparison table at the bottom. One link does it all.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="card-base p-3">
                <div className="flex gap-2 mb-3">
                  {['Worli 3BHK', 'Andheri 2BHK', 'Parel 4BHK'].map((t, i) => (
                    <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-2'}`}>{t}</div>
                  ))}
                </div>
                <div className="h-32 bg-surface-2 rounded-md" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding border-t border-border">
        <div className="container max-w-4xl">
          <ScrollReveal>
            <h2 className="text-h2 text-text-1 mb-3 text-center">Simple pricing</h2>
            <p className="text-sm text-text-2 text-center mb-10">Start free. Upgrade when you need more.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScrollReveal delay={0}>
              <PricingCard name="FREE" price="₹0" features={['3 listings/month', 'Watermark on page', 'Basic shareable link', 'No analytics']} />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <PricingCard name="STARTER" price="₹499" period="/month" features={['25 listings/month', 'No watermark', 'Basic analytics', 'WhatsApp share']} />
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <PricingCard name="PRO" price="₹999" period="/month" popular features={['Unlimited listings', 'Full analytics', 'Lead capture', 'Collections & compare', 'AI brochures']} />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <PricingCard name="AGENCY" price="₹2,999" period="/month" features={['Everything in Pro', '10 agent seats', 'Agency branding', 'Priority support']} />
            </ScrollReveal>
          </div>
          <ScrollReveal>
            <p className="text-center text-xs text-text-3 mt-6">Or ₹49 per listing. No subscription.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-dark">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-h2 text-surface mb-10 text-center">What brokers say</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Vikram Patel', agency: 'Patel Properties, Pune', quote: 'My clients stopped asking for more photos. They just open the link and call me back. Conversion doubled.' },
              { name: 'Sneha Kapoor', agency: 'Kapoor Realtors, Mumbai', quote: 'I used to spend 20 minutes formatting each listing on WhatsApp. Now it\'s 3 minutes and looks 10x better.' },
              { name: 'Arjun Reddy', agency: 'Reddy Associates, Bangalore', quote: 'The analytics showed me which property my client spent 8 minutes on. I knew exactly which one to push.' },
            ].map((t, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-dark border border-[hsl(0_0%_18%)] rounded-[10px] p-5">
                  <p className="text-sm text-[hsl(0_0%_75%)] leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="text-xs font-medium text-surface">{t.name}</div>
                  <div className="text-2xs text-text-3">{t.agency}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="font-display text-3xl md:text-h2 font-medium text-primary-foreground mb-4">
              Your next listing deserves better than WhatsApp.
            </h2>
            <Link to="/create" className="inline-flex items-center h-10 px-6 bg-surface text-text-1 font-sans text-sm font-medium rounded-md hover:bg-surface-2 active:scale-[0.97] transition-all">
              Create Free Listing →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-display text-base font-medium text-text-1 mb-3">PropSite</div>
              <p className="text-xs text-text-3 leading-relaxed">AI-powered property listings for Indian real estate brokers.</p>
            </div>
            <div>
              <div className="text-label text-text-3 mb-3">Product</div>
              <div className="space-y-2">
                <a href="#features" className="block text-xs text-text-2 hover:text-text-1">Features</a>
                <a href="#pricing" className="block text-xs text-text-2 hover:text-text-1">Pricing</a>
                <Link to="/l/prestige-towers-3bhk-worli" className="block text-xs text-text-2 hover:text-text-1">Demo</Link>
              </div>
            </div>
            <div>
              <div className="text-label text-text-3 mb-3">Company</div>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-text-2 hover:text-text-1">About</a>
                <a href="#" className="block text-xs text-text-2 hover:text-text-1">Blog</a>
                <a href="#" className="block text-xs text-text-2 hover:text-text-1">Contact</a>
              </div>
            </div>
            <div>
              <div className="text-label text-text-3 mb-3">Legal</div>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-text-2 hover:text-text-1">Privacy</a>
                <a href="#" className="block text-xs text-text-2 hover:text-text-1">Terms</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-text-3">© 2026 PropSite · Made in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
