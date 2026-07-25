import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/shared';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center flex-1 justify-center py-16 px-4">
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

      <footer className="border-t border-[var(--sys-outline)] bg-[var(--sys-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="BOQ AI" className="h-10 w-10" />
                <span className="text-lg font-bold text-[var(--sys-primary)]">BOQ AI</span>
              </div>
              <p className="text-sm text-[var(--sys-on-surface-variant)] leading-relaxed max-w-xs">
                Transform architectural PDF drawings into professional Bills of Quantities, cost estimates, and material schedules in minutes.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'BOQ Generator', path: '/login' },
                  { label: 'Cost Estimation', path: '/login' },
                  { label: 'Material Schedules', path: '/login' },
                  { label: 'Rate Analysis', path: '/login' },
                  { label: 'Templates', path: '/login' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {['About', 'Contact', 'Careers', 'Blog'].map((label) => (
                  <li key={label}>
                    <button
                      className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label) => (
                  <li key={label}>
                    <button
                      className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--sys-outline)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--sys-on-surface-variant)]">
              &copy; {new Date().getFullYear()} BOQ AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-[var(--sys-on-surface-variant)]">
              <button className="hover:text-[var(--sys-primary)] transition-colors duration-200">Privacy Policy</button>
              <button className="hover:text-[var(--sys-primary)] transition-colors duration-200">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
