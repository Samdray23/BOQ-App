import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const raw = fs.readFileSync(path.join(rootDir, 'design-tokens.tokens.json'), 'utf-8');
const tokens = JSON.parse(raw);

function getValue(obj) {
  if (!obj || typeof obj !== 'object') return null;
  return obj.value !== undefined ? obj.value : null;
}

function resolveRef(refStr) {
  if (!refStr || !refStr.startsWith('{')) return refStr;
  const parts = refStr.slice(1, -1).split('.');
  let current = tokens;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') {
      const key = Object.keys(current || {}).find(k => k.replace(/\s+/g, ' ') === part.replace(/\s+/g, ' '));
      if (key) { current = current[key]; continue; }
      return null;
    }
    current = current[part];
  }
  return getValue(current) ?? null;
}

function cleanHex(hex) {
  if (!hex || typeof hex !== 'string') return hex;
  return hex.length === 9 && hex.endsWith('ff') ? hex.slice(0, 7) : hex;
}

function kebab(str) {
  return String(str).toLowerCase().replace(/[\s.]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function extractShadeNum(key) {
  const m = String(key).match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function getPaletteGroupFor(keyColorName) {
  const map = {
    'primary color': 'primary',
    'secondary color': 'secondary',
    'tertiary color': 'tertiary',
    'neutal color': 'neutral',
    'variant neutay color': 'neutral variant',
    'accent color': 'accent',
    'error color': 'error color',
    'success color': 'success color',
    'warning color': 'warning color',
  };
  return map[keyColorName] ?? null;
}

function parsePaletteRef(ref) {
  if (!ref || !ref.startsWith('{')) return null;
  const parts = ref.slice(1, -1).split('.');
  if (parts[0] !== 'premitive color collection' || parts[1] !== 'color pallets') return null;
  const groupKey = parts[2];
  const shadeKey = parts[3];
  const group = tokens['premitive color collection']?.['color pallets']?.[groupKey];
  if (!group) return null;
  const matchKey = Object.keys(group).find(k => k.replace(/\s+/g, ' ') === shadeKey.replace(/\s+/g, ' '));
  if (!matchKey) return null;
  const shadeNum = extractShadeNum(matchKey);
  if (shadeNum === null) return null;
  return {
    hex: cleanHex(getValue(group[matchKey])),
    group: groupKey,
    shadeKey: matchKey,
    shadeNum,
  };
}

const primitives = tokens['premitive color collection'];
const keyColorsGroup = primitives?.['key colors group'];
const palettes = primitives?.['color pallets'];
const colorRoles = tokens['color role collection'];
const typography = tokens['typography'];

// Build palette lookup: groupId -> { shadeNum -> hex }
const paletteLookup = {};
if (palettes) {
  for (const [groupName, group] of Object.entries(palettes)) {
    paletteLookup[groupName] = {};
    for (const [shadeKey, shadeObj] of Object.entries(group)) {
      const num = extractShadeNum(shadeKey);
      if (num !== null) paletteLookup[groupName][num] = cleanHex(getValue(shadeObj));
    }
  }
}

const hexToShade = {};
if (palettes) {
  for (const [groupName, group] of Object.entries(palettes)) {
    hexToShade[groupName] = {};
    for (const [shadeKey, shadeObj] of Object.entries(group)) {
      const val = cleanHex(getValue(shadeObj));
      const num = extractShadeNum(shadeKey);
      if (val && num !== null) hexToShade[groupName][val] = num;
    }
  }
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2), 16), g: parseInt(h.slice(2,4), 16), b: parseInt(h.slice(4,6), 16) };
}
function colorDist(a, b) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return Math.abs(ca.r-cb.r) + Math.abs(ca.g-cb.g) + Math.abs(ca.b-cb.b);
}

