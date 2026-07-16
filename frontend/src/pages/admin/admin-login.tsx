import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleButton } from '@/components/auth/google-button';
import { useAdminAuth } from '@/context/admin-auth-context';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function readJsonError(response: Response) {
  try {
    const payload = await response.json();
    return payload?.error ?? 'Something went wrong';
  } catch {
    return 'Something went wrong';
  }
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(await readJsonError(response));
        }

        const payload = (await response.json()) as {
          token: string;
          user: { id: string; email: string; name: string; role?: 'STUDENT' | 'ADMIN' };
        };

        if (payload.user.role !== 'ADMIN') {
          throw new Error('This account does not have admin access');
        }

        signIn({ id: payload.user.id, email: payload.user.email, role: 'ADMIN' }, payload.token);
        toast.success('Signed in with Google');
        navigate('/admin/dashboard', { replace: true });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Google sign-in failed');
      }
    })();
  }, [navigate, searchParams, signIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await readJsonError(response));
      }

      const payload = (await response.json()) as {
        token: string;
        user: { id: string; email: string; name: string; role?: 'STUDENT' | 'ADMIN' };
      };

      if (payload.user.role !== 'ADMIN') {
        throw new Error('This account does not have admin access');
      }

      signIn({ id: payload.user.id, email: payload.user.email, role: 'ADMIN' }, payload.token);
      toast.success('Welcome, admin');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Admin sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.assign(`${API_BASE}/api/auth/google/start?returnTo=/admin`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg">
              <Shield className="h-6 w-6" strokeWidth={2.2} />
            </span>
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Restricted access — authorized personnel only
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@mudraa.app"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <GoogleButton label="Continue with Google" onClick={handleGoogle} />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This is a restricted administrative area.
        </p>
      </div>
    </div>
  );
}
