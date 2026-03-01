'use client';
import Link from 'next/link';

const NAV_LINKS = ['Product', 'Pricing', 'About'];
const PROBLEMS = [
  {
    icon: '⚠️',
    title: 'Generic output',
    desc: 'AI tools produce the same content for every brand. Your posts sound like everyone else\'s.',
  },
  {
    icon: '✏️',
    title: 'Constant rewrites',
    desc: '80% of AI drafts get rewritten before posting. The tool doesn\'t know your voice.',
  },
  {
    icon: '📉',
    title: 'Brand drift',
    desc: 'Tone changes with every post, every manager, every platform. Brand equity erodes slowly.',
  },
];

const PRICING = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo AUD',
    features: ['1 workspace', '3 platforms', '30 AI posts/month', 'Brand DNA onboarding', 'Post scheduling'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Studio',
    price: '$79',
    period: '/mo AUD',
    features: ['3 workspaces', 'All platforms', 'Unlimited AI posts', 'Approval workflows', 'Analytics'],
    cta: 'Start free',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '$199',
    period: '/mo AUD',
    features: ['Unlimited workspaces', 'White label', 'Client portal', 'Priority support', 'API access'],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: '#24AD94' }}>TONE</div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <span key={l} style={{ fontSize: 14, color: '#888', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}
            >{l}</span>
          ))}
          <Link href="/login" style={{ fontSize: 14, color: '#ccc', marginLeft: 16 }}>Log in</Link>
          <Link href="/signup" style={{
            background: '#24AD94', color: '#0D0D0D', fontWeight: 600, fontSize: 14,
            padding: '10px 20px', borderRadius: 8, transition: 'opacity 0.2s',
          }}>Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(36,173,148,0.12) 0%, rgba(13,13,13,0) 60%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(138,79,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-block', background: 'rgba(36,173,148,0.12)', border: '1px solid rgba(36,173,148,0.3)',
          color: '#24AD94', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
          padding: '6px 16px', borderRadius: 100, marginBottom: 32, textTransform: 'uppercase',
        }}>A Focus Pool product</div>

        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-2px', marginBottom: 24, maxWidth: 900,
        }}>
          Content that sounds<br />
          <span style={{ color: '#24AD94' }}>like you.</span>
        </h1>

        <p style={{
          fontSize: 20, color: '#888', maxWidth: 560, lineHeight: 1.6, marginBottom: 48,
        }}>
          The social media platform that learns your brand voice — and never forgets it.
        </p>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{
            background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 16,
            padding: '16px 36px', borderRadius: 10, display: 'inline-block', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >Start free →</Link>
          <span style={{ fontSize: 14, color: '#555' }}>No credit card required</span>
        </div>

        {/* Hero visual */}
        <div style={{
          marginTop: 80, width: '100%', maxWidth: 900, position: 'relative',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
            padding: 2, overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(36,173,148,0.1)',
          }}>
            <div style={{ background: '#111', borderRadius: 14, overflow: 'hidden' }}>
              {/* Fake browser chrome */}
              <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #222' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28CA41' }} />
                <div style={{ flex: 1, background: '#111', borderRadius: 6, padding: '4px 12px', marginLeft: 8, fontSize: 12, color: '#555', textAlign: 'center' }}>app.usetone.com/dashboard</div>
              </div>
              {/* App preview */}
              <div style={{ display: 'flex', height: 400 }}>
                {/* Sidebar */}
                <div style={{ width: 200, borderRight: '1px solid #1f1f1f', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#24AD94', marginBottom: 16, padding: '4px 0' }}>TONE</div>
                  {[['📅', 'Calendar'], ['✏️', 'Composer'], ['📚', 'Library'], ['📊', 'Analytics'], ['⚙️', 'Settings']].map(([icon, label], i) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                      background: i === 0 ? 'rgba(36,173,148,0.15)' : 'transparent',
                      color: i === 0 ? '#24AD94' : '#666', fontSize: 13,
                    }}>
                      <span>{icon}</span><span>{label}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 'auto', background: '#1a1a1a', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Workspace</div>
                    <div style={{ fontSize: 12, color: '#24AD94', fontWeight: 600 }}>Pool Party</div>
                  </div>
                </div>
                {/* Main */}
                <div style={{ flex: 1, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>March 2026</div>
                    <div style={{ background: '#24AD94', color: '#0D0D0D', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>+ New post</div>
                  </div>
                  {/* Calendar grid preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#555', paddingBottom: 4 }}>{d}</div>
                    ))}
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <div key={d} style={{
                        aspectRatio: '1', borderRadius: 8, background: '#1a1a1a', border: '1px solid #222',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '4px 6px', fontSize: 10, color: '#555',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <span style={{ fontSize: 10, color: d === 3 ? '#24AD94' : '#555', fontWeight: d === 3 ? 700 : 400 }}>{d}</span>
                        {d === 3 && <div style={{ width: '100%', height: 3, background: '#24AD94', borderRadius: 2, marginTop: 2 }} />}
                        {d === 4 && <div style={{ width: '100%', height: 3, background: '#8A4FFF', borderRadius: 2, marginTop: 2 }} />}
                        {d === 6 && <div style={{ width: '100%', height: 3, background: '#24AD94', borderRadius: 2, marginTop: 2 }} />}
                        {d === 7 && <div style={{ width: '100%', height: 3, background: '#F5C842', borderRadius: 2, marginTop: 2 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section style={{ padding: '120px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', marginBottom: 16 }}>The problem</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Every other tool gets the brief.<br />
            <span style={{ color: '#555' }}>None of them get the brand.</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {PROBLEMS.map((p) => (
            <div key={p.title} style={{
              background: 'linear-gradient(135deg, #141414, #111)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
              padding: 36, transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(36,173,148,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <div style={{ fontSize: 32, marginBottom: 20 }}>{p.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{p.title}</h3>
              <p style={{ color: '#666', lineHeight: 1.7, fontSize: 15 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution / Before-After */}
      <section style={{ padding: '80px 24px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#24AD94', textTransform: 'uppercase', marginBottom: 16 }}>The solution</div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1 }}>
            Brand DNA. Train it once.<br />Sound like you forever.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 64 }}>
          {/* Before */}
          <div style={{
            background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#555', letterSpacing: '0.08em', marginBottom: 20, textTransform: 'uppercase' }}>❌ Generic AI output</div>
            <p style={{ color: '#555', lineHeight: 1.7, fontSize: 15, fontStyle: 'italic' }}>
              "We are so excited to share our incredible journey with you! 🚀 Our amazing team has been crushing it every single day, telling powerful stories that resonate with our awesome community. Stay tuned for more incredible content! #Blessed #Hustle #Authentic"
            </p>
          </div>
          {/* After */}
          <div style={{
            background: 'linear-gradient(135deg, #0f1f1d, #111)', border: '1px solid rgba(36,173,148,0.3)', borderRadius: 16, padding: 32,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
              background: 'radial-gradient(ellipse at top right, rgba(36,173,148,0.06) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#24AD94', letterSpacing: '0.08em', marginBottom: 20, textTransform: 'uppercase' }}>✅ TONE — Brand DNA</div>
            <p style={{ color: '#ccc', lineHeight: 1.7, fontSize: 15 }}>
              Client came to us with a 60-second brief. We gave them a content system. Six films. Twelve social assets. A sonic identity. The 60 seconds was the last thing we made.
            </p>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#24AD94' }} />
              <span style={{ fontSize: 12, color: '#24AD94' }}>Pool Party — Instagram</span>
            </div>
          </div>
        </div>

        {/* Brand DNA steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { step: '01', label: 'Brand basics', desc: 'Industry, platforms, audience' },
            { step: '02', label: 'Voice & Tone', desc: 'Sliders, words, examples' },
            { step: '03', label: 'Content pillars', desc: 'Themes & posting cadence' },
            { step: '04', label: 'Visual identity', desc: 'Colours, style, references' },
            { step: '05', label: 'First draft', desc: 'See your brand voice live' },
          ].map((s) => (
            <div key={s.step} style={{
              background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 24,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#24AD94', marginBottom: 8 }}>{s.step}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#555' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px 120px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: '#555', textTransform: 'uppercase', marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, letterSpacing: '-1px' }}>
              Simple, transparent pricing.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {PRICING.map((p) => (
              <div key={p.name} style={{
                background: p.highlight ? 'linear-gradient(135deg, #0f1f1d, #111)' : '#111',
                border: p.highlight ? '1px solid rgba(36,173,148,0.4)' : '1px solid #222',
                borderRadius: 16, padding: 36,
                transform: p.highlight ? 'scale(1.03)' : 'scale(1)',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.highlight && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: '#24AD94', color: '#0D0D0D', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 100, letterSpacing: '0.05em',
                  }}>POPULAR</div>
                )}
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 42, fontWeight: 700, color: p.highlight ? '#24AD94' : '#fff' }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: '#555' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#24AD94', fontSize: 16 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center',
                  background: p.highlight ? '#24AD94' : 'transparent',
                  color: p.highlight ? '#0D0D0D' : '#fff',
                  border: p.highlight ? 'none' : '1px solid #333',
                  fontWeight: 700, fontSize: 14, padding: '14px 24px', borderRadius: 8,
                }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '48px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#24AD94', marginBottom: 4 }}>TONE</div>
          <div style={{ fontSize: 13, color: '#555' }}>A Focus Pool product</div>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: '#555' }}>
          <Link href="/signup" style={{ color: '#555' }}>Sign up</Link>
          <Link href="/login" style={{ color: '#555' }}>Log in</Link>
          <span style={{ cursor: 'pointer' }}>Privacy</span>
          <span style={{ cursor: 'pointer' }}>Terms</span>
        </div>
        <div style={{ fontSize: 13, color: '#333' }}>© 2026 Focus Pool. All rights reserved.</div>
      </footer>
    </div>
  );
}
