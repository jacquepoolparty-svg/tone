'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import type { BrandDNA } from '@/lib/supabase';

const INDUSTRIES = [
  'Creative Agency', 'E-commerce', 'Fashion & Beauty', 'Food & Beverage',
  'Fitness & Health', 'Real Estate', 'Tech & SaaS', 'Hospitality',
  'Consulting', 'Media & Entertainment', 'Retail', 'Non-profit', 'Other',
];

const PLATFORMS = ['instagram', 'linkedin', 'tiktok', 'twitter', 'facebook'];
const PLATFORM_LABELS: Record<string, string> = {
  instagram: '📸 Instagram',
  linkedin: '💼 LinkedIn',
  tiktok: '🎵 TikTok',
  twitter: '𝕏 Twitter/X',
  facebook: '👥 Facebook',
};

const VISUAL_STYLES = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Film-quality, dramatic depth', color: '#1a1a2e' },
  { id: 'clean', label: 'Clean', desc: 'White space, editorial precision', color: '#1a1a1a' },
  { id: 'bold', label: 'Bold', desc: 'High contrast, strong typography', color: '#1a0a1a' },
  { id: 'minimal', label: 'Minimal', desc: 'Less is more, pure restraint', color: '#111' },
  { id: 'warm', label: 'Warm', desc: 'Golden tones, approachable feel', color: '#1a150a' },
  { id: 'moody', label: 'Moody', desc: 'Dark, atmospheric, intense', color: '#0f0f14' },
];

type OnboardingData = {
  workspaceName: string;
  industry: string;
  platforms: string[];
  targetAudience: string;
  voice: { formal_casual: number; serious_playful: number; corporate_human: number; reserved_bold: number };
  wordsToUse: string[];
  wordsToAvoid: string[];
  examplePostLove: string;
  examplePostHate: string;
  pillars: Array<{ name: string; description: string; frequency_per_week: number }>;
  brandColours: string[];
  visualStyle: string[];
  referenceAccounts: string[];
  samplePosts: string[];
};

