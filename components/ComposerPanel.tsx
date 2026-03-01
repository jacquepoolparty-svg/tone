'use client';
import { useState, useRef, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase';

const PLATFORMS = [
  { id: 'instagram', label: '📸 Instagram', limit: 2200 },
  { id: 'linkedin', label: '💼 LinkedIn', limit: 3000 },
  { id: 'tiktok', label: '🎵 TikTok', limit: 2200 },
  { id: 'twitter', label: '𝕏 Twitter/X', limit: 280 },
];

type Props = {
  workspaceId: string;
  defaultDate?: Date | null;
  onClose: () => void;
  onSave: () => void;
};

export default function ComposerPanel({ workspaceId, defaultDate, onClose, onSave }: Props) {
  const [platform, setPlatform] = useState('instagram');
  const [caption, setCaption] = useState('');
  const [brief, setBrief] = useState('');
  const [generating, setGenerating] = useState(false);
  const [scheduledFor, setScheduledFor] = useState(
    defaultDate ? defaultDate.toISOString().slice(0, 16) : ''
  );
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const currentPlatform = PLATFORMS.find(p => p.id === platform);
  const charCount = caption.length;
  const charLimit = currentPlatform?.limit || 2200;

  const generate = useCallback(async () => {
    if (!brief.trim()) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setGenerating(true);
    setCaption('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, platform, workspaceId }),
        signal: abortRef.current.signal,
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
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      setGenerating(false);
    }
  }, [brief, platform, workspaceId]);

  async function save() {
    if (!caption.trim()) return;
    setSaving(true);
    try {
      await supabaseAdmin.from('tone_posts').insert({
        workspace_id: workspaceId,
        platform,
        caption,
        scheduled_for: scheduledFor || null,
        status: scheduledFor ? 'scheduled' : status,
        created_by: 'Jacque',
      });
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div className="slide-in" style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 480,
        background: '#111', borderLeft: '1px solid #1f1f1f', zIndex: 160,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>New post</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Platform tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#0D0D0D', borderRadius: 8, padding: 4 }}>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 6, border: 'none',
                  background: platform === p.id ? '#1a1a1a' : 'transparent',
                  color: platform === p.id ? '#fff' : '#555', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Caption */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>Caption</label>
              <span style={{ fontSize: 12, color: charCount > charLimit ? '#ff6b6b' : '#555' }}>
                {charCount}/{charLimit}
              </span>
            </div>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write your caption or use AI to generate it..."
              rows={7}
              style={{
                width: '100%', background: '#0D0D0D', border: '1px solid #2a2a2a',
                borderRadius: 10, padding: '14px', color: '#fff', fontSize: 14,
                outline: 'none', resize: 'vertical', lineHeight: 1.6,
              }}
            />
          </div>

          {/* AI Generate */}
          <div style={{ background: '#0D0D0D', border: '1px solid #1f1f1f', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#24AD94', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ✨ AI Generate
            </div>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="Describe what this post is about..."
              rows={2}
              style={{
                width: '100%', background: '#111', border: '1px solid #2a2a2a',
                borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13,
                outline: 'none', resize: 'none', marginBottom: 10,
              }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={generate}
                disabled={!brief.trim() || generating}
                style={{
                  flex: 1, background: generating ? '#1a4a42' : '#24AD94',
                  color: '#0D0D0D', fontWeight: 700, fontSize: 13,
                  padding: '10px', borderRadius: 8, border: 'none',
                  opacity: !brief.trim() ? 0.5 : 1, cursor: brief.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {generating ? 'Generating...' : 'Generate in my brand voice'}
              </button>
              {caption && (
                <button
                  onClick={() => setCaption('')}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '10px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label style={{ fontSize: 13, color: '#888', fontWeight: 500, display: 'block', marginBottom: 8 }}>Schedule</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={e => setScheduledFor(e.target.value)}
              style={{ width: '100%', background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', colorScheme: 'dark' }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 13, color: '#888', fontWeight: 500, display: 'block', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['draft', 'scheduled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    background: status === s ? (s === 'scheduled' ? 'rgba(36,173,148,0.2)' : '#1a1a1a') : 'transparent',
                    border: status === s ? `1px solid ${s === 'scheduled' ? '#24AD94' : '#444'}` : '1px solid #2a2a2a',
                    color: status === s ? (s === 'scheduled' ? '#24AD94' : '#fff') : '#555',
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#666', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!caption.trim() || saving}
            style={{
              flex: 2, background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 14,
              padding: '12px', borderRadius: 8, border: 'none',
              opacity: (!caption.trim() || saving) ? 0.5 : 1, cursor: caption.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving...' : scheduledFor ? 'Schedule post' : 'Save draft'}
          </button>
        </div>
      </div>
    </>
  );
}
