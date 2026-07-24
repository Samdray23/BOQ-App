import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, Button, EmptyState } from '@/components/shared';
import { Plus, ChevronDown, ChevronRight, Save, Download, Trash2, Calculator } from 'lucide-react';

interface MaterialCost {
  description: string;
  rate: number;
  quantity: number;
}

interface LabourGang {
  role: string;
  count: number;
  rate: number;
}

interface EquipmentCost {
  description: string;
  hours: number;
  rate: number;
}

interface RateItem {
  id: string;
  itemDescription: string;
  unit: string;
  materials: MaterialCost[];
  labour: LabourGang[];
  equipment: EquipmentCost[];
  profitMargin: number;
}

function createRateItem(description: string, unit: string): RateItem {
  return {
    id: crypto.randomUUID(),
    itemDescription: description,
    unit,
    materials: [{ description: '', rate: 0, quantity: 1 }],
    labour: [
      { role: 'Foreman', count: 1, rate: 5000 },
      { role: 'Craftsmen', count: 3, rate: 3500 },
      { role: 'Labourers', count: 5, rate: 2500 },
    ],
    equipment: [{ description: '', hours: 1, rate: 0 }],
    profitMargin: 15,
  };
}

const initialRateItems: RateItem[] = [
  {
    id: 'ra1',
    itemDescription: 'Concrete (1:2:4) - Grade C25',
    unit: 'm³',
    materials: [
      { description: 'Cement (OPC) 50kg bags', rate: 5500, quantity: 8 },
      { description: 'Sharp Sand', rate: 4200, quantity: 0.5 },
      { description: 'Granite (¾")', rate: 8500, quantity: 0.9 },
      { description: 'Water', rate: 500, quantity: 0.15 },
    ],
    labour: [
      { role: 'Foreman', count: 1, rate: 5000 },
      { role: 'Craftsmen', count: 3, rate: 3500 },
      { role: 'Labourers', count: 6, rate: 2500 },
    ],
    equipment: [
      { description: 'Concrete Mixer (1 bag)', hours: 2, rate: 8000 },
      { description: 'Vibrator', hours: 1.5, rate: 3000 },
    ],
    profitMargin: 15,
  },
  {
    id: 'ra2',
    itemDescription: 'Blockwork (225mm Hollow Blocks)',
    unit: 'm²',
    materials: [
      { description: 'Hollow Blocks (225mm)', rate: 350, quantity: 12.5 },
      { description: 'Cement Mortar (1:4)', rate: 5500, quantity: 0.3 },
    ],
    labour: [
      { role: 'Foreman', count: 1, rate: 5000 },
      { role: 'Craftsmen', count: 2, rate: 3500 },
      { role: 'Labourers', count: 3, rate: 2500 },
    ],
    equipment: [],
    profitMargin: 15,
  },
  {
    id: 'ra3',
    itemDescription: 'Internal Plastering (12mm thick)',
    unit: 'm²',
    materials: [{ description: 'Cement Mortar (1:4)', rate: 5500, quantity: 0.15 }],
    labour: [
      { role: 'Foreman', count: 1, rate: 5000 },
      { role: 'Craftsmen', count: 2, rate: 3500 },
      { role: 'Labourers', count: 2, rate: 2500 },
    ],
    equipment: [],
    profitMargin: 12,
  },
  {
    id: 'ra4',
    itemDescription: 'Ceramic Floor Tiling (600×600mm)',
    unit: 'm²',
    materials: [
      { description: 'Ceramic Tiles (600×600mm)', rate: 4200, quantity: 1.08 },
      { description: 'Cement Sand Screed', rate: 5500, quantity: 0.1 },
      { description: 'Tile Adhesive (25kg)', rate: 3200, quantity: 0.3 },
      { description: 'Grout', rate: 1800, quantity: 0.1 },
    ],
    labour: [
      { role: 'Foreman', count: 1, rate: 5000 },
      { role: 'Craftsmen', count: 2, rate: 3500 },
      { role: 'Labourers', count: 2, rate: 2500 },
    ],
    equipment: [{ description: 'Tile Cutter', hours: 2, rate: 1500 }],
    profitMargin: 15,
  },
];

function calcMaterialTotal(m: MaterialCost) {
  return m.rate * m.quantity;
}

function calcLabourTotal(l: LabourGang) {
  return l.count * l.rate;
}

function calcEquipmentTotal(e: EquipmentCost) {
  return e.hours * e.rate;
}

function calcItemRate(item: RateItem): number {
  const materialCost = item.materials.reduce((s, m) => s + calcMaterialTotal(m), 0);
  const labourCost = item.labour.reduce((s, l) => s + calcLabourTotal(l), 0);
  const equipmentCost = item.equipment.reduce((s, e) => s + calcEquipmentTotal(e), 0);
  return materialCost + labourCost + equipmentCost;
}

