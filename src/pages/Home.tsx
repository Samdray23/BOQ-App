import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/shared';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none">
          Turn architectural drawings into{' '}
          <span className="bg-gradient-to-r from-[var(--sys-primary)] via-[var(--sys-tertiary-color)] to-[var(--sys-secondary-color)] bg-clip-text text-transparent">
            BOQs in minutes
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-[var(--sys-on-surface-variant)] font-light max-w-2xl mx-auto leading-relaxed">
          BOQ helps quantity surveyors, contractors, architects, and homeowners generate
          professional Bills of Quantities, cost estimates, and material schedules from PDF drawings.
        </p>
        <div className="pt-6 flex justify-center">
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <Button size="lg" className="shadow-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