function findShadeInPalette(groupName, hexColor) {
  const exact = hexToShade[groupName]?.[hexColor];
  if (exact !== undefined) return exact;
  let best = null, bestDist = Infinity;
  for (const [hex, shade] of Object.entries(hexToShade[groupName] || {})) {
    const d = colorDist(hexColor, hex);
    if (d < bestDist) { bestDist = d; best = shade; }
  }
  return best;
}

function getPaletteColor(groupName, shadeNum) {
  return paletteLookup[groupName]?.[shadeNum] ?? null;
}

const closestShade = (num) => {
  const options = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
  return options.reduce((best, curr) =>
    Math.abs(curr - num) < Math.abs(best - num) ? curr : best
  );
};

// ─── Collect role variables from color role collection ────────────
function flattenTokenTree(obj, path = '') {
  let entries = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (value && typeof value === 'object') {
      if (value.type === 'color' || value.value !== undefined) {
        entries.push({ path: currentPath, obj: value });
      } else {
        entries.push(...flattenTokenTree(value, currentPath));
      }
    }
  }
  return entries;
}

const flatRoles = flattenTokenTree(colorRoles);
const roleVars = [];
for (const { path, obj } of flatRoles) {
  const ref = typeof obj.value === 'string' ? obj.value : null;
  let val = ref ? cleanHex(resolveRef(ref)) : null;
  if (!val && ref) val = cleanHex(ref);
  if (val) {
    roleVars.push({ path, varName: `--${kebab(path)}`, val, ref });
  }
}

// ─── Typography flattening ────────────────────────────────────────
function flattenTypography(node, basePrefix = '') {
  let lines = [];
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object') {
      const val = value.value ?? value;
      const isProperty = value.type !== undefined;
      if (isProperty && val !== undefined && val !== null && typeof val !== 'object' && !Array.isArray(val)) {
        let cssVal = val;
        if (['fontSize','lineHeight','letterSpacing','paragraphIndent','paragraphSpacing'].includes(key)) {
          cssVal = typeof val === 'number' ? `${val}px` : val;
        }
        lines.push(`    --${kebab(basePrefix)}-${kebab(key)}: ${cssVal};`);
      } else if (!isProperty && val !== null && typeof val === 'object') {
        lines.push(...flattenTypography(value, basePrefix ? `${basePrefix} ${key}` : key));
      }
    }
  }
  return lines;
}

const typographyLines = flattenTypography(typography);

// ─── Semantic alias helpers ───────────────────────────────────────
// Map color-role variable names to shorter --sys-* aliases
const roleAliasMap = {
  'primary-roles-primary-role':            'sys-primary',
  'primary-roles-on-primary-role':          'sys-on-primary',
  'primary-roles-primary-countiner':        'sys-primary-container',
  'primary-roles-on-primary-countainer':    'sys-on-primary-container',
  'secondary-roles-secondary':              'sys-secondary',
  'secondary-roles-on-secondary':           'sys-on-secondary',
  'secondary-roles-secondary-countainer':   'sys-secondary-container',
  'secondary-roles-on-secondary-coutainer': 'sys-on-secondary-container',
  'tertiary-roles-tertiary':                'sys-tertiary',
  'tertiary-roles-on-tertiary':             'sys-on-tertiary',
  'tertiary-roles-tertiary-countainer':     'sys-tertiary-container',
  'tertiary-roles-on-tertiary-countainer':  'sys-on-tertiary-container',
  'neutral-roles-neutral':                  'sys-surface',
  'neutral-roles-on-neutral':               'sys-on-surface',
  'neutral-roles-neutal-countainer':        'sys-surface-variant',
  'neutral-roles-on-neutral-countainer':    'sys-on-surface-variant',
  'accent-roles-accent':                    'sys-accent',
  'accent-roles-on-accent':                 'sys-on-accent',
  'accent-roles-accent-countainer':         'sys-accent-container',
  'accent-roles-on-accent-countainer':      'sys-on-accent-container',
  'errorl-color-roles-error-color':         'sys-error',
  'errorl-color-roles-on-error-color':      'sys-on-error',
  'errorl-color-roles-error-container':     'sys-error-container',
  'errorl-color-roles-on-error-countainer': 'sys-on-error-container',
  'success-color':                          'sys-success',
  'on-success-color':                       'sys-on-success',
  'success-color-countainer':               'sys-success-container',
};

