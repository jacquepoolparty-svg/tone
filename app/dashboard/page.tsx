'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import type { TonePost } from '@/lib/supabase';
import ComposerPanel from '@/components/ComposerPanel';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  linkedin: '💼',
  tiktok: '🎵',
  twitter: '𝕏',
  facebook: '👥',
};
const STATUS_COLORS: Record<string, string> = {
  draft: '#555',
  scheduled: '#24AD94',
  approved: '#8A4FFF',
  posted: '#F5C842',
};

function getWeekDates(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<TonePost[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDate, setComposerDate] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<TonePost | null>(null);

  const weekDates = getWeekDates(currentDate);

  const loadPosts = useCallback(async (wsId: string) => {
    const { data } = await supabaseAdmin
      .from('tone_posts')
      .select('*')
      .eq('workspace_id', wsId)
      .order('scheduled_for', { ascending: true });
    if (data) setPosts(data);
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('tone_session');
    if (!session) return;
    const s = JSON.parse(session);
    setWorkspaceId(s.workspaceId);
    loadPosts(s.workspaceId);
  }, [loadPosts]);

  function getPostsForDay(date: Date): TonePost[] {
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(p => {
      if (!p.scheduled_for) return false;
      return p.scheduled_for.startsWith(dateStr);
    });
  }

  const upcomingPosts = posts
    .filter(p => p.scheduled_for && new Date(p.scheduled_for) >= new Date())
    .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime())
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Calendar area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{formatMonth(weekDates[0])}</h1>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>←</button>
              <button onClick={() => setCurrentDate(new Date())}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '0 12px', height: 32, borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Today</button>
              <button onClick={() => setCurrentDate(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>→</button>
            </div>
          </div>
          <button
            onClick={() => { setComposerDate(null); setComposerOpen(true); }}
            style={{ background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 8, border: 'none' }}
          >
            + New post
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #1a1a1a' }}>
          {DAYS.map((d, i) => {
            const date = weekDates[i];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div key={d} style={{
                padding: '12px', textAlign: 'center', borderRight: i < 6 ? '1px solid #1a1a1a' : 'none',
              }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{d}</div>
                <div style={{
                  fontSize: 20, fontWeight: 700,
                  color: isToday ? '#0D0D0D' : '#ccc',
                  background: isToday ? '#24AD94' : 'transparent',
                  width: 36, height: 36, borderRadius: '50%', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, overflow: 'auto' }}>
          {weekDates.map((date, i) => {
            const dayPosts = getPostsForDay(date);
            return (
              <div key={i} style={{
                borderRight: i < 6 ? '1px solid #1a1a1a' : 'none',
                minHeight: 200, padding: 8,
                position: 'relative',
              }}>
                {/* + button */}
                <button
                  onClick={() => { setComposerDate(date); setComposerOpen(true); }}
                  style={{
                    position: 'absolute', bottom: 8, right: 8,
                    width: 24, height: 24, borderRadius: 6, border: '1px dashed #2a2a2a',
                    background: 'transparent', color: '#444', fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#24AD94'; e.currentTarget.style.color = '#24AD94'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#444'; }}
                >+</button>

                {/* Posts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {dayPosts.map(post => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{
                        background: '#141414', border: `1px solid ${STATUS_COLORS[post.status] || '#333'}33`,
                        borderRadius: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.15s', width: '100%',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = STATUS_COLORS[post.status] || '#333')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = `${STATUS_COLORS[post.status] || '#333'}33`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{PLATFORM_ICONS[post.platform] || '📱'}</span>
                        <span style={{ fontSize: 10, color: STATUS_COLORS[post.status], fontWeight: 600, background: `${STATUS_COLORS[post.status]}22`, padding: '1px 6px', borderRadius: 4 }}>
                          {post.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.caption}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel — post queue */}
      <div style={{ width: 280, borderLeft: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1a1a1a' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Upcoming</h2>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {upcomingPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#444', fontSize: 13 }}>
              No scheduled posts.<br />Click + to create one.
            </div>
          )}
          {upcomingPosts.map(post => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              style={{
                background: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 14,
                textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f1f1f')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{PLATFORM_ICONS[post.platform] || '📱'}</span>
                <span style={{ fontSize: 11, color: STATUS_COLORS[post.status], fontWeight: 600 }}>{post.status}</span>
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                {post.caption}
              </p>
              {post.scheduled_for && (
                <div style={{ fontSize: 11, color: '#444' }}>
                  {new Date(post.scheduled_for).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Composer panel */}
      {composerOpen && (
        <ComposerPanel
          workspaceId={workspaceId}
          defaultDate={composerDate}
          onClose={() => setComposerOpen(false)}
          onSave={() => { loadPosts(workspaceId); setComposerOpen(false); }}
        />
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 36, maxWidth: 540, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>{PLATFORM_ICONS[selectedPost.platform] || '📱'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>{selectedPost.platform}</div>
                  {selectedPost.scheduled_for && (
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                      {new Date(selectedPost.scheduled_for).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 12, color: STATUS_COLORS[selectedPost.status], background: `${STATUS_COLORS[selectedPost.status]}22`, padding: '4px 10px', borderRadius: 100, fontWeight: 600 }}>
                {selectedPost.status}
              </span>
            </div>
            <p style={{ lineHeight: 1.7, color: '#ccc', fontSize: 15, whiteSpace: 'pre-wrap' }}>{selectedPost.caption}</p>
            {selectedPost.notes && (
              <div style={{ marginTop: 16, padding: 12, background: '#0D0D0D', borderRadius: 8, fontSize: 13, color: '#666' }}>
                📝 {selectedPost.notes}
              </div>
            )}
            <button
              onClick={() => setSelectedPost(null)}
              style={{ marginTop: 24, width: '100%', padding: 12, background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 8, color: '#666', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
