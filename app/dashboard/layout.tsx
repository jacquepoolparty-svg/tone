'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

const NAV = [
  { icon: '📅', label: 'Calendar', href: '/dashboard' },
  { icon: '✏️', label: 'Composer', href: '/dashboard/composer' },
  { icon: '📚', label: 'Library', href: '/dashboard/library' },
  { icon: '📊', label: 'Analytics', href: '/dashboard/analytics' },
  { icon: '⚙️', label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = localStorage.getItem('tone_session');
    if (!session) { router.push('/login'); return; }
    const s = JSON.parse(session);
    supabaseAdmin.from('tone_workspaces').select('name').eq('id', s.workspaceId).single().then(({ data }) => {
      if (data) setWorkspaceName(data.name);
    });
  }, [router]);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D0D0D', color: '#fff', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column',
        padding: '24px 16px', flexShrink: 0,
      }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 700, color: '#24AD94', marginBottom: 32, display: 'block', padding: '4px 10px' }}>
          TONE
        </Link>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
                borderRadius: 8, fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                background: active ? 'rgba(36,173,148,0.15)' : 'transparent',
                color: active ? '#24AD94' : '#666',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Workspace pill */}
        <div style={{ background: '#141414', border: '1px solid #1f1f1f', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: '#555', marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Workspace</div>
          <div style={{ fontSize: 13, color: '#24AD94', fontWeight: 600 }}>{workspaceName || '...'}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
