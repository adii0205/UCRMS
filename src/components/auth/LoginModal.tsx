import { useState, type FormEvent } from 'react';
import { AlertCircle, LogIn, X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string) => Promise<void>;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onLogin(email.trim());
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const demoAccounts = [
    '112415012@cse.iiitp.ac.in',
    'neha.gupta@iiitp.ac.in',
    'ramesh.patel@iiitp.ac.in',
    'suresh.kumar@iiitp.ac.in',
    'admin.facilities@iiitp.ac.in',
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="login-title" className="text-lg font-bold text-slate-900 dark:text-white">Sign in to UCRMS</h2>
            <p className="mt-1 text-xs text-slate-500">Use a seeded campus account to explore the local demo.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close sign-in" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Campus email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950"
              placeholder="name@iiitp.ac.in"
            />
          </label>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <button disabled={isSubmitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
            <LogIn className="h-4 w-4" />
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Demo accounts</p>
          <div className="mt-2 space-y-1">
            {demoAccounts.map((account) => (
              <button key={account} type="button" onClick={() => setEmail(account)} className="block w-full truncate text-left text-xs text-blue-700 hover:underline dark:text-blue-300">
                {account}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-slate-400">
          Demo sign-in only. This local simulation is not an identity provider and must not be exposed as production authentication.
        </p>
      </section>
    </div>
  );
}
