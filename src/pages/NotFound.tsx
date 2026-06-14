import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-8xl font-black tracking-widest text-primary/20 select-none">404</h1>
        <h2 className="text-3xl font-extrabold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/">
          <Button leftIcon={<Home className="h-4 w-4" />}>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
