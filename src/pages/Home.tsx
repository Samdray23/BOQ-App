import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Upload,
  Cpu,
  FileText,
  Download,
  Check,
  ChevronDown,
  Calculator,
  ClipboardList,
  BarChart3,
  Layers,
  FileSpreadsheet,
  PenTool,
  Shield,
  Zap,
  Eye,
  Building2,
  HardHat,
  Ruler,
  Users,
  Home,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/shared';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const BOQ_SAMPLE = [
  { code: 'A.01', desc: 'Site Mobilization', unit: 'sum', qty: 1, rate: 850000, amt: 850000 },
  { code: 'B.01', desc: 'Site Clearing & Topsoil Stripping', unit: 'm²', qty: 450, rate: 1800, amt: 810000 },
  { code: 'B.02', desc: 'Trench Excavation (Foundation)', unit: 'm³', qty: 98, rate: 5200, amt: 509600 },
  { code: 'C.01', desc: 'Blinding Concrete (50mm)', unit: 'm²', qty: 120, rate: 8500, amt: 1020000 },
  { code: 'C.02', desc: 'Reinforced Concrete Strip Foundation', unit: 'm³', qty: 40, rate: 125000, amt: 5000000 },
  { code: 'D.01', desc: '225mm Hollow Block Wall (External)', unit: 'm²', qty: 310, rate: 19500, amt: 6045000 },
  { code: 'E.01', desc: 'Roof Timber Framework (Treated)', unit: 'm²', qty: 185, rate: 12800, amt: 2368000 },
  { code: 'F.01', desc: 'External Hardwood Door (Panel Type)', unit: 'nr', qty: 2, rate: 220000, amt: 440000 },
  { code: 'H.01', desc: 'Ceramic Floor Tiles (400×400mm)', unit: 'm²', qty: 220, rate: 9500, amt: 2090000 },
  { code: 'I.01', desc: 'Internal Wall Plastering', unit: 'm²', qty: 620, rate: 4800, amt: 2976000 },
];

const STEPS = [
  { icon: Upload, title: 'Upload Drawing', desc: 'Upload your architectural PDF drawing — floor plans, sections, or elevations.' },
  { icon: Cpu, title: 'AI Analyses', desc: 'BOQ AI extracts dimensions, quantities, and identifies construction elements automatically.' },
  { icon: FileText, title: 'Review BOQ', desc: 'Review a structured Bill of Quantities with item codes, descriptions, units, and rates.' },
  { icon: Download, title: 'Export', desc: 'Export your professional BOQ as PDF or Excel. Share with clients and teams.' },
];

const FEATURES = [
  { icon: FileSpreadsheet, title: 'AI BOQ Generation', desc: 'Generate structured Bills of Quantities from architectural drawings in minutes.' },
  { icon: Eye, title: 'Drawing Analysis', desc: 'AI identifies walls, doors, windows, and structural elements from PDF plans.' },
  { icon: Calculator, title: 'Cost Estimation', desc: 'Get accurate cost breakdowns by labour, materials, equipment, and overheads.' },
  { icon: ClipboardList, title: 'Material Schedules', desc: 'Auto-generate material take-offs with quantities, wastage, and unit prices.' },
  { icon: Layers, title: 'Measurement Sheets', desc: 'Detailed dimensional analysis linked to BOQ sections and project specifications.' },
  { icon: BarChart3, title: 'Rate Analysis', desc: 'Build and compare rate analyses with material, labour, and equipment breakdowns.' },
  { icon: PenTool, title: 'Professional Reports', desc: 'Generate polished project reports ready for client submission and tender documents.' },
  { icon: FileText, title: 'Templates', desc: 'Start faster with pre-built templates for residential, commercial, and institutional projects.' },
  { icon: Zap, title: 'Fast Processing', desc: 'Reduce days of manual quantity takeoff to minutes of automated AI processing.' },
];

const AUDIENCES = [
  { icon: Ruler, title: 'Quantity Surveyors', desc: 'Automate quantity takeoff, cost estimation, and BOQ preparation. Focus on advisory work instead of manual calculations.' },
  { icon: HardHat, title: 'Contractors', desc: 'Quickly generate material schedules and cost estimates for accurate project bidding and procurement.' },
  { icon: PenTool, title: 'Architects', desc: 'Bridge the gap between design and cost. Validate project feasibility early with instant cost estimates.' },
  { icon: Building2, title: 'Construction Companies', desc: 'Standardize BOQ workflows across projects. Improve consistency and reduce estimation errors.' },
  { icon: Briefcase, title: 'Developers', desc: 'Get clear project cost breakdowns before committing to construction. Make informed investment decisions.' },
  { icon: Home, title: 'Homeowners', desc: 'Understand what your building project will cost. Compare contractor quotes with an independent BOQ.' },
];

