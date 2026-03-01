'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create workspace
      const slug = workspace.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const workspaceId = crypto.randomUUID();

      const { error: wsError } = await supabaseAdmin.from('tone_workspaces').insert({
        id: workspaceId,
        name: workspace,
        slug,
        owner_id: email,
        industry: '',
        platforms: [],
        brand_dna: {},
      });

      if (wsError) throw new Error(wsError.message);

      // Create user
      const { error: userError } = await supabaseAdmin.from('tone_users').insert({
        email,
        password_hash: btoa(password), // placeholder — use bcrypt in production
        workspace_id: workspaceId,
        role: 'owner',
      });

      if (userError) throw new Error(userError.message);

      // Set session
      const session = { userId: email, workspaceId, email };
      localStorage.setItem('tone_session', JSON.stringify(session));

      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at 50% -10%, rgba(36,173,148,0.12) 0%, #0D0D0D 60%)',
    }}>
      <Link href="/" style={{ fontSize: 24, fontWeight: 700, color: '#24AD94', marginBottom: 48 }}>TONE</Link>

      <div style={{
        width: '100%', maxWidth: 420, background: '#111', border: '1px solid #222',
        borderRadius: 16, padding: 40,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>
          Start with Brand DNA onboarding. 5 minutes to perfect posts.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Workspace name</label>
            <input
              type="text"
              value={workspace}
              onChange={e => setWorkspace(e.target.value)}
              placeholder="e.g. Pool Party"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@brand.com"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: 12, fontSize: 13, color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#1a4a42' : '#24AD94',
              color: '#0D0D0D', fontWeight: 700, fontSize: 15,
              padding: '14px', borderRadius: 8, border: 'none',
              marginTop: 8, transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#555' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#24AD94' }}>Log in</Link>
        </p>
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#333', textAlign: 'center', maxWidth: 340 }}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0D0D0D', border: '1px solid #2a2a2a',
  borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14,
  outline: 'none', transition: 'border-color 0.2s',
};
