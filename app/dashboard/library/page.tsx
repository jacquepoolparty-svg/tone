'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import type { TonePost } from '@/lib/supabase';

const PLATFORM_ICONS: Record<string, string> = { instagram: '📸', linkedin: '💼', tiktok: '🎵', twitter: '𝕏', facebook: '👥' };
const STATUS_COLORS: Record<string, string> = { draft: '#555', scheduled: '#24AD94', approved: '#8A4FFF', posted: '#F5C842' };

export default function LibraryPage() {
  const [posts, setPosts] = useState<TonePost[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const session = localStorage.getItem('tone_session');
    if (!session) return;
    const s = JSON.parse(session);
    supabaseAdmin.from('tone_posts').select('*').eq('workspace_id', s.workspaceId).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data);
    });
  }, []);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter || p.platform === filter);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Library</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'draft', 'scheduled', 'posted', 'instagram', 'linkedin', 'tiktok'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 100, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              background: filter === f ? '#24AD94' : 'transparent',
              borderColor: filter === f ? '#24AD94' : '#2a2a2a',
              color: filter === f ? '#0D0D0D' : '#666',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map(post => (
          <div key={post.id} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20, transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{PLATFORM_ICONS[post.platform] || '📱'}</span>
              <span style={{ fontSize: 11, color: STATUS_COLORS[post.status], background: `${STATUS_COLORS[post.status]}22`, padding: '3px 8px', borderRadius: 100, fontWeight: 600 }}>
                {post.status}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
              {post.caption}
            </p>
            {post.scheduled_for && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
                {new Date(post.scheduled_for).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#444' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>No posts yet</div>
          <div style={{ fontSize: 14, color: '#333' }}>Create your first post in the Composer</div>
        </div>
      )}
    </div>
  );
}
