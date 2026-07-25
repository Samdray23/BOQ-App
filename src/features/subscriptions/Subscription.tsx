import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, Button, Badge } from '@/components/shared';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { cn } from '@/lib/cn';
import { Check, X, Crown, CreditCard } from 'lucide-react';

interface PlanConfig {
  id: 'free' | 'professional' | 'enterprise';
  displayName: string;
  priceMonthly: number;
  projectsLabel: string;
  features: { name: string; included: boolean }[];
  popular?: boolean;
}

const plans: PlanConfig[] = [
  {
    id: 'free',
    displayName: 'Free',
    priceMonthly: 0,
    projectsLabel: '2 projects/month',
    features: [
      { name: '2 projects per month', included: true },
      { name: 'Basic BOQ generation', included: true },
      { name: 'Limited project history', included: true },
      { name: 'Watermarked PDF reports', included: true },
      { name: 'Plain language explanations', included: true },
      { name: 'Material schedules', included: false },
      { name: 'Regional pricing', included: false },
      { name: 'Excel export', included: false },
      { name: 'Clean PDF export', included: false },
      { name: 'Priority processing', included: false },
      { name: 'Team collaboration', included: false },
    ],
  },
  {
    id: 'professional',
    displayName: 'Professional',
    priceMonthly: 15000,
    projectsLabel: 'Unlimited projects',
    popular: true,
    features: [
      { name: 'Unlimited projects', included: true },
      { name: 'Advanced BOQ generation', included: true },
      { name: 'Material schedules', included: true },
      { name: 'Regional pricing', included: true },
      { name: 'Full project history', included: true },
      { name: 'Excel export', included: true },
      { name: 'Clean PDF export', included: true },
      { name: 'Priority processing', included: true },
      { name: 'Plain language explanations', included: true },
      { name: 'Team collaboration', included: false },
      { name: 'API access', included: false },
    ],
  },
  {
    id: 'enterprise',
    displayName: 'Enterprise',
    priceMonthly: 50000,
    projectsLabel: 'Unlimited projects',
    features: [
      { name: 'Unlimited projects', included: true },
      { name: 'Advanced BOQ generation', included: true },
      { name: 'Material schedules', included: true },
      { name: 'Regional pricing', included: true },
      { name: 'Full project history', included: true },
      { name: 'Excel export', included: true },
      { name: 'Clean PDF export', included: true },
      { name: 'Priority processing', included: true },
      { name: 'Team collaboration', included: true },
      { name: 'API access', included: true },
      { name: 'Custom rate libraries', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Organisation dashboard', included: true },
    ],
  },
];

function PlanCard({
  plan,
  isCurrent,
  billingCycle,
}: {
  plan: PlanConfig;
  isCurrent: boolean;
  billingCycle: 'monthly' | 'yearly';
}) {
  const price =
    billingCycle === 'yearly' ? Math.round(plan.priceMonthly * 12 * 0.8) : plan.priceMonthly;
  const displayPrice = plan.priceMonthly === 0 ? 'Free' : `₦${price.toLocaleString()}`;

  const handleAction = () => {
    if (isCurrent) return;
    toast.success('Plan change requested');
  };

  return (
    <Card
      padding="lg"
      className={cn(
        'relative flex flex-col transition-all',
        isCurrent && 'border-[var(--sys-primary)] ring-1 ring-[var(--sys-primary)]'
      )}
    >
      {plan.popular && !isCurrent && (
        <Badge variant="info" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      {isCurrent && (
        <Badge variant="success" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          Current Plan
        </Badge>
      )}

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {plan.id === 'enterprise' && <Crown className="size-5 text-[var(--sys-primary)]" />}
            <h3 className="text-lg font-bold text-[var(--sys-on-surface)]">{plan.displayName}</h3>
          </div>
          <div className="mt-1">
            <span className="text-3xl font-bold text-[var(--sys-on-surface)]">{displayPrice}</span>
            {plan.priceMonthly > 0 && (
              <span className="text-sm text-[var(--sys-on-surface-variant)] ml-1">
                /{billingCycle === 'yearly' ? 'yr' : 'mo'}
              </span>
            )}
          </div>
          {billingCycle === 'yearly' && plan.priceMonthly > 0 && (
            <p className="text-xs text-green-600 font-medium mt-0.5">20% discount applied</p>
          )}
          <p className="text-sm text-[var(--sys-on-surface-variant)] mt-2">
            {plan.projectsLabel}
          </p>
        </div>

        <div className="space-y-2 flex-1">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {f.included ? (
                <Check className="size-4 shrink-0 text-green-600" />
              ) : (
                <X className="size-4 shrink-0 text-[var(--sys-on-surface-variant)]/40" />
              )}
              <span
                className={cn(
                  f.included
                    ? 'text-[var(--sys-on-surface)]'
                    : 'text-[var(--sys-on-surface-variant)]/50'
                )}
              >
                {f.name}
              </span>
            </div>
          ))}
        </div>

        {isCurrent ? (
          <Button variant="outline" disabled className="w-full">
            Current Plan
          </Button>
        ) : plan.priceMonthly > useSubscriptionStore.getState().plan.priceMonthly ? (
          <Button onClick={handleAction} className="w-full">
            Upgrade
          </Button>
        ) : (
          <Button variant="outline" onClick={handleAction} className="w-full">
            Downgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Subscription() {
  const { plan: currentPlan, billingCycle, setBillingCycle } = useSubscriptionStore();
  const [tab, setTab] = useState<'plans' | 'payment' | 'invoices'>('plans');

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Subscription Plan</h1>
        <p className="text-sm text-[var(--sys-on-surface-variant)] mt-1">
          Choose the plan that fits your practice.
        </p>
      </motion.div>

      <div className="flex gap-1 flex-wrap">
        {(['plans', 'payment', 'invoices'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-[var(--sys-corner-sm)] capitalize transition-colors',
              tab === t
                ? 'bg-[var(--sys-primary)] text-white'
                : 'text-[var(--sys-on-surface-variant)] hover:bg-[var(--sys-surface-container)]'
            )}
          >
            {t === 'plans' ? 'Plans' : t === 'payment' ? 'Payment Methods' : 'Invoice History'}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <>
          <div className="flex items-center justify-center gap-3">
            <span
              className={cn(
                'text-sm font-medium',
                billingCycle === 'monthly'
                  ? 'text-[var(--sys-on-surface)]'
                  : 'text-[var(--sys-on-surface-variant)]'
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                billingCycle === 'yearly' ? 'bg-[var(--sys-primary)]' : 'bg-[var(--sys-outline)]'
              )}
            >
              <span
                className={cn(
                  'inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                  billingCycle === 'yearly' ? 'translate-x-[22px]' : 'translate-x-[2px]'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium',
                billingCycle === 'yearly'
                  ? 'text-[var(--sys-on-surface)]'
                  : 'text-[var(--sys-on-surface-variant)]'
              )}
            >
              Yearly <span className="text-green-600 text-xs">(Save 20%)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <PlanCard
                  plan={p}
                  isCurrent={currentPlan.name === p.id}
                  billingCycle={billingCycle}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {tab === 'payment' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--sys-on-surface-variant)]">Saved payment methods</p>
          <p className="text-sm text-[var(--sys-on-surface-variant)]">No payment methods yet.</p>
          <Button
            variant="outline"
            onClick={() => toast.info('Payment integration coming soon')}
          >
            <CreditCard className="size-4" />
            Add Payment Method
          </Button>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--sys-on-surface-variant)]">No invoices yet.</p>
        </div>
      )}
    </div>
  );
}
