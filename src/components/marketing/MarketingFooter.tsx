import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', path: '/#features' },
    { label: 'Pricing', path: '/#pricing' },
    { label: 'Templates', path: '/templates' },
    { label: 'AI Assistant', path: '/ai-assistant' },
  ],
  resources: [
    { label: 'Documentation', path: '/docs' },
    { label: 'API Reference', path: '/api' },
    { label: 'Guides', path: '/guides' },
    { label: 'Blog', path: '/blog' },
  ],
  company: [
    { label: 'About Us', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
    { label: 'Partners', path: '/partners' },
  ],
  legal: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Cookie Policy', path: '/cookies' },
    { label: 'Security', path: '/security' },
  ],
};

const socialLinks = [
  { name: 'Twitter', href: '#', icon: 'M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z' },
  { name: 'LinkedIn', href: '#', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { name: 'GitHub', href: '#', icon: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
];

export default function MarketingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t" style={{ borderColor: 'var(--sys-outline)', backgroundColor: 'var(--sys-surface)' }}>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-5 xl:gap-8">
          {/* Brand */}
          <div className="xl:col-span-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="BOQ" className="h-10 w-10" />
              <span className="text-title-large" style={{ color: 'var(--sys-on-surface)' }}>BOQ</span>
            </button>
            <p className="text-body-medium mt-4 max-w-md" style={{ color: 'var(--sys-on-surface-variant)' }}>
              Professional Bills of Quantities, cost estimates, and material schedules generated from PDF drawings in minutes.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-body-small" style={{ color: 'var(--sys-on-surface-variant)' }}>
                <Mail size={16} style={{ color: 'var(--sys-primary)' }} />
                <span>support@boq.ai</span>
              </div>
              <div className="flex items-center gap-3 text-body-small" style={{ color: 'var(--sys-on-surface-variant)' }}>
                <Phone size={16} style={{ color: 'var(--sys-primary)' }} />
                <span>+234 (0) 800 BOQ HELP</span>
              </div>
              <div className="flex items-center gap-3 text-body-small" style={{ color: 'var(--sys-on-surface-variant)' }}>
                <MapPin size={16} style={{ color: 'var(--sys-primary)' }} />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          <div className="mt-10 xl:mt-0">
            <h3 className="text-label-large font-semibold" style={{ color: 'var(--sys-on-surface)' }}>Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-body-small transition-colors hover:underline"
                    style={{ color: 'var(--sys-on-surface-variant)' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 xl:mt-0">
            <h3 className="text-label-large font-semibold" style={{ color: 'var(--sys-on-surface)' }}>Resources</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-body-small transition-colors hover:underline"
                    style={{ color: 'var(--sys-on-surface-variant)' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 xl:mt-0">
            <h3 className="text-label-large font-semibold" style={{ color: 'var(--sys-on-surface)' }}>Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-body-small transition-colors hover:underline"
                    style={{ color: 'var(--sys-on-surface-variant)' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--sys-outline)' }}>
          <p className="text-micro" style={{ color: 'var(--sys-on-surface-variant)' }}>
            &copy; {new Date().getFullYear()} BOQ AI. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="text-micro transition-colors hover:underline"
                style={{ color: 'var(--sys-on-surface-variant)' }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'var(--sys-on-surface-variant)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sys-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sys-on-surface-variant)')}
              >
                <span className="sr-only">{social.name}</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}