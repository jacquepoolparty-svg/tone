'use client';
import { useState, useEffect } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import type { TonePost } from '@/lib/supabase';

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<TonePost[]>([]);

  useEffect(() => {
    const session = localStorage.getItem('tone_session');
    if (!session) return;
    const s = JSON.parse(session);
    supabaseAdmin.from('tone_posts').select('*').eq('workspace_id', s.workspaceId).then(({ data }) => {
      if (data) setPosts(data);
    });
  }, []);

  const byPlatform = ['instagram', 'linkedin', 'tiktok', 'twitter', 'facebook'].map(p => ({
    platform: p,
    count: posts.filter(x => x.platform === p).length,
  })).filter(x => x.count > 0);

  const byStatus = ['draft', 'scheduled', 'approved', 'posted'].map(s => ({
    status: s,
    count: posts.filter(x => x.status === s).length,
  }));

  const statusColors: Record<string, string> = { draft: '#555', scheduled: '#24AD94', approved: '#8A4FFF', posted: '#F5C842' };
  const platformIcons: Record<string, string> = { instagram: '📸', linkedin: '💼', tiktok: '🎵', twitter: '𝕏', facebook: '👥' };

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Total posts', value: posts.length, color: '#24AD94' },
          { label: 'Scheduled', value: posts.filter(p => p.status === 'scheduled').length, color: '#24AD94' },
          { label: 'Drafts', value: posts.filter(p => p.status === 'draft').length, color: '#555' },
          { label: 'Posted', value: posts.filter(p => p.status === 'posted').length, color: '#F5C842' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color, marginBottom: 8 }}>{stat.value}</div>
            <div style={{ fontSize: 14, color: '#555' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Posts by platform</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byPlatform.length === 0 && <div style={{ color: '#444', fontSize: 14 }}>No posts yet</div>}
            {byPlatform.map(({ platform, count }) => (
              <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, width: 28 }}>{platformIcons[platform]}</span>
                <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#24AD94', width: `${(count / posts.length) * 100}%`, borderRadius: 100, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 13, color: '#888', minWidth: 24, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Posts by status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byStatus.map(({ status, count }) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: statusColors[status], fontWeight: 700, minWidth: 70, textTransform: 'capitalize' }}>{status}</span>
                <div style={{ flex: 1, background: '#1a1a1a', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: statusColors[status], width: posts.length ? `${(count / posts.length) * 100}%` : '0%', borderRadius: 100, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 13, color: '#888', minWidth: 24, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, background: '#111', border: '1px solid #1a2a22', borderRadius: 16, padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Deep analytics coming soon</h3>
        <p style={{ color: '#555', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
          Engagement rates, best posting times, brand voice consistency scores, and platform-specific benchmarks.
        </p>
        <div style={{ marginTop: 24, display: 'inline-block', background: 'rgba(36,173,148,0.1)', border: '1px solid rgba(36,173,148,0.3)', color: '#24AD94', fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 100 }}>
          Coming in Studio tier
        </div>
      </div>
    </div>
  );
}
