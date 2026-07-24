import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/shared';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success('If an account exists, you will receive a reset link');
      setEmail('');
    }, 1200);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <CardHeader className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--sys-corner-sm)] bg-[var(--sys-primary)]/10">
            <Mail className="h-6 w-6 text-[var(--sys-primary)]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--sys-on-surface)]">
            Reset your password
          </CardTitle>
          <p className="mt-1 text-sm text-[var(--sys-on-surface-variant)]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--sys-on-surface-variant)]">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-medium text-[var(--sys-primary)] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