const FAQS = [
  { q: 'What is BOQ AI?', a: 'BOQ AI is a cloud-based platform that uses artificial intelligence to automatically generate Bills of Quantities, cost estimates, material schedules, and professional reports from architectural PDF drawings.' },
  { q: 'Who can use BOQ AI?', a: 'BOQ AI is designed for quantity surveyors, contractors, architects, construction companies, developers, and homeowners who need accurate construction cost documentation.' },
  { q: 'What type of drawings can I upload?', a: 'You can upload PDF architectural drawings including floor plans, building sections, elevations, and site plans. The AI works best with clear, professionally prepared drawings.' },
  { q: 'Can I review and edit generated BOQs?', a: 'Yes. Every BOQ generated by BOQ AI is fully editable. You can modify item descriptions, quantities, rates, and add or remove items before exporting.' },
  { q: 'Can I generate cost estimates?', a: 'Yes. BOQ AI includes a cost estimation module that calculates labour, material, equipment, overheads, profit margins, and contingencies based on your BOQ data and project location.' },
  { q: 'Can I export my BOQ?', a: 'Yes. You can export your BOQ and reports as PDF or Excel files. Professional plan users can generate clean, unwatermarked exports for client submission.' },
  { q: 'Do I need to be a quantity surveyor to use BOQ AI?', a: 'No. BOQ AI is built with plain-language explanations for every BOQ item. Homeowners, developers, and professionals from other backgrounds can use the platform effectively.' },
  { q: 'How accurate are the AI-generated quantities?', a: 'BOQ AI provides high-confidence estimates based on standard measurement rules. All quantities are editable, and provisional items are clearly marked so you can verify and adjust before finalizing.' },
];

function formatN(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--sys-outline)] rounded-[var(--sys-corner-sm)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--sys-surface-container)] transition-colors"
      >
        <span className="text-sm font-semibold text-[var(--sys-on-surface)] pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--sys-on-surface-variant)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="px-5 pb-4 text-sm text-[var(--sys-on-surface-variant)] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const demoTabs = [
  { label: 'Upload Drawing', icon: Upload },
  { label: 'AI Processing', icon: Cpu },
  { label: 'BOQ Generated', icon: FileText },
  { label: 'Cost Estimate', icon: Calculator },
  { label: 'Material Schedule', icon: ClipboardList },
];

