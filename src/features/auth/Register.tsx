import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
} from '@/components/shared';
import { useAuthStore } from '@/store/useAuthStore';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
  { label: 'One special character', test: (v: string) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
];

const roleOptions = [
  { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
  { value: 'architect', label: 'Architect' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'builder', label: 'Builder' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'developer', label: 'Developer' },
  { value: 'student', label: 'Student' },
];

export default function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) errs.password = 'Password needs an uppercase letter';
    else if (!/[a-z]/.test(password)) errs.password = 'Password needs a lowercase letter';
    else if (!/\d/.test(password)) errs.password = 'Password needs a number';
    else if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) errs.password = 'Password needs a special character';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!role) errs.role = 'Please select a role';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      login({ id: crypto.randomUUID(), name: name.trim(), email: email.trim(), role }, crypto.randomUUID());
      setLoading(false);
      toast.success('Account created successfully');
      navigate('/onboarding');
    }, 1200);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 rounded-[0.125rem] border-0 shadow-md">
        <CardHeader className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[var(--sys-primary-container)]">
            <UserPlus className="h-6 w-6 text-[var(--sys-on-primary-container)]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--sys-on-surface)]">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!passwordTouched) setPasswordTouched(true);
                }}
                onFocus={() => setPasswordTouched(true)}
                error={errors.password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              {passwordTouched && (
                <div className="mt-1.5 space-y-0.5 text-xs">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(password);
                    return (
                      <div
                        key={rule.label}
                        className="transition-all duration-200"
                        style={{
                          color: met ? 'var(--sys-on-surface-variant)' : 'var(--sys-on-error-container)',
                          opacity: met ? 0.4 : 1,
                        }}
                      >
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="Re-enter your password"
              icon={<Lock className="h-4 w-4" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-on-surface)] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Select
              id="role"
              label="Role"
              placeholder="Select your role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              error={errors.role}
            />
            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-[var(--sys-on-surface-variant)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--sys-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
