import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    setTimeout(() => {
      login(
        {
          id: 'user_1',
          name: 'Jane Doe',
          email: data.email,
          role: 'Administrator',
        },
        'mock_jwt_token_key'
      );
      setIsLoading(false);
      toast.success('Successfully logged in');
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border shadow-2xl bg-card">
          <CardHeader className="space-y-1.5 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your email below to access your account dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                leftIcon={!isLoading && <LogIn className="h-4 w-4" />}
              >
                Sign In
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Demo values: Any valid email / 6+ char password
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