function DemoPreview({ activeTab }: { activeTab: number }) {
  return (
    <div className="rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] shadow-lg overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline)]">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-error)]/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-warning)]/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-success)]/60" />
        <span className="ml-3 text-xs text-[var(--sys-on-surface-variant)] font-mono">BOQ AI — Project Workspace</span>
      </div>
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--sys-primary)]/10 flex items-center justify-center">
                <Upload className="h-10 w-10 text-[var(--sys-primary)]" />
              </div>
              <p className="text-sm font-semibold text-[var(--sys-on-surface)]">Drop your architectural drawing here</p>
              <p className="text-xs text-[var(--sys-on-surface-variant)]">Supports PDF files up to 50MB</p>
              <div className="px-6 py-2 rounded-[var(--sys-corner-sm)] border border-dashed border-[var(--sys-outline)] text-xs text-[var(--sys-on-surface-variant)]">
                Floor Plans · Sections · Elevations
              </div>
            </motion.div>
          )}
          {activeTab === 1 && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[var(--sys-tertiary-color)]/10 flex items-center justify-center">
                <Cpu className="h-10 w-10 text-[var(--sys-tertiary-color)] animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-[var(--sys-on-surface)]">Analysing your drawing...</p>
              <div className="w-full max-w-xs space-y-2">
                {['Detecting walls & openings', 'Measuring dimensions', 'Classifying elements'].map((t, i) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className={`h-3.5 w-3.5 ${i < 2 ? 'text-[var(--sys-success)]' : 'text-[var(--sys-outline)]'}`} />
                    <span className="text-xs text-[var(--sys-on-surface-variant)]">{t}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 2 && (
            <motion.div key="boq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[var(--sys-on-surface)]">Generated BOQ — 34 items across 12 sections</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--sys-success)]/10 text-[var(--sys-success)] font-medium">Complete</span>
              </div>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--sys-outline)]">
                      <th className="text-left py-2 pr-2 font-semibold text-[var(--sys-on-surface-variant)]">Code</th>
                      <th className="text-left py-2 pr-2 font-semibold text-[var(--sys-on-surface-variant)]">Description</th>
                      <th className="text-left py-2 pr-2 font-semibold text-[var(--sys-on-surface-variant)]">Unit</th>
                      <th className="text-right py-2 pr-2 font-semibold text-[var(--sys-on-surface-variant)]">Qty</th>
                      <th className="text-right py-2 pr-2 font-semibold text-[var(--sys-on-surface-variant)]">Rate</th>
                      <th className="text-right py-2 font-semibold text-[var(--sys-on-surface-variant)]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BOQ_SAMPLE.slice(0, 6).map((r) => (
                      <tr key={r.code} className="border-b border-[var(--sys-outline)]/50">
                        <td className="py-2 pr-2 font-mono text-[var(--sys-on-surface)]">{r.code}</td>
                        <td className="py-2 pr-2 text-[var(--sys-on-surface)]">{r.desc}</td>
                        <td className="py-2 pr-2 text-[var(--sys-on-surface-variant)]">{r.unit}</td>
                        <td className="py-2 pr-2 text-right text-[var(--sys-on-surface)]">{r.qty.toLocaleString()}</td>
                        <td className="py-2 pr-2 text-right text-[var(--sys-on-surface-variant)]">₦{r.rate.toLocaleString()}</td>
                        <td className="py-2 text-right font-medium text-[var(--sys-on-surface)]">₦{r.amt.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-[var(--sys-on-surface-variant)] mt-2 text-center">Showing 6 of 34 items</p>
            </motion.div>
          )}
          {activeTab === 3 && (
            <motion.div key="cost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs font-semibold text-[var(--sys-on-surface)] mb-3">Cost Estimate Summary</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Materials', value: '₦38.5M', pct: 57 },
                  { label: 'Labour', value: '₦12.5M', pct: 18 },
                  { label: 'Equipment', value: '₦5.2M', pct: 8 },
                  { label: 'Overheads', value: '₦2.8M', pct: 4 },
                  { label: 'Profit', value: '₦5.9M', pct: 9 },
                  { label: 'Contingency', value: '₦3.2M', pct: 4 },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-[var(--sys-corner-sm)] bg-[var(--sys-surface-container)]">
                    <p className="text-[10px] text-[var(--sys-on-surface-variant)]">{item.label}</p>
                    <p className="text-sm font-bold text-[var(--sys-on-surface)]">{item.value}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-[var(--sys-outline)]/30 overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--sys-primary)]" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-[var(--sys-corner-sm)] bg-[var(--sys-primary)]/5 border border-[var(--sys-primary)]/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--sys-on-surface)]">Total Estimated Cost</span>
                <span className="text-lg font-bold text-[var(--sys-primary)]">₦68.1M</span>
              </div>
            </motion.div>
          )}
          {activeTab === 4 && (
            <motion.div key="materials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-xs font-semibold text-[var(--sys-on-surface)] mb-3">Material Schedule</p>
              <div className="space-y-2">
                {[
                  { name: 'Cement (OPC 42.5)', qty: '500 bags', price: '₦2.75M' },
                  { name: 'Sharp Sand', qty: '30 tonnes', price: '₦126K' },
                  { name: 'Granite (¾")', qty: '45 tonnes', price: '₦382.5K' },
                  { name: 'Reinforcement (Y12)', qty: '15 tonnes', price: '₦9.3M' },
                  { name: 'Hollow Blocks (225mm)', qty: '3,400 pcs', price: '₦1.19M' },
                  { name: 'Ceramic Tiles', qty: '260 m²', price: '₦1.09M' },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between p-2.5 rounded-[var(--sys-corner-sm)] bg-[var(--sys-surface-container)]">
                    <div>
                      <p className="text-xs font-medium text-[var(--sys-on-surface)]">{m.name}</p>
                      <p className="text-[10px] text-[var(--sys-on-surface-variant)]">{m.qty}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--sys-on-surface)]">{m.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [demoTab, setDemoTab] = useState(0);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--sys-primary)/0.06_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--sys-primary)]/10 text-xs font-medium text-[var(--sys-primary)] mb-6">
              <Zap className="h-3 w-3" /> AI-Powered Construction Estimation
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Turn architectural drawings into{' '}
              <span className="text-[var(--sys-primary)]">professional BOQs</span>{' '}
              in minutes
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-[var(--sys-on-surface-variant)] font-light max-w-2xl mx-auto leading-relaxed mb-8">
              Upload your PDF drawing. BOQ AI analyses it and generates a structured Bill of Quantities,
              cost estimate, and material schedule — automatically.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" className="shadow-lg w-full sm:w-auto">
                  Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-[var(--sys-on-surface-variant)]">
              Built for quantity surveyors, contractors, architects, and construction professionals.
            </motion.p>
          </motion.div>

          {/* Hero BOQ Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-14 max-w-4xl mx-auto rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] shadow-xl overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-error)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-warning)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--sys-success)]/60" />
              <span className="ml-3 text-xs text-[var(--sys-on-surface-variant)] font-mono">BOQ AI — Sample Output</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--sys-outline)]">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Item</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Description</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Unit</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Rate (₦)</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {BOQ_SAMPLE.map((r) => (
                    <tr key={r.code} className="border-b border-[var(--sys-outline)]/40 hover:bg-[var(--sys-surface-container)]/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[var(--sys-primary)] font-semibold">{r.code}</td>
                      <td className="px-4 py-2.5 text-[var(--sys-on-surface)]">{r.desc}</td>
                      <td className="px-4 py-2.5 text-[var(--sys-on-surface-variant)]">{r.unit}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--sys-on-surface)]">{r.qty.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--sys-on-surface-variant)]">{r.rate.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-[var(--sys-on-surface)]">{r.amt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--sys-surface-container)]">
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold text-[var(--sys-on-surface)]">Total Estimated Cost</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--sys-primary)]">
                      {formatN(BOQ_SAMPLE.reduce((s, r) => s + r.amt, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-4 py-16 sm:py-24 bg-[var(--sys-surface-container)]/40">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">How BOQ AI Works</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Four simple steps from drawing to professional BOQ.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} className="relative p-6 rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] hover:shadow-md hover:border-[var(--sys-primary)]/30 transition-all duration-200">
                <div className="absolute -top-3 -left-1 w-7 h-7 rounded-full bg-[var(--sys-primary)] text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <div className="w-12 h-12 rounded-xl bg-[var(--sys-primary)]/10 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-[var(--sys-primary)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--sys-on-surface)] mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--sys-on-surface-variant)] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg">Try BOQ AI Free <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section className="px-4 py-16 sm:py-24 bg-[var(--sys-surface-container)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">See BOQ AI in Action</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Explore each stage of the workflow — from upload to export.</motion.p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {demoTabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setDemoTab(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${demoTab === i ? 'bg-[var(--sys-primary)] text-white shadow-sm' : 'bg-[var(--sys-surface)] border border-[var(--sys-outline)] text-[var(--sys-on-surface-variant)] hover:border-[var(--sys-primary)]/40'}`}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
          <DemoPreview activeTab={demoTab} />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">What BOQ AI Can Do</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Everything you need to go from architectural drawing to professional construction documentation.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="p-5 rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] hover:shadow-md hover:border-[var(--sys-primary)]/30 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-lg bg-[var(--sys-primary)]/10 flex items-center justify-center mb-3 group-hover:bg-[var(--sys-primary)]/20 transition-colors">
                  <f.icon className="h-5 w-5 text-[var(--sys-primary)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--sys-on-surface)] mb-1">{f.title}</h3>
                <p className="text-xs text-[var(--sys-on-surface-variant)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-10 text-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="outline" size="lg">Explore the Platform <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BOQ PREVIEW ─── */}
      <section className="px-4 py-16 sm:py-24 bg-[var(--sys-surface-container)]/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Professional Output You Can Trust</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Every BOQ is structured with item codes, descriptions, units, quantities, and rates — ready for client submission.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} className="rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--sys-surface-container)] border-b border-[var(--sys-outline)]">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Item</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Description</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Unit</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Rate (₦)</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--sys-on-surface-variant)]">Amount (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {BOQ_SAMPLE.map((r) => (
                    <tr key={r.code} className="border-b border-[var(--sys-outline)]/40 hover:bg-[var(--sys-surface-container)]/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-[var(--sys-primary)] font-semibold">{r.code}</td>
                      <td className="px-4 py-2.5 text-[var(--sys-on-surface)]">{r.desc}</td>
                      <td className="px-4 py-2.5 text-[var(--sys-on-surface-variant)]">{r.unit}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--sys-on-surface)]">{r.qty.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--sys-on-surface-variant)]">{r.rate.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-[var(--sys-on-surface)]">{r.amt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[var(--sys-surface-container)] border-t border-[var(--sys-outline)]">
                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-[var(--sys-on-surface)]">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--sys-primary)]">
                      {formatN(BOQ_SAMPLE.reduce((s, r) => s + r.amt, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
          <div className="mt-8 text-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg">Generate Your First BOQ <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── VALUE / OUTCOMES ─── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Why Construction Professionals Choose BOQ AI</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Practical benefits that save time and improve your estimation workflow.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Reduce Manual Takeoff Time', desc: 'Automate the time-consuming process of extracting quantities from drawings.' },
              { icon: Calculator, title: 'Eliminate Repetitive Calculations', desc: 'Let AI handle quantity takeoffs, rate multiplications, and section subtotals.' },
              { icon: Layers, title: 'Organise Everything in One Place', desc: 'BOQs, cost estimates, material schedules, and reports — all connected to your project.' },
              { icon: FileText, title: 'Generate Documentation Faster', desc: 'Create professional BOQs and reports ready for client submission in minutes.' },
              { icon: Shield, title: 'Consistent Estimation Standards', desc: 'Apply NRM, CESMM, or local standards consistently across all your projects.' },
              { icon: Eye, title: 'Transparent, Reviewable Output', desc: 'Every item is editable. Review, adjust, and finalise before exporting.' },
            ].map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="flex gap-4 p-5 rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)]">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--sys-primary)]/10 flex items-center justify-center">
                  <v.icon className="h-5 w-5 text-[var(--sys-primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--sys-on-surface)] mb-1">{v.title}</h3>
                  <p className="text-xs text-[var(--sys-on-surface-variant)] leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TARGET AUDIENCE ─── */}
      <section className="px-4 py-16 sm:py-24 bg-[var(--sys-surface-container)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Built for Construction Professionals</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto">Whether you're a QS, contractor, architect, or homeowner — BOQ AI fits your workflow.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AUDIENCES.map((a) => (
              <motion.div key={a.title} variants={fadeUp} className="p-6 rounded-[var(--sys-corner-md)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] hover:shadow-md hover:border-[var(--sys-primary)]/30 transition-all duration-200 text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--sys-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <a.icon className="h-6 w-6 text-[var(--sys-primary)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--sys-on-surface)] mb-2">{a.title}</h3>
                <p className="text-xs text-[var(--sys-on-surface-variant)] leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section className="px-4 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Transparent. Professional. Reliable.</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'Fully Reviewable', desc: 'Every generated item is transparent. Review quantities, rates, and calculations before exporting.' },
              { icon: Shield, title: 'Your Data Stays Yours', desc: 'Project data is stored securely. You control what gets exported and shared.' },
              { icon: FileText, title: 'Professional Standards', desc: 'Output follows industry measurement rules. BOQs are structured for client and tender submission.' },
            ].map((t) => (
              <motion.div key={t.title} variants={fadeUp} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--sys-primary)]/10 flex items-center justify-center mx-auto mb-4">
                  <t.icon className="h-6 w-6 text-[var(--sys-primary)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--sys-on-surface)] mb-2">{t.title}</h3>
                <p className="text-xs text-[var(--sys-on-surface-variant)] leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 py-16 sm:py-24 bg-[var(--sys-surface-container)]/30">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="text-center mb-10">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Frequently Asked Questions</motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)]">Quick answers to common questions about BOQ AI.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="space-y-3">
            {FAQS.map((f) => (
              <motion.div key={f.q} variants={fadeUp}>
                <FaqItem q={f.q} a={f.a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Start Your Construction Estimation Workflow
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[var(--sys-on-surface-variant)] max-w-xl mx-auto mb-8">
              Upload your first drawing and see how BOQ AI transforms your quantity takeoff process. Free to get started.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" className="shadow-lg">
                  Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
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
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3">
                {['BOQ Generator', 'Cost Estimation', 'Material Schedules', 'Rate Analysis', 'Templates'].map((l) => (
                  <li key={l}><Link to="/login" className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                {['About', 'Contact', 'Careers', 'Blog'].map((l) => (
                  <li key={l}><button className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200">{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--sys-on-surface)] uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                  <li key={l}><button className="text-sm text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-primary)] transition-colors duration-200">{l}</button></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--sys-outline)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--sys-on-surface-variant)]">&copy; {new Date().getFullYear()} BOQ AI. All rights reserved.</p>
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