// ─── BUILD CSS ────────────────────────────────────────────────────
let css = '';

// ═══════════════════ :root (Light Mode) ═══════════════════════════════
css += ':root {\n';

// 1. System key colors (--sys-*-color)
if (keyColorsGroup) {
  css += '    /* ── Key Colors ── */\n';
  for (const [key, obj] of Object.entries(keyColorsGroup)) {
    const val = cleanHex(getValue(obj));
    if (val) css += `    --sys-${kebab(key)}: ${val};\n`;
  }
}

// 2. Primitive palette colors (--color-{group}-{shade})
css += '\n    /* ── Color Palettes ── */\n';
if (palettes) {
  for (const [groupName, group] of Object.entries(palettes)) {
    for (const [shadeKey, shadeObj] of Object.entries(group)) {
      const val = cleanHex(getValue(shadeObj));
      const num = extractShadeNum(shadeKey);
      const suffix = num !== null ? num : kebab(shadeKey);
      if (val) css += `    --color-${kebab(groupName)}-${suffix}: ${val};\n`;
    }
  }
}

// 3. Color roles
css += '\n    /* ── Color Roles ── */\n';
for (const { varName, val } of roleVars) {
  css += `    ${varName}: ${val};\n`;
}

// 4. Semantic aliases (--sys-* short forms)
css += '\n    /* ── Semantic Shorthands (aliases) ── */\n';
const aliasSet = {};
for (const { varName, val } of roleVars) {
  const cleanName = varName.replace(/^--/, '');
  if (roleAliasMap[cleanName]) {
    aliasSet[roleAliasMap[cleanName]] = val;
  }
}
// Also add key-color aliases (--sys-primary = --sys-primary-color)
if (keyColorsGroup) {
  for (const [key, obj] of Object.entries(keyColorsGroup)) {
    const shortName = kebab(key).replace(/-color$/, '');
    const val = cleanHex(getValue(obj));
    if (val && shortName !== kebab(key)) {
      aliasSet[`sys-${shortName}`] = `var(--sys-${kebab(key)})`;
    }
  }
}
// Override with direct palette refs for better dark mode accuracy
for (const { varName, val } of roleVars) {
  const cleanName = varName.replace(/^--/, '');
  if (roleAliasMap[cleanName] && roleAliasMap[cleanName].startsWith('sys-')) {
    aliasSet[roleAliasMap[cleanName]] = `var(${varName})`;
  }
}
for (const [alias, value] of Object.entries(aliasSet)) {
  css += `    --${alias}: ${value};\n`;
}

// Extra container/outline tokens not in color roles
css += '\n    /* ── Container & Outline ── */\n';
css += '    --sys-outline: #cbcace;\n';
css += '    --sys-surface-container: #f2f2f3;\n';
css += '    --sys-surface-container-high: #e5e5e6;\n';

// Add corner tokens
css += '\n    /* ── Corners ── */\n';
css += '    --sys-corner-sm: 6px;\n';

// 5. Typography
css += '\n    /* ── Typography ── */\n';
for (const line of typographyLines) {
  css += line + '\n';
}

css += '  }\n';

// ═══════════════════ .dark (Dark Mode) ════════════════════════════════
css += '\n  .dark {\n';

