'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import type { Workspace } from '@/lib/supabase';

const PLATFORM_ICONS: Record<string, string> = { instagram: '📸', linkedin: '💼', tiktok: '🎵', twitter: '𝕏', facebook: '👥' };

export default function SettingsPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [activeTab, setActiveTab] = useState('workspace');
  const [saving, setSaving] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('tone_session');
    if (!session) { router.push('/login'); return; }
    const s = JSON.parse(session);
    supabaseAdmin.from('tone_workspaces').select('*').eq('id', s.workspaceId).single().then(({ data }) => {
      if (data) { setWorkspace(data); setWorkspaceName(data.name); }
    });
  }, [router]);

  async function saveWorkspaceName() {
    if (!workspace) return;
    setSaving(true);
    await supabaseAdmin.from('tone_workspaces').update({ name: workspaceName }).eq('id', workspace.id);
    setSaving(false);
  }

  function logout() {
    localStorage.removeItem('tone_session');
    router.push('/login');
  }

  const TABS = ['workspace', 'brand-dna', 'platforms', 'team', 'billing'];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D0D0D', color: '#fff' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, borderRight: '1px solid #1a1a1a', padding: '24px 16px', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ fontSize: 20, fontWeight: 700, color: '#24AD94', marginBottom: 32, display: 'block', padding: '4px 10px' }}>TONE</Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { icon: '📅', label: 'Calendar', href: '/dashboard' },
            { icon: '✏️', label: 'Composer', href: '/dashboard/composer' },
            { icon: '📚', label: 'Library', href: '/dashboard/library' },
            { icon: '📊', label: 'Analytics', href: '/dashboard/analytics' },
            { icon: '⚙️', label: 'Settings', href: '/settings' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
              borderRadius: 8, fontSize: 14, fontWeight: 500, color: item.href === '/settings' ? '#24AD94' : '#666',
              background: item.href === '/settings' ? 'rgba(36,173,148,0.15)' : 'transparent',
              textDecoration: 'none',
            }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: 32, maxWidth: 800 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Settings</h1>
          <p style={{ color: '#666', marginBottom: 32 }}>Manage your workspace and brand configuration</p>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #1a1a1a', marginBottom: 32 }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px', background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #24AD94' : '2px solid transparent',
                  color: activeTab === tab ? '#24AD94' : '#666',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.15s',
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Workspace tab */}
          {activeTab === 'workspace' && workspace && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={labelStyle}>Workspace name</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={saveWorkspaceName} disabled={saving} style={saveBtnStyle}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Workspace slug</label>
                <input value={workspace.slug || ''} readOnly style={{ ...inputStyle, color: '#555' }} />
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <input value={workspace.industry || ''} readOnly style={{ ...inputStyle, color: '#555' }} />
              </div>
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24 }}>
                <button onClick={logout} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff6b6b', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* Brand DNA tab */}
          {activeTab === 'brand-dna' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Brand DNA</h2>
                  <p style={{ color: '#666', fontSize: 14 }}>Your brand voice configuration</p>
                </div>
                <Link href="/onboarding" style={{ background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 8 }}>
                  Edit Brand DNA →
                </Link>
              </div>
              {workspace?.brand_dna && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {workspace.brand_dna.wordsToUse?.length ? (
                    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20 }}>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Words to use</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {workspace.brand_dna.wordsToUse.map((w: string) => (
                          <span key={w} style={{ background: 'rgba(36,173,148,0.15)', border: '1px solid rgba(36,173,148,0.3)', color: '#24AD94', padding: '4px 12px', borderRadius: 100, fontSize: 13 }}>{w}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {workspace.brand_dna.wordsToAvoid?.length ? (
                    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20 }}>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>Words to avoid</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {workspace.brand_dna.wordsToAvoid.map((w: string) => (
                          <span key={w} style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff6b6b', padding: '4px 12px', borderRadius: 100, fontSize: 13 }}>{w}</span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {workspace.brand_dna.targetAudience && (
                    <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: 20 }}>
                      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Target audience</div>
                      <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, margin: 0 }}>{workspace.brand_dna.targetAudience}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Platforms tab */}
          {activeTab === 'platforms' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Connected platforms</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
                  <div key={platform} style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <span style={{ fontSize: 24 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, textTransform: 'capitalize' }}>{platform === 'twitter' ? 'Twitter/X' : platform}</div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Not connected</div>
                      </div>
                    </div>
                    <button style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                      Connect — coming soon
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team tab */}
          {activeTab === 'team' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Team members</h2>
              <div style={{ background: '#111', border: '1px dashed #2a2a2a', borderRadius: 12, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>👥</div>
                <h3 style={{ marginBottom: 8 }}>Invite your team</h3>
                <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>Add team members to collaborate on content</p>
                <button style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', padding: '10px 24px', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
                  Invite by email — coming soon
                </button>
              </div>
            </div>
          )}

          {/* Billing tab */}
          {activeTab === 'billing' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Billing</h2>
              <div style={{ background: '#111', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 16, padding: 28, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Starter plan</div>
                    <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>$29 AUD/month</div>
                  </div>
                  <span style={{ background: 'rgba(245,200,66,0.15)', color: '#F5C842', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, alignSelf: 'flex-start' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['1 workspace', '3 platforms', '30 AI posts/month'].map(f => (
                    <div key={f} style={{ fontSize: 14, color: '#888', display: 'flex', gap: 8 }}>
                      <span style={{ color: '#24AD94' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              <button style={{ background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                Manage billing — Stripe portal →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 13, color: '#888', display: 'block', marginBottom: 8, fontWeight: 500 };
const inputStyle: React.CSSProperties = { background: '#0D0D0D', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', width: '100%' };
const saveBtnStyle: React.CSSProperties = { background: '#24AD94', color: '#0D0D0D', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' };
