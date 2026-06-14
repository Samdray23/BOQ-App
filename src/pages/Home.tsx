import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Layers, ShieldCheck, Zap, Code2, Paintbrush } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const techFeatures = [
    {
      title: 'React 19 & Vite',
      description: 'Harness the power of React 19 rules, dynamic Suspense architectures, and ultra-fast Vite module reloading.',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'TypeScript & ESM',
      description: 'Fully typed environments with path aliases, strict compilers, and native modern ES module definitions.',
      icon: Cpu,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Tailwind CSS v3',
      description: 'Premium light/dark design theme structure with fluid layout variables and component borders.',
      icon: Paintbrush,
      color: 'text-pink-500 bg-pink-500/10',
    },
    {
      title: 'TanStack React Query',
      description: 'Scalable cache management, asynchronous mutation callbacks, and optimized browser synchronization.',
      icon: Layers,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Zustand & Persist',
      description: 'State management storage layer persisting user profiles, theme toggles, and token keys.',
      icon: Code2,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      title: 'Husky & Linters',
      description: 'Continuous code standards enforcement via lint-staged, ESLint flat configurations, and Prettier rules.',
      icon: ShieldCheck,
      color: 'text-violet-500 bg-violet-500/10',
    },
  ];

  return (
    <div className="flex flex-col gap-20 py-8 items-center max-w-5xl mx-auto">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Zap className="h-3.5 w-3.5 fill-current" />
          Production Boilerplate Ready
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none">
          Build scale-ready apps{' '}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            in milliseconds
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
          An enterprise-ready stack pre-configured with React 19, TypeScript, Tailwind CSS, TanStack Query, Zustand, and ESLint.
        </p>
        <div className="pt-6 flex flex-wrap justify-center gap-4">
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <Button size="lg" className="shadow-lg hover:shadow-primary/20">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              Explore Docs
            </Button>
          </a>
        </div>
      </motion.section>

      {/* Grid Features */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="w-full space-y-10"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Standardized Core Stack</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Everything you need for performance-focused enterprise frontend products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div key={feat.title} variants={itemVariants}>
                <Card className="h-full border border-border bg-card/45 hover:border-primary/20 hover:bg-card/90 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className={`p-2.5 rounded-xl ${feat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