// Dark system key colors
css += '    /* ── Key Colors ── */\n';
if (keyColorsGroup && palettes) {
  for (const [key, obj] of Object.entries(keyColorsGroup)) {
    const originalVal = cleanHex(getValue(obj));
    if (!originalVal) continue;
    const alias = getPaletteGroupFor(key);
    if (!alias || !paletteLookup[alias]) continue;
    const baseShade = findShadeInPalette(alias, originalVal);
    if (baseShade === null) continue;
    const darkShade = closestShade(Math.min(100, baseShade + 30));
    const darkVal = getPaletteColor(alias, darkShade);
    if (darkVal) css += `    --sys-${kebab(key)}: ${darkVal};\n`;
  }
}

// Dark color roles
css += '\n    /* ── Color Roles ── */\n';
for (const { varName, val, ref } of roleVars) {
  if (!ref || !ref.startsWith('{')) {
    css += `    ${varName}: ${val};\n`;
    continue;
  }
  const refVal = resolveRef(ref);
  if (!refVal) continue;

  const palRef = parsePaletteRef(ref);
  if (palRef) {
    const inverted = closestShade(Math.min(100, Math.max(0, 100 - palRef.shadeNum)));
    if (inverted === palRef.shadeNum) {
      css += `    ${varName}: ${val};\n`;
      continue;
    }
    const invertedHex = getPaletteColor(palRef.group, inverted);
    if (invertedHex) {
      css += `    ${varName}: ${invertedHex};\n`;
    } else {
      css += `    ${varName}: ${val};\n`;
    }
    continue;
  }

  const refParts = ref.slice(1, -1).split('.');
  if (refParts[0] === 'premitive color collection' && refParts[1] === 'key colors group') {
    const keyColorName = refParts[2];
    const alias = getPaletteGroupFor(keyColorName);
    if (alias && paletteLookup[alias]) {
      const baseShade = findShadeInPalette(alias, cleanHex(refVal));
      if (baseShade !== null) {
        const darkShade = closestShade(Math.min(100, baseShade + 30));
        const darkVal = getPaletteColor(alias, darkShade);
        if (darkVal) { css += `    ${varName}: ${darkVal};\n`; continue; }
      }
    }
    css += `    ${varName}: ${val};\n`;
    continue;
  }

  css += `    ${varName}: ${val};\n`;
}

// Dark semantic aliases (--sys-* short forms)
css += '\n    /* ── Semantic Shorthands (aliases) ── */\n';
const darkAliasSet = {};
for (const { varName, val } of roleVars) {
  const cleanName = varName.replace(/^--/, '');
  if (roleAliasMap[cleanName]) {
    darkAliasSet[roleAliasMap[cleanName]] = val;
  }
}
// Key-color aliases in dark mode
if (keyColorsGroup && palettes) {
  for (const [key, obj] of Object.entries(keyColorsGroup)) {
    const shortName = kebab(key).replace(/-color$/, '');
    if (shortName !== kebab(key)) {
      darkAliasSet[`sys-${shortName}`] = `var(--sys-${kebab(key)})`;
    }
  }
}
for (const { varName, val } of roleVars) {
  const cleanName = varName.replace(/^--/, '');
  if (roleAliasMap[cleanName] && roleAliasMap[cleanName].startsWith('sys-')) {
    darkAliasSet[roleAliasMap[cleanName]] = `var(${varName})`;
  }
}
for (const [alias, value] of Object.entries(darkAliasSet)) {
  css += `    --${alias}: ${value};\n`;
}

// Extra container/outline tokens in dark mode
css += '\n    /* ── Container & Outline ── */\n';
css += '    --sys-outline: #4b4a4f;\n';
css += '    --sys-surface-container: #323135;\n';
css += '    --sys-surface-container-high: #4b4a4f;\n';

// Corner tokens (same in dark mode)
css += '\n    /* ── Corners ── */\n';
css += '    --sys-corner-sm: 6px;\n';

css += '}\n';

// ─── Write output ─────────────────────────────────────────────────
const outputPath = path.join(rootDir, 'src', 'tokens.css');
fs.writeFileSync(outputPath, css, 'utf-8');
console.log(`Generated: ${outputPath}`);
console.log('Done.');
