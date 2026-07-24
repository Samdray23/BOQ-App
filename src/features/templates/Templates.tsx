import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, Home, School, Hospital, Route, Building, Plus, X, Layers } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  EmptyState,
} from '@/components/shared';

type Category = 'All' | 'Residential' | 'Commercial' | 'Infrastructure';

interface Template {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'All'>;
  icon: React.ReactNode;
  itemCount: number;
}

interface TemplateItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
}

interface CreateTemplateForm {
  name: string;
  description: string;
  category: Exclude<Category, 'All'>;
  items: TemplateItem[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  Residential: <Home size={24} />,
  Commercial: <Building2 size={24} />,
  Infrastructure: <Route size={24} />,
};

const templates: Template[] = [
  {
    id: 'residential',
    name: 'Residential Building',
    description:
      'Complete BOQ template for standard residential buildings including foundation, superstructure, finishes, and services.',
    category: 'Residential',
    icon: <Home size={24} />,
    itemCount: 48,
  },
  {
    id: 'commercial',
    name: 'Commercial Building',
    description:
      'Comprehensive template for commercial developments with office spaces, retail areas, and parking facilities.',
    category: 'Commercial',
    icon: <Building2 size={24} />,
    itemCount: 72,
  },
  {
    id: 'school',
    name: 'School Project',
    description:
      'Educational facility template covering classrooms, laboratories, administrative blocks, and sports facilities.',
    category: 'Commercial',
    icon: <School size={24} />,
    itemCount: 56,
  },
  {
    id: 'hospital',
    name: 'Hospital',
    description:
      'Healthcare facility BOQ including wards, operating theatres, diagnostic centres, and utility systems.',
    category: 'Commercial',
    icon: <Hospital size={24} />,
    itemCount: 64,
  },
  {
    id: 'road',
    name: 'Road Construction',
    description:
      'Infrastructure template for road projects with earthwork, pavement, drainage, and signage items.',
    category: 'Infrastructure',
    icon: <Route size={24} />,
    itemCount: 38,
  },
  {
    id: 'church',
    name: 'Church Building',
    description:
      'Worship centre template including sanctuary, fellowship hall, offices, and ancillary buildings.',
    category: 'Residential',
    icon: <Building size={24} />,
    itemCount: 42,
  },
];

const categories: Category[] = ['All', 'Residential', 'Commercial', 'Infrastructure'];

const units = ['m²', 'm³', 'm', 'kg', 'tonnes', 'nos', 'lumpsum', 'days'];

function AddItemForm({ onAdd }: { onAdd: (item: Omit<TemplateItem, 'id'>) => void }) {
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('m²');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = () => {
    if (!description.trim() || !quantity) return;
    onAdd({
      description: description.trim(),
      unit,
      quantity: parseFloat(quantity),
    });
    setDescription('');
    setUnit('m²');
    setQuantity('');
  };

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Description
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Item description"
        />
      </div>
      <div className="w-20">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Unit
        </label>
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          options={units.map((u) => ({ value: u, label: u }))}
        />
      </div>
      <div className="w-24">
        <label
          className="mb-1 block text-xs font-medium"
          style={{ color: 'var(--sys-on-surface-variant)' }}
        >
          Quantity
        </label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={!description.trim() || !quantity}>
        <Plus size={14} />
      </Button>
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState<CreateTemplateForm>({
    name: '',
    description: '',
    category: 'Residential',
    items: [],
  });

  const filteredTemplates =
    activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory);

  const handleUseTemplate = (template: Template) => {
    toast.success(`"${template.name}" template applied! Project created successfully.`);
    navigate('/projects');
  };

  const handleCreateTemplate = () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success(`"${form.name}" template created successfully!`);
    setShowCreateDialog(false);
    setForm({ name: '', description: '', category: 'Residential', items: [] });
  };

  const addItem = (item: Omit<TemplateItem, 'id'>) => {
    const newItem: TemplateItem = {
      id: `item-${Date.now()}`,
      ...item,
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--sys-on-surface)' }}>
            Templates
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--sys-on-surface-variant)' }}>
            Pre-built BOQ templates for common construction projects
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} />
          Create Template
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                activeCategory === category ? 'var(--sys-secondary-container)' : 'transparent',
              color:
                activeCategory === category
                  ? 'var(--sys-on-secondary-container)'
                  : 'var(--sys-on-surface-variant)',
            }}
            onMouseEnter={(e) => {
              if (activeCategory !== category)
                e.currentTarget.style.backgroundColor = 'var(--sys-surface-variant)';
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== category)
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={<Layers size={32} />}
          title="No templates found"
          description="Try a different category or create a new template"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="group flex h-full flex-col transition-shadow"
                style={{ borderColor: 'var(--sys-outline-variant)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className="flex size-12 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: 'var(--sys-primary-container)',
                        color: 'var(--sys-primary)',
                      }}
                    >
                      {template.icon}
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Layers size={12} />
                      {template.itemCount} items
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-lg" style={{ color: 'var(--sys-on-surface)' }}>
                    {template.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p
                    className="mb-4 flex-1 text-sm leading-relaxed"
                    style={{ color: 'var(--sys-on-surface-variant)' }}
                  >
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5"
                      style={{
                        borderColor: 'var(--sys-outline)',
                        color: 'var(--sys-on-surface-variant)',
                      }}
                    >
                      {categoryIcons[template.category]}
                      {template.category}
                    </Badge>
                    <Button size="sm" onClick={() => handleUseTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border p-6 shadow-xl"
            style={{
              backgroundColor: 'var(--sys-surface-container-high)',
              borderColor: 'var(--sys-outline-variant)',
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--sys-on-surface)' }}>
                Create Template
              </h2>
              <Button size="icon" variant="ghost" onClick={() => setShowCreateDialog(false)}>
                <X size={18} />
              </Button>
            </div>

            <div className="mb-4">
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--sys-on-surface)' }}
              >
                Template Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Office Complex"
              />
            </div>

            <div className="mb-4">
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--sys-on-surface)' }}
              >
                Description
              </label>
              <Input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the template purpose"
              />
            </div>

            <div className="mb-6">
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--sys-on-surface)' }}
              >
                Category
              </label>
              <Select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as Exclude<Category, 'All'>,
                  }))
                }
                options={[
                  { value: 'Residential', label: 'Residential' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Infrastructure', label: 'Infrastructure' },
                ]}
              />
            </div>

            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--sys-on-surface)' }}>
                  Items
                </label>
                <Badge variant="secondary">{form.items.length} items</Badge>
              </div>

              <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                {form.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    style={{ backgroundColor: 'var(--sys-surface-variant)' }}
                  >
                    <span style={{ color: 'var(--sys-on-surface)' }}>{item.description}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--sys-on-surface-variant)' }}>
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="transition-colors"
                        style={{ color: 'var(--sys-error)' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <AddItemForm onAdd={addItem} />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
