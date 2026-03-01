'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

const PLATFORMS = [
  { id: 'instagram', label: '📸 Instagram', limit: 2200 },
  { id: 'linkedin', label: '💼 LinkedIn', limit: 3000 },
  { id: 'tiktok', label: '🎵 TikTok', limit: 2200 },
  { id: 'twitter', label: '𝕏 Twitter/X', limit: 280 },
];

export default function ComposerPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState('instagram');
  const [caption, setCaption] = useState('');
  const [brief, setBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');
  const [saving, setSaving] = useState(false);

  const workspaceId = typeof window !== 'undefined'
    ? (JSON.parse(localStorage.getItem('tone_session') || '{}').workspaceId || '')
    : '';

  const currentPlatform = PLATFORMS.find(p => p.id === platform);
  const charCount = caption.length;
  const charLimit = currentPlatform?.limit || 2200;

  const generate = useCallback(async () => {
    if (!brief.trim()) return;
    setGenerating(true);
    setCaption('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, platform, workspaceId }),
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setCaption(text);
      }
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }, [brief, platform, workspaceId]);

  async function save() {
    if (!caption.trim()) return;
    setSaving(true);
    await supabaseAdmin.from('tone_posts').insert({
      workspace_id: workspaceId, platform, caption,
      scheduled_for: scheduledFor || null,
      status: scheduledFor ? 'scheduled' : status,
      created_by: 'Jacque',
    });
    setSaving(false);
    router.push('/dashboard');
  }

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Composer</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Create your next post with AI that knows your voice</p>

      {/* Platform tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PLATFORMS.map(p => (
          <button key={p.id} onClick={() => setPlatform(p.id)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: platform === p.id ? 'rgba(36,173,148,0.15)' : 'transparent',
            borderColor: platform === p.id ? '#24AD94' : '#2a2a2a',
            color: platform === p.id ? '#24AD94' : '#666',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Caption */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>Caption</label>
          <span style={{ fontSize: 12, color: charCount > charLimit ? '#ff6b6b' : '#555' }}>{charCount}/{charLimit}</span>
        </div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write your caption..." rows={8}
          style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: 16, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6 }} />
      </div>

      {/* AI Section */}
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#24AD94', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>✨ Generate in your brand voice</div>
        <textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Describe what this post is about..." rows={2}
          style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: 8, padding: 12, color: '#fff', fontSize: 13, outline: 'none', resize: 'none', marginBottom: 10 }} />
        <button onClick={generate} disabled={!brief.trim() || generating} style={{
          background: generating ? '#1a4a42' : '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 14,
          padding: '10px 20px', borderRadius: 8, border: 'none', opacity: !brief.trim() ? 0.5 : 1, cursor: brief.trim() ? 'pointer' : 'not-allowed',
        }}>
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: '#888', fontWeight: 500, display: 'block', marginBottom: 8 }}>Schedule (optional)</label>
        <input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)}
          style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', colorScheme: 'dark' }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#666', fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={save} disabled={!caption.trim() || saving} style={{
          flex: 1, background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 14,
          padding: '12px 24px', borderRadius: 8, border: 'none',
          opacity: (!caption.trim() || saving) ? 0.5 : 1, cursor: caption.trim() ? 'pointer' : 'not-allowed',
        }}>
          {saving ? 'Saving...' : scheduledFor ? 'Schedule post' : 'Save draft'}
        </button>
      </div>
    </div>
  );
}