function formatNgn(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RateAnalysis() {
  const [items, setItems] = useState<RateItem[]>(initialRateItems);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const addItem = () => {
    const newItem = createRateItem('New Work Item', 'm²');
    setItems((prev) => [...prev, newItem]);
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateItem = (id: string, data: Partial<RateItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  };

  const updateMaterial = (itemId: string, idx: number, data: Partial<MaterialCost>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, materials: i.materials.map((m, j) => (j === idx ? { ...m, ...data } : m)) }
          : i
      )
    );
  };

  const updateLabour = (itemId: string, idx: number, data: Partial<LabourGang>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, labour: i.labour.map((l, j) => (j === idx ? { ...l, ...data } : l)) }
          : i
      )
    );
  };

  const updateEquipment = (itemId: string, idx: number, data: Partial<EquipmentCost>) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, equipment: i.equipment.map((e, j) => (j === idx ? { ...e, ...data } : e)) }
          : i
      )
    );
  };

  const addMaterial = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, materials: [...i.materials, { description: '', rate: 0, quantity: 1 }] }
          : i
      )
    );
  };

  const addEquipment = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, equipment: [...i.equipment, { description: '', hours: 1, rate: 0 }] }
          : i
      )
    );
  };

  const removeMaterial = (itemId: string, idx: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, materials: i.materials.filter((_, j) => j !== idx) } : i
      )
    );
  };

  const removeEquipment = (itemId: string, idx: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, equipment: i.equipment.filter((_, j) => j !== idx) } : i
      )
    );
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--sys-on-surface)]">Rate Analysis</h1>
          <p className="text-sm text-[var(--sys-on-surface-variant)]">
            Build up unit rates for construction work items
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => toast.success('Rate analysis saved to library (demo)')}
          >
            <Save className="size-4" />
            Save to Library
          </Button>
          <Button variant="outline" onClick={() => toast.success('Rate analysis exported (demo)')}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<Calculator className="size-12" />}
              title="No rate items"
              description="Add rate analysis items to build up unit rates."
              action={<Button onClick={addItem}>Add Rate Item</Button>}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {items.map((item, i) => {
              const baseRate = calcItemRate(item);
              const finalRate = baseRate * (1 + item.profitMargin / 100);
              const isExpanded = expandedId === item.id;
              const materialCost = item.materials.reduce((s, m) => s + calcMaterialTotal(m), 0);
              const labourCost = item.labour.reduce((s, l) => s + calcLabourTotal(l), 0);
              const equipmentCost = item.equipment.reduce((s, e) => s + calcEquipmentTotal(e), 0);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card padding="none">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[var(--sys-surface-container)]/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-[var(--sys-on-surface-variant)] shrink-0" />
                        ) : (
                          <ChevronRight className="size-4 text-[var(--sys-on-surface-variant)] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--sys-on-surface)] truncate">
                            {item.itemDescription}
                          </p>
                          <p className="text-xs text-[var(--sys-on-surface-variant)]">
                            Per {item.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-[var(--sys-on-surface-variant)]">Rate</p>
                          <p className="font-semibold text-[var(--sys-primary)]">
                            {formatNgn(baseRate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--sys-on-surface-variant)]">
                            Final ({item.profitMargin}% margin)
                          </p>
                          <p className="font-semibold text-[var(--sys-on-surface)]">
                            {formatNgn(finalRate)}
                          </p>
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-[var(--sys-outline)]"
                        >
                          <div className="p-4 space-y-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-medium text-[var(--sys-on-surface-variant)]">
                                  Item Description
                                </label>
                                <input
                                  value={item.itemDescription}
                                  onChange={(e) =>
                                    updateItem(item.id, { itemDescription: e.target.value })
                                  }
                                  className="flex h-9 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-3 py-1.5 text-sm text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                />
                              </div>
                              <div className="w-24 space-y-1.5">
                                <label className="text-xs font-medium text-[var(--sys-on-surface-variant)]">
                                  Unit
                                </label>
                                <select
                                  value={item.unit}
                                  onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                                  className="flex h-9 w-full rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-sm text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                >
                                  {['m³', 'm²', 'm', 'nr', 'kg', 'tonnes', 'L.S'].map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="mt-6 text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-error)] transition-colors p-1"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-[var(--sys-on-surface)]">
                                    Material Cost
                                  </h4>
                                  <span className="text-xs font-medium text-[var(--sys-primary)]">
                                    {formatNgn(materialCost)}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {item.materials.map((mat, mi) => (
                                    <div key={mi} className="flex items-center gap-2">
                                      <input
                                        value={mat.description}
                                        onChange={(e) =>
                                          updateMaterial(item.id, mi, {
                                            description: e.target.value,
                                          })
                                        }
                                        placeholder="Material"
                                        className="flex-1 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                      />
                                      <input
                                        type="number"
                                        value={mat.rate || ''}
                                        onChange={(e) =>
                                          updateMaterial(item.id, mi, {
                                            rate: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        placeholder="Rate"
                                        className="w-20 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-right text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        step="0.01"
                                        min="0"
                                      />
                                      <span className="text-xs text-[var(--sys-on-surface-variant)]">
                                        ×
                                      </span>
                                      <input
                                        type="number"
                                        value={mat.quantity || ''}
                                        onChange={(e) =>
                                          updateMaterial(item.id, mi, {
                                            quantity: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        placeholder="Qty"
                                        className="w-16 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-right text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        step="0.01"
                                        min="0"
                                      />
                                      <span className="text-xs font-medium text-[var(--sys-on-surface)] w-16 text-right">
                                        {formatNgn(calcMaterialTotal(mat))}
                                      </span>
                                      {item.materials.length > 1 && (
                                        <button
                                          onClick={() => removeMaterial(item.id, mi)}
                                          className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-error)] transition-colors"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addMaterial(item.id)}
                                  >
                                    <Plus className="size-3" />
                                    Add Material
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-[var(--sys-on-surface)]">
                                    Labour Cost
                                  </h4>
                                  <span className="text-xs font-medium text-[var(--sys-primary)]">
                                    {formatNgn(labourCost)}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {item.labour.map((lab, li) => (
                                    <div key={li} className="flex items-center gap-2">
                                      <span className="w-20 text-xs text-[var(--sys-on-surface)]">
                                        {lab.role}
                                      </span>
                                      <input
                                        type="number"
                                        value={lab.count || ''}
                                        onChange={(e) =>
                                          updateLabour(item.id, li, {
                                            count: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-14 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-center text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        min="0"
                                      />
                                      <span className="text-xs text-[var(--sys-on-surface-variant)]">
                                        ×
                                      </span>
                                      <input
                                        type="number"
                                        value={lab.rate || ''}
                                        onChange={(e) =>
                                          updateLabour(item.id, li, {
                                            rate: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-20 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-right text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        step="0.01"
                                        min="0"
                                      />
                                      <span className="text-xs font-medium text-[var(--sys-on-surface)] w-16 text-right">
                                        {formatNgn(calcLabourTotal(lab))}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-[var(--sys-on-surface)]">
                                    Equipment Cost
                                  </h4>
                                  <span className="text-xs font-medium text-[var(--sys-primary)]">
                                    {formatNgn(equipmentCost)}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {item.equipment.map((eq, ei) => (
                                    <div key={ei} className="flex items-center gap-2">
                                      <input
                                        value={eq.description}
                                        onChange={(e) =>
                                          updateEquipment(item.id, ei, {
                                            description: e.target.value,
                                          })
                                        }
                                        placeholder="Equipment"
                                        className="flex-1 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-[var(--sys-on-surface)] placeholder:text-[var(--sys-on-surface-variant)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                      />
                                      <input
                                        type="number"
                                        value={eq.hours || ''}
                                        onChange={(e) =>
                                          updateEquipment(item.id, ei, {
                                            hours: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-14 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-center text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        min="0"
                                      />
                                      <span className="text-xs text-[var(--sys-on-surface-variant)]">
                                        hrs ×
                                      </span>
                                      <input
                                        type="number"
                                        value={eq.rate || ''}
                                        onChange={(e) =>
                                          updateEquipment(item.id, ei, {
                                            rate: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        className="w-20 h-8 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1 text-xs text-right text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                        step="0.01"
                                        min="0"
                                      />
                                      <span className="text-xs font-medium text-[var(--sys-on-surface)] w-16 text-right">
                                        {formatNgn(calcEquipmentTotal(eq))}
                                      </span>
                                      {item.equipment.length > 1 && (
                                        <button
                                          onClick={() => removeEquipment(item.id, ei)}
                                          className="text-[var(--sys-on-surface-variant)] hover:text-[var(--sys-error)] transition-colors"
                                        >
                                          <Trash2 className="size-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addEquipment(item.id)}
                                  >
                                    <Plus className="size-3" />
                                    Add Equipment
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[var(--sys-outline)]">
                              <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-[var(--sys-on-surface-variant)]">
                                    Profit Margin (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={item.profitMargin}
                                    onChange={(e) =>
                                      updateItem(item.id, {
                                        profitMargin: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-20 h-9 rounded-[var(--sys-corner-sm)] border border-[var(--sys-outline)] bg-[var(--sys-surface)] px-2 py-1.5 text-sm text-center text-[var(--sys-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sys-primary)]/50 transition-colors"
                                    step="0.5"
                                    min="0"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-xs text-[var(--sys-on-surface-variant)]">
                                    Base Rate / {item.unit}
                                  </p>
                                  <p className="text-lg font-semibold text-[var(--sys-on-surface)]">
                                    {formatNgn(baseRate)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-[var(--sys-on-surface-variant)]">
                                    Final Rate / {item.unit}
                                  </p>
                                  <p className="text-lg font-bold text-[var(--sys-primary)]">
                                    {formatNgn(finalRate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}

            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={addItem}>
                <Plus className="size-4" />
                Add Rate Item
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