const DEFAULT: OnboardingData = {
  workspaceName: '',
  industry: '',
  platforms: [],
  targetAudience: '',
  voice: { formal_casual: 50, serious_playful: 50, corporate_human: 50, reserved_bold: 50 },
  wordsToUse: [],
  wordsToAvoid: [],
  examplePostLove: '',
  examplePostHate: '',
  pillars: [
    { name: '', description: '', frequency_per_week: 2 },
    { name: '', description: '', frequency_per_week: 2 },
    { name: '', description: '', frequency_per_week: 1 },
  ],
  brandColours: ['#0D0D0D', '#24AD94', '#F5C842'],
  visualStyle: [],
  referenceAccounts: [],
  samplePosts: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(DEFAULT);
  const [tagInput, setTagInput] = useState({ use: '', avoid: '' });
  const [refInput, setRefInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('tone_session');
    if (!session) { router.push('/login'); return; }
    const s = JSON.parse(session);
    setWorkspaceId(s.workspaceId);
    // Pre-fill workspace name
    supabaseAdmin.from('tone_workspaces').select('name').eq('id', s.workspaceId).single().then(({ data: ws }) => {
      if (ws) setData(d => ({ ...d, workspaceName: ws.name }));
    });
  }, [router]);

  function updateVoice(key: keyof OnboardingData['voice'], val: number) {
    setData(d => ({ ...d, voice: { ...d.voice, [key]: val } }));
  }

  function addTag(field: 'wordsToUse' | 'wordsToAvoid', val: string) {
    const word = val.trim();
    if (!word) return;
    setData(d => ({ ...d, [field]: [...d[field], word] }));
    setTagInput(t => ({ ...t, [field === 'wordsToUse' ? 'use' : 'avoid']: '' }));
  }

  function removeTag(field: 'wordsToUse' | 'wordsToAvoid', i: number) {
    setData(d => ({ ...d, [field]: d[field].filter((_, idx) => idx !== i) }));
  }

  async function generateSamplePosts() {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, brandDna: buildBrandDNA() }),
      });
      const json = await res.json();
      setData(d => ({ ...d, samplePosts: json.posts || [] }));
    } catch {
      setData(d => ({ ...d, samplePosts: [
        'Here\'s a sample post based on your brand voice — direct, sharp, no fluff.',
        'Second sample: your audience expects point of view, not just information.',
        'Third sample: this is how TONE sounds when it knows your brand.',
      ] }));
    } finally {
      setGenerating(false);
    }
  }

  function buildBrandDNA(): BrandDNA {
    return {
      voice: data.voice,
      wordsToUse: data.wordsToUse,
      wordsToAvoid: data.wordsToAvoid,
      examplePostLove: data.examplePostLove,
      examplePostHate: data.examplePostHate,
      targetAudience: data.targetAudience,
      visualStyle: data.visualStyle,
      brandColours: data.brandColours,
      referenceAccounts: data.referenceAccounts,
    };
  }

  async function finish() {
    setSaving(true);
    try {
      const brandDna = buildBrandDNA();
      await supabaseAdmin.from('tone_workspaces').update({
        industry: data.industry,
        platforms: data.platforms,
        brand_dna: brandDna,
      }).eq('id', workspaceId);

      // Save pillars
      const validPillars = data.pillars.filter(p => p.name.trim());
      for (const pillar of validPillars) {
        await supabaseAdmin.from('tone_pillars').insert({
          workspace_id: workspaceId,
          ...pillar,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    'Brand basics',
    'Voice & Tone',
    'Content pillars',
    'Visual identity',
    'First draft',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header */}
      <div style={{ width: '100%', borderBottom: '1px solid #1a1a1a', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#24AD94' }}>TONE</div>
        <div style={{ fontSize: 14, color: '#555' }}>Brand DNA Onboarding</div>
        <div style={{ fontSize: 13, color: '#555' }}>Step {step} of 5</div>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', height: 2, background: '#1a1a1a' }}>
        <div style={{ height: '100%', background: '#24AD94', width: `${(step / 5) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 0, padding: '24px 0', borderBottom: '1px solid #1a1a1a', width: '100%', maxWidth: 800, justifyContent: 'space-between' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i + 1 < step ? '#24AD94' : i + 1 === step ? 'rgba(36,173,148,0.2)' : '#1a1a1a',
              border: i + 1 === step ? '2px solid #24AD94' : '2px solid transparent',
              fontSize: 13, fontWeight: 600,
              color: i + 1 <= step ? (i + 1 < step ? '#0D0D0D' : '#24AD94') : '#555',
            }}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 11, color: i + 1 === step ? '#fff' : '#555', textAlign: 'center', maxWidth: 80 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ width: '100%', maxWidth: 700, padding: '48px 24px', flex: 1 }}>

        {/* Step 1 */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Brand basics</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>Tell us about your brand. This sets the foundation for everything.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={labelStyle}>Brand name</label>
                <input value={data.workspaceName} onChange={e => setData(d => ({ ...d, workspaceName: e.target.value }))} placeholder="Pool Party" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <select value={data.industry} onChange={e => setData(d => ({ ...d, industry: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Platforms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setData(d => ({
                        ...d,
                        platforms: d.platforms.includes(p) ? d.platforms.filter(x => x !== p) : [...d.platforms, p]
                      }))}
                      style={{
                        padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                        background: data.platforms.includes(p) ? 'rgba(36,173,148,0.2)' : '#1a1a1a',
                        border: data.platforms.includes(p) ? '1px solid #24AD94' : '1px solid #2a2a2a',
                        color: data.platforms.includes(p) ? '#24AD94' : '#666',
                        transition: 'all 0.2s',
                      }}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Target audience</label>
                <textarea
                  value={data.targetAudience}
                  onChange={e => setData(d => ({ ...d, targetAudience: e.target.value }))}
                  placeholder="e.g. Brand founders and creative directors in Australia who want commercially intelligent work, not generic content."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Voice & Tone</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>Define the personality behind every word. Drag the sliders.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {[
                { key: 'formal_casual' as const, left: 'Formal', right: 'Casual' },
                { key: 'serious_playful' as const, left: 'Serious', right: 'Playful' },
                { key: 'corporate_human' as const, left: 'Corporate', right: 'Human' },
                { key: 'reserved_bold' as const, left: 'Reserved', right: 'Bold' },
              ].map(({ key, left, right }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#888' }}>{left}</span>
                    <span style={{ fontSize: 13, color: '#888' }}>{right}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={data.voice[key]}
                      onChange={e => updateVoice(key, Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#24AD94', cursor: 'pointer' }}
                    />
                    <div style={{
                      position: 'absolute', top: -28, left: `${data.voice[key]}%`,
                      transform: 'translateX(-50%)',
                      background: '#24AD94', color: '#0D0D0D',
                      fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      pointerEvents: 'none',
                    }}>{data.voice[key]}</div>
                  </div>
                </div>
              ))}

              {/* Words to use */}
              <div>
                <label style={labelStyle}>Words you'd use</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    value={tagInput.use}
                    onChange={e => setTagInput(t => ({ ...t, use: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('wordsToUse', tagInput.use); } }}
                    placeholder="e.g. cinematic, elevated"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={() => addTag('wordsToUse', tagInput.use)} style={addBtnStyle}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.wordsToUse.map((w, i) => (
                    <span key={i} style={tagStyle('#24AD94')}>
                      {w} <button onClick={() => removeTag('wordsToUse', i)} style={removeTagStyle}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Words to avoid */}
              <div>
                <label style={labelStyle}>Words you'd never use</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    value={tagInput.avoid}
                    onChange={e => setTagInput(t => ({ ...t, avoid: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('wordsToAvoid', tagInput.avoid); } }}
                    placeholder="e.g. synergy, crushing it"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={() => addTag('wordsToAvoid', tagInput.avoid)} style={addBtnStyle}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.wordsToAvoid.map((w, i) => (
                    <span key={i} style={tagStyle('#ff6b6b')}>
                      {w} <button onClick={() => removeTag('wordsToAvoid', i)} style={removeTagStyle}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>A post you love ❤️</label>
                <textarea
                  value={data.examplePostLove}
                  onChange={e => setData(d => ({ ...d, examplePostLove: e.target.value }))}
                  placeholder="Paste a caption that nails your brand voice..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>A post you hate 🚫</label>
                <textarea
                  value={data.examplePostHate}
                  onChange={e => setData(d => ({ ...d, examplePostHate: e.target.value }))}
                  placeholder="What kind of content makes your skin crawl..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Content pillars</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>What does your brand talk about? Define 3–5 recurring themes.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.pillars.map((p, i) => (
                <div key={i} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#24AD94', marginBottom: 12 }}>Pillar {i + 1}</div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <input
                      value={p.name}
                      onChange={e => setData(d => {
                        const pillars = [...d.pillars];
                        pillars[i] = { ...pillars[i], name: e.target.value };
                        return { ...d, pillars };
                      })}
                      placeholder="e.g. Behind the scenes"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: 8, padding: '0 12px', minWidth: 140 }}>
                      <input
                        type="number"
                        value={p.frequency_per_week}
                        onChange={e => setData(d => {
                          const pillars = [...d.pillars];
                          pillars[i] = { ...pillars[i], frequency_per_week: Number(e.target.value) };
                          return { ...d, pillars };
                        })}
                        min={1}
                        max={7}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 14, width: 40, outline: 'none' }}
                      />
                      <span style={{ fontSize: 12, color: '#555' }}>posts/week</span>
                    </div>
                  </div>
                  <textarea
                    value={p.description}
                    onChange={e => setData(d => {
                      const pillars = [...d.pillars];
                      pillars[i] = { ...pillars[i], description: e.target.value };
                      return { ...d, pillars };
                    })}
                    placeholder="What does this pillar cover? Who is it for?"
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              ))}
              {data.pillars.length < 5 && (
                <button
                  onClick={() => setData(d => ({ ...d, pillars: [...d.pillars, { name: '', description: '', frequency_per_week: 1 }] }))}
                  style={{ border: '1px dashed #333', background: 'transparent', color: '#555', padding: 16, borderRadius: 12, fontSize: 14, transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#24AD94'; e.currentTarget.style.color = '#24AD94'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#555'; }}
                >
                  + Add pillar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Visual identity</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>How your brand looks — so TONE can write for your visual world.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <label style={labelStyle}>Brand colours</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {data.brandColours.map((c, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 48, height: 48, background: c, borderRadius: 10, border: '2px solid #333', cursor: 'pointer', overflow: 'hidden' }}>
                          <input
                            type="color"
                            value={c}
                            onChange={e => setData(d => {
                              const cols = [...d.brandColours];
                              cols[i] = e.target.value;
                              return { ...d, brandColours: cols };
                            })}
                            style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer', position: 'absolute', top: 0, left: 0 }}
                          />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#555' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Visual style</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {VISUAL_STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setData(d => ({
                        ...d,
                        visualStyle: d.visualStyle.includes(s.id)
                          ? d.visualStyle.filter(x => x !== s.id)
                          : [...d.visualStyle, s.id]
                      }))}
                      style={{
                        padding: '16px', borderRadius: 12, textAlign: 'left',
                        background: data.visualStyle.includes(s.id) ? 'rgba(36,173,148,0.15)' : s.color,
                        border: data.visualStyle.includes(s.id) ? '1px solid #24AD94' : '1px solid #2a2a2a',
                        color: '#fff', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Reference accounts (Instagram handles you admire)</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input
                    value={refInput}
                    onChange={e => setRefInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && refInput.trim() && data.referenceAccounts.length < 5) {
                        e.preventDefault();
                        setData(d => ({ ...d, referenceAccounts: [...d.referenceAccounts, refInput.trim()] }));
                        setRefInput('');
                      }
                    }}
                    placeholder="@handle"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={() => {
                      if (refInput.trim() && data.referenceAccounts.length < 5) {
                        setData(d => ({ ...d, referenceAccounts: [...d.referenceAccounts, refInput.trim()] }));
                        setRefInput('');
                      }
                    }}
                    style={addBtnStyle}
                  >Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.referenceAccounts.map((a, i) => (
                    <span key={i} style={tagStyle('#8A4FFF')}>
                      {a} <button onClick={() => setData(d => ({ ...d, referenceAccounts: d.referenceAccounts.filter((_, idx) => idx !== i) }))} style={removeTagStyle}>×</button>
                    </span>
                  ))}
                </div>
                {data.referenceAccounts.length >= 5 && <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>Max 5 accounts</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>This is how TONE sounds for you</h2>
            <p style={{ color: '#666', marginBottom: 40 }}>Three sample posts generated from your Brand DNA. Does this sound like you?</p>

            {data.samplePosts.length === 0 && !generating && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <button
                  onClick={generateSamplePosts}
                  style={{
                    background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 16,
                    padding: '16px 36px', borderRadius: 10, border: 'none',
                  }}
                >
                  Generate in my brand voice →
                </button>
              </div>
            )}

            {generating && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#24AD94' }}>
                <div style={{ fontSize: 14, marginBottom: 16 }}>Generating with your Brand DNA...</div>
                <div style={{ width: 40, height: 40, border: '3px solid #1a1a1a', borderTopColor: '#24AD94', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            )}

            {data.samplePosts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                {data.samplePosts.map((post, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid rgba(36,173,148,0.2)', borderRadius: 16, padding: 28 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#24AD94', marginBottom: 12 }}>
                      {['Instagram', 'LinkedIn', 'TikTok'][i] || 'Post'} #{i + 1}
                    </div>
                    <p style={{ lineHeight: 1.7, color: '#ccc', fontSize: 15 }}>{post}</p>
                  </div>
                ))}
              </div>
            )}

            {data.samplePosts.length > 0 && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{ flex: 1, padding: '14px', borderRadius: 8, background: 'transparent', border: '1px solid #333', color: '#888', fontSize: 14, fontWeight: 600 }}
                >
                  ← Tweak my voice
                </button>
                <button
                  onClick={finish}
                  disabled={saving}
                  style={{ flex: 2, padding: '14px', borderRadius: 8, background: '#24AD94', border: 'none', color: '#0D0D0D', fontSize: 15, fontWeight: 700, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : 'Looks right — go to dashboard →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {step < 5 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 48 }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '14px 28px', borderRadius: 8, background: 'transparent', border: '1px solid #333', color: '#888', fontSize: 14, fontWeight: 600 }}>
                ← Back
              </button>
            )}
            <button
              onClick={async () => {
                if (step === 4) await generateSamplePosts();
                setStep(s => s + 1);
              }}
              style={{ flex: 1, padding: '14px', borderRadius: 8, background: '#24AD94', border: 'none', color: '#0D0D0D', fontSize: 15, fontWeight: 700 }}
            >
              {step === 4 ? 'Generate sample posts →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' };
const addBtnStyle: React.CSSProperties = { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 };
const tagStyle = (color: string): React.CSSProperties => ({
  background: `${color}22`, border: `1px solid ${color}55`, color,
  padding: '4px 10px', borderRadius: 100, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6,
});
const removeTagStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 };
