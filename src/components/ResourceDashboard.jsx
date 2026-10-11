import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAR_SYSTEMS, RESOURCE_LABELS, STATUS_META } from '../data/starSystems';

// ─── Gauge Meter ──────────────────────────────────────────────────────────────
function GaugeMeter({ value, max = 100, color, label, unit }) {
  const pct = Math.min(100, (value / max) * 100);
  const segments = 20;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Radial-style gauge using CSS */}
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)"
            strokeWidth="6" strokeDasharray="163" strokeDashoffset="40" />
          {/* Value arc */}
          <motion.circle
            cx="32" cy="32" r="26"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray="163"
            initial={{ strokeDashoffset: 163 }}
            animate={{ strokeDashoffset: 163 - (163 * pct) / 100 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-orbitron text-xs font-bold" style={{ color }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <div className="text-xs font-mono-tech text-gray-400 text-center leading-tight">{label}</div>
      <div className="text-xs font-mono-tech text-gray-600">{value} {unit}</div>
    </div>
  );
}

// ─── Bar Resource Row ─────────────────────────────────────────────────────────
function ResourceBar({ label, value, max = 100, color, unit, editable, onChange }) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const pct = Math.min(100, (value / max) * 100);

  const handleSave = () => {
    const v = Math.max(0, Math.min(100, parseInt(inputVal) || 0));
    onChange(v);
    setEditing(false);
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          <span className="text-xs font-mono-tech text-gray-300">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number" min="0" max="100"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-14 text-xs font-mono-tech bg-black/60 border border-cyan-500/40 rounded px-1 py-0.5 text-cyan-300 focus:outline-none focus:border-cyan-400"
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                autoFocus
              />
              <button onClick={handleSave}
                className="text-xs text-green-400 hover:text-green-300 font-mono-tech">✓</button>
              <button onClick={() => setEditing(false)}
                className="text-xs text-red-400 hover:text-red-300 font-mono-tech">✕</button>
            </div>
          ) : (
            <>
              <span className="text-xs font-mono-tech" style={{ color }}>{value} {unit}</span>
              {editable && (
                <button
                  onClick={() => { setInputVal(value); setEditing(true); }}
                  className="text-xs text-gray-600 hover:text-cyan-400 transition-colors font-mono-tech"
                >
                  ✎
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}70, ${color})`,
            boxShadow: `0 0 8px ${color}50` }}
        >
          {/* Shimmer */}
          <div className="absolute inset-y-0 right-0 w-4 bg-white/20 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}

// ─── System row in table ──────────────────────────────────────────────────────
function SystemRow({ system, isSelected, onSelect, resourceData, onResourceChange }) {
  const meta = STATUS_META[system.status];

  return (
    <>
      <motion.tr
        layout
        className="border-b border-gray-900/60 cursor-pointer hover:bg-cyan-950/20 transition-colors"
        onClick={() => onSelect(system.id)}
        style={{ borderLeft: isSelected ? `2px solid #00f3ff` : '2px solid transparent' }}
      >
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: system.color, boxShadow: `0 0 6px ${system.color}` }} />
            <div>
              <div className="text-xs font-orbitron text-gray-200">{system.name}</div>
              <div className="text-xs text-gray-600 font-mono-tech">{system.sector}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-2 text-xs font-mono-tech text-gray-400">{system.type}</td>
        <td className="px-3 py-2">
          <span className="text-xs font-mono-tech" style={{ color: meta.color }}>
            {system.status}
          </span>
        </td>
        {Object.keys(RESOURCE_LABELS).map(key => (
          <td key={key} className="px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${resourceData[key] ?? system.resources[key]}%`,
                    background: RESOURCE_LABELS[key].color,
                  }}
                />
              </div>
              <span className="text-xs font-mono-tech" style={{ color: RESOURCE_LABELS[key].color }}>
                {resourceData[key] ?? system.resources[key]}%
              </span>
            </div>
          </td>
        ))}
        <td className="px-3 py-2">
          <span className="text-xs font-mono-tech text-gray-500">{system.discovered}</span>
        </td>
      </motion.tr>

      {/* Expanded resource editor */}
      <AnimatePresence>
        {isSelected && (
          <motion.tr
            key={`exp-${system.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <td colSpan={7} className="px-4 pb-4 bg-black/30">
              <div className="pt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                <div>
                  <div className="text-xs font-orbitron text-cyan-400 mb-3">RESOURCE ALLOCATION EDITOR</div>
                  {Object.keys(RESOURCE_LABELS).map(key => {
                    const meta = RESOURCE_LABELS[key];
                    return (
                      <ResourceBar
                        key={key}
                        label={meta.label}
                        value={resourceData[key] ?? system.resources[key]}
                        color={meta.color}
                        unit={meta.unit}
                        editable={true}
                        onChange={v => onResourceChange(system.id, key, v)}
                      />
                    );
                  })}
                </div>
                <div>
                  <div className="text-xs font-orbitron text-purple-400 mb-3">RESOURCE METERS</div>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.keys(RESOURCE_LABELS).map(key => {
                      const meta = RESOURCE_LABELS[key];
                      return (
                        <GaugeMeter
                          key={key}
                          label={meta.label}
                          value={resourceData[key] ?? system.resources[key]}
                          color={meta.color}
                          unit={meta.unit}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main ResourceDashboard ───────────────────────────────────────────────────
const SORT_FIELDS = ['name', 'type', 'status', 'energonite', 'voidCrystal', 'darkMatter', 'biomass'];

export default function ResourceDashboard() {
  const [selectedId, setSelectedId] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  // Local resource overrides: { [systemId]: { [resource]: value } }
  const [overrides, setOverrides] = useState({});

  const handleSelect = useCallback((id) => {
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  const handleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      return field;
    });
  }, []);

  const handleResourceChange = useCallback((sysId, key, val) => {
    setOverrides(prev => ({
      ...prev,
      [sysId]: { ...(prev[sysId] || {}), [key]: val },
    }));
  }, []);

  const resourceData = useCallback((sysId) => {
    const base = STAR_SYSTEMS.find(s => s.id === sysId)?.resources || {};
    return { ...base, ...(overrides[sysId] || {}) };
  }, [overrides]);

  const statuses = useMemo(() => ['ALL', ...new Set(STAR_SYSTEMS.map(s => s.status))], []);

  const filtered = useMemo(() => {
    let data = [...STAR_SYSTEMS];
    if (filterStatus !== 'ALL') data = data.filter(s => s.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      let va, vb;
      if (RESOURCE_LABELS[sortField]) {
        va = (overrides[a.id]?.[sortField] ?? a.resources[sortField]) || 0;
        vb = (overrides[b.id]?.[sortField] ?? b.resources[sortField]) || 0;
      } else {
        va = a[sortField] || '';
        vb = b[sortField] || '';
      }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return data;
  }, [filterStatus, search, sortField, sortDir, overrides]);

  // Aggregate totals
  const totals = useMemo(() => {
    const t = {};
    Object.keys(RESOURCE_LABELS).forEach(key => {
      const sum = filtered.reduce((acc, s) => acc + (overrides[s.id]?.[key] ?? s.resources[key]), 0);
      t[key] = Math.round(sum / filtered.length);
    });
    return t;
  }, [filtered, overrides]);

  return (
    <div className="flex flex-col h-full glass-panel border-cyan overflow-hidden" id="resource-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-900/30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-orbitron text-xs font-bold text-cyan-400">
            ⬡ RESOURCE DATABASE
          </span>
          <span className="neon-badge">{filtered.length} SYSTEMS</span>
        </div>
        {/* Search */}
        <input
          id="resource-search"
          type="text"
          placeholder="SEARCH SYSTEMS..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-xs font-mono-tech bg-black/40 border border-gray-700 rounded px-3 py-1 text-gray-300 focus:outline-none focus:border-cyan-500/60 w-44 placeholder-gray-700"
        />
      </div>

      {/* Status filter + aggregate meters */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-900/40 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          {statuses.map(s => {
            const meta = STATUS_META[s];
            return (
              <button
                key={s}
                id={`status-filter-${s.toLowerCase()}`}
                onClick={() => setFilterStatus(s)}
                className="text-xs font-mono-tech px-2 py-0.5 rounded transition-all"
                style={{
                  background: filterStatus === s ? `${meta?.color || '#8888aa'}20` : 'transparent',
                  border: `1px solid ${filterStatus === s ? (meta?.color || '#8888aa') : 'rgba(255,255,255,0.1)'}`,
                  color: filterStatus === s ? (meta?.color || '#8888aa') : '#555',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Avg resource indicators */}
        <div className="flex items-center gap-3 ml-auto">
          {Object.entries(RESOURCE_LABELS).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-xs font-mono-tech text-gray-500">AVG</span>
              <span className="text-xs font-mono-tech" style={{ color: meta.color }}>
                {totals[key]}%
              </span>
              <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${totals[key]}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: meta.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 bg-black/80 backdrop-blur z-10">
            <tr className="border-b border-gray-800">
              {[
                { key: 'name', label: 'SYSTEM', w: '18%' },
                { key: 'type', label: 'TYPE', w: '12%' },
                { key: 'status', label: 'STATUS', w: '9%' },
                ...Object.entries(RESOURCE_LABELS).map(([k, m]) => ({ key: k, label: m.label.toUpperCase(), w: '12%', color: m.color })),
                { key: 'discovered', label: 'DISCOVERED', w: '10%' },
              ].map(col => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left cursor-pointer hover:text-cyan-400 transition-colors select-none"
                  style={{ width: col.w }}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="text-xs font-mono-tech" style={{ color: col.color || (sortField === col.key ? '#00f3ff' : '#555') }}>
                    {col.label}
                    {sortField === col.key && (
                      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map(sys => (
                <SystemRow
                  key={sys.id}
                  system={sys}
                  isSelected={selectedId === sys.id}
                  onSelect={handleSelect}
                  resourceData={resourceData(sys.id)}
                  onResourceChange={handleResourceChange}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-600 font-mono-tech text-sm">NO SYSTEMS MATCH FILTER</span>
          </div>
        )}
      </div>
    </div>
  );
}
