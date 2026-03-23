import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowRight, Check, Star, Sparkles, Building2, Eye, MessageCircle } from 'lucide-react';

const STEPS = [
  { num: '01', title: 'Add photos & describe', desc: 'Upload photos and tell us about the property in plain English, Hindi, or Hinglish.' },
  { num: '02', title: 'AI creates your listing', desc: 'Our AI extracts details, writes a description, and builds a beautiful property page.' },
  { num: '03', title: 'Share link on WhatsApp', desc: 'Get a clean link. Share it with one client or a hundred. Track every view.' },
];

const PLANS = [
  { name: 'Free', price: '₹0', unit: 'forever', features: ['3 active listings', 'AI-generated content', 'WhatsApp sharing', 'Basic analytics'], popular: false },
  { name: 'Pro', price: '₹499', unit: '/month', features: ['Unlimited listings', 'Collections', 'Advanced analytics', 'Custom branding', 'Priority support', 'Verified badge'], popular: true },
  { name: 'Agency', price: '₹1999', unit: '/month', features: ['Everything in Pro', '5 team members', 'Bulk import', 'API access', 'Dedicated manager', 'White-label option'], popular: false },
];

const TESTIMONIALS = [
  { name: 'Ravi Sharma', agency: 'Sharma Properties, Andheri', text: 'My clients are impressed. No more sending 15 photos on WhatsApp — I just share one link.', stars: 5 },
  { name: 'Meera Patel', agency: 'Prime Realty, Bandra', text: 'The AI writes better descriptions than I ever could. Saves me 30 minutes per listing.', stars: 5 },
  { name: 'Amit Joshi', agency: 'Horizon Homes, Thane', text: 'I can see who viewed my listing and when. That intelligence helps me close deals faster.', stars: 5 },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative section-padding overflow-hidden" style={{ background: 'linear-gradient(180deg, #F7F5F2 0%, #EAF3ED 100%)' }}>
        <div className="container max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/80 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-primary border border-primary/15 mb-6">
            <Sparkles size={14} /> AI-Powered Property Pages
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,3.5rem)] font-medium text-text-1 leading-[1.1] mb-5">
            The smartest way to<br className="hidden sm:block" /> share properties
          </h1>
          <p className="text-[16px] md:text-[18px] text-text-2 font-sans max-w-lg mx-auto mb-8 leading-relaxed">
            Turn any property into a beautiful, shareable page in 60 seconds.
            No apps. No training. Just share a link on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Link to="/create" className="btn-primary h-12 px-8 text-[15px] flex items-center gap-2">
              Create Free Listing <ArrowRight size={18} />
            </Link>
            <Link to="/create-presentation" className="bg-[#1A1A1A] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01] active:scale-[0.98]">
              Create Free Presentation <Sparkles size={18} />
            </Link>
          </div>
          <p className="text-[13px] text-text-3 font-sans">No signup required · Free forever for 3 listings</p>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section-padding bg-surface">
        <div className="container max-w-4xl">
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-medium text-text-1 text-center mb-4">How it works</h2>
          <p className="text-center text-text-2 text-[15px] font-sans mb-14 max-w-lg mx-auto">Three simple steps. Less than a minute. Your property page is live.</p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {STEPS.map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="font-display text-[64px] font-medium text-primary/15 leading-none mb-2">{s.num}</div>
                <h3 className="font-display text-[20px] font-medium text-text-1 mb-2">{s.title}</h3>
                <p className="text-[14px] text-text-2 font-sans leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="section-padding">
        <div className="container max-w-4xl">
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-medium text-text-1 text-center mb-14">Built for Indian brokers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '✦', title: 'AI Content', desc: 'Describe in any language. AI writes headline, highlights, and structured details.' },
              { icon: '📱', title: 'Mobile-First', desc: 'Every page looks stunning on phones. Built for WhatsApp sharing.' },
              { icon: '📊', title: 'Analytics', desc: 'See who viewed, for how long, from which city. Track every client.' },
              { icon: '📸', title: 'Photo Gallery', desc: 'Full-screen lightbox, room tags, swipeable gallery. No compression.' },
              { icon: '📋', title: 'Collections', desc: 'Group multiple listings into one shareable link for shortlisted clients.' },
              { icon: '⚡', title: '60 Seconds', desc: 'Paste a WhatsApp message or speak — your listing is live in under a minute.' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-[15px] font-semibold text-text-1 font-sans mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-text-2 font-sans leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="section-padding bg-surface">
        <div className="container max-w-4xl">
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-medium text-text-1 text-center mb-4">Simple pricing</h2>
          <p className="text-center text-text-2 text-[15px] font-sans mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-6 transition-all ${
                  plan.popular
                    ? 'border-2 border-primary relative'
                    : 'border border-border'
                }`}
                style={{ boxShadow: plan.popular ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="text-[14px] font-medium text-text-2 font-sans mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-0.5 mb-5">
                  <span className="font-display text-[36px] font-medium text-text-1">{plan.price}</span>
                  <span className="text-[13px] text-text-3 font-sans">{plan.unit}</span>
                </div>
                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-text-2 font-sans">
                      <Check size={14} className="text-primary shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link
                  to="/create"
                  className={`w-full h-11 rounded-xl flex items-center justify-center text-[14px] font-medium ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]'
                      : 'bg-surface-2 text-text-1 hover:bg-border'
                  } transition-colors`}
                >
                  {plan.name === 'Free' ? 'Get Started Free' : `Start ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-padding">
        <div className="container max-w-4xl">
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-medium text-text-1 text-center mb-12">Loved by brokers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} className="text-[hsl(var(--amber))] fill-[hsl(var(--amber))]" />)}
                </div>
                <p className="text-[14px] text-text-2 font-sans leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="text-[13px] font-medium text-text-1 font-sans">{t.name}</div>
                <div className="text-[12px] text-text-3 font-sans">{t.agency}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section-padding" style={{ background: 'linear-gradient(180deg, #EAF3ED 0%, #F7F5F2 100%)' }}>
        <div className="container max-w-lg text-center">
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.5rem)] font-medium text-text-1 mb-4">Ready to impress your clients?</h2>
          <p className="text-[15px] text-text-2 font-sans mb-8">Create your first listing in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link to="/create" className="btn-primary h-12 px-8 text-[15px] inline-flex items-center gap-2">
              Create Free Listing <ArrowRight size={18} />
            </Link>
            <Link to="/create-presentation" className="bg-[#1A1A1A] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-[1.01] active:scale-[0.98]">
              Create Free Presentation <Sparkles size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border py-8">
        <div className="container max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="font-display text-[16px] font-medium text-text-1">PropSite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-6 text-[13px] text-text-3 font-sans">
            <Link to="/privacy" className="hover:text-text-1 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-text-1 transition-colors">Terms</Link>
            <a href="mailto:hello@propsite.in" className="hover:text-text-1 transition-colors">Contact</a>
          </div>
          <div className="text-[12px] text-text-3 font-sans">© 2024 PropSite. Made in India.</div>
        </div>
      </footer>
    </div>
  );
}
