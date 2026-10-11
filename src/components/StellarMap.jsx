import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAR_SYSTEMS, STATUS_META } from '../data/starSystems';

// ─── Orbital ring animation ──────────────────────────────────────────────────
function OrbitRing({ radius, speed, color }) {
  return (
    <circle
      cx="0" cy="0" r={radius}
      fill="none"
      stroke={color || 'rgba(0,243,255,0.35)'}
      strokeWidth="1"
      strokeDasharray="5 5"
    />
  );
}

// ─── Animated planet on orbit ─────────────────────────────────────────────────
function OrbitingPlanet({ planet, onSelect, isSelected, parentPos, starId }) {
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const speed = planet.speed * 0.3; // radians/sec
    const animate = (ts) => {
      if (lastRef.current !== null) {
        const dt = (ts - lastRef.current) / 1000;
        angleRef.current += speed * dt;
      }
      lastRef.current = ts;
      const x = Math.cos(angleRef.current) * planet.orbitR;
      const y = Math.sin(angleRef.current) * planet.orbitR * 0.38; // flatten for 3D effect
      setPos({ x, y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [planet]);

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      onClick={(e) => { e.stopPropagation(); onSelect({ ...planet, starId }); }}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow filter applied via filter attr */}
      <circle
        r={planet.size + 4}
        fill="transparent"
        stroke={planet.color}
        strokeWidth={isSelected ? 2 : 0}
        opacity={0.6}
      />
      <circle r={planet.size} fill={planet.color} opacity={0.9} />
      {isSelected && (
        <circle r={planet.size + 8} fill="none" stroke={planet.color}
          strokeWidth="1" strokeDasharray="3 3" opacity={0.7}>
          <animateTransform attributeName="transform" type="rotate"
            from="0" to="360" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Planet label */}
      <text y={-planet.size - 6} textAnchor="middle"
        fill={planet.color} fontSize="7" fontFamily="Share Tech Mono, monospace"
        opacity={0.85}>
        {planet.name}
      </text>
    </g>
  );
}

// ─── Star node on map ─────────────────────────────────────────────────────────
function StarNode({ system, onClick, isSelected }) {
  const meta = STATUS_META[system.status];
  const cx = `${system.coordinates.x}%`;
  const cy = `${system.coordinates.y}%`;

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onClick(system); }}
      style={{ cursor: 'pointer' }}
      className="star-node"
    >
      {/* Pulse ring for active/anomaly */}
      {meta.pulse && (
        <circle cx={cx} cy={cy} r={system.size + 10} fill="none"
          stroke={meta.color} strokeWidth="1" opacity={0.4}>
          <animate attributeName="r" values={`${system.size + 6};${system.size + 22};${system.size + 6}`}
            dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Selection ring */}
      {isSelected && (
        <circle cx={cx} cy={cy} r={system.size + 16} fill="none"
          stroke={system.color} strokeWidth="1.5" strokeDasharray="6 3" opacity={0.8}>
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="6s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Core star */}
      <circle cx={cx} cy={cy} r={system.size} fill={system.color} opacity={0.9}>
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Inner bright spot */}
      <circle cx={cx} cy={cy} r={system.size * 0.4} fill="white" opacity={0.6} />
      {/* Label */}
      <text x={cx} y={`calc(${cy} + ${system.size + 14}px)`}
        textAnchor="middle" fill={system.color} fontSize="9"
        fontFamily="Share Tech Mono, monospace" opacity={0.9}>
        {system.name}
      </text>
      <text x={cx} y={`calc(${cy} + ${system.size + 24}px)`}
        textAnchor="middle" fill="#8888aa" fontSize="7"
        fontFamily="Share Tech Mono, monospace" opacity={0.7}>
        {system.type}
      </text>
    </g>
  );
}

// ─── System Detail Overlay ─────────────────────────────────────────────────────
function SystemDetailPanel({ system, selectedPlanet, onClose }) {
  const meta = STATUS_META[system.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="absolute right-3 top-3 bottom-3 w-72 glass-panel border-cyan hud-corner overflow-y-auto z-20"
      style={{ maxHeight: 'calc(100% - 24px)' }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-orbitron text-sm font-bold" style={{ color: system.color }}>
              {system.name}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 font-mono-tech">{system.type} · {system.sector}</div>
          </div>
          <button onClick={onClose}
            className="text-gray-500 hover:text-cyan-400 transition-colors text-xs font-mono-tech border border-gray-700 px-2 py-1 rounded">
            ✕ CLOSE
          </button>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full" style={{ background: meta.color,
            boxShadow: `0 0 8px ${meta.color}` }} />
          <span className="neon-badge" style={{ borderColor: meta.color, color: meta.color }}>
            {system.status}
          </span>
          <span className="text-xs text-gray-500 font-mono-tech ml-auto">
            DISC. {system.discovered}
          </span>
        </div>

        {/* Lore */}
        <div className="glass-panel p-3 mb-3 rounded-lg border border-purple-900/30">
          <div className="text-xs font-orbitron text-purple-400 mb-2">◈ STELLAR LORE</div>
          <p className="text-xs text-gray-300 leading-relaxed font-light">{system.lore}</p>
        </div>

        {/* Tech specs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'MASS', value: system.mass },
            { label: 'TEMP', value: system.temperature },
            { label: 'COORD X', value: system.coordinates.x + '%' },
            { label: 'COORD Y', value: system.coordinates.y + '%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-black/30 rounded p-2 border border-gray-800">
              <div className="text-xs text-gray-500 font-mono-tech">{label}</div>
              <div className="text-xs text-cyan-300 font-mono-tech mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        {/* Orbital bodies */}
        {system.planets.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-orbitron text-cyan-400 mb-2">⬡ ORBITAL BODIES</div>
            <div className="space-y-1">
              {system.planets.map(p => (
                <div key={p.id}
                  className={`flex items-center gap-2 p-2 rounded border transition-all ${
                    selectedPlanet?.id === p.id
                      ? 'border-cyan-500/60 bg-cyan-900/20'
                      : 'border-gray-800/50 bg-black/20'
                  }`}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-mono-tech truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.type}</div>
                  </div>
                  <div className="text-xs text-gray-600 font-mono-tech">{p.orbitR} AU</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources preview */}
        <div>
          <div className="text-xs font-orbitron text-yellow-400 mb-2">⚡ RESOURCES</div>
          {Object.entries(system.resources).map(([key, val]) => {
            const colors = { energonite: '#ffd700', voidCrystal: '#b026ff', darkMatter: '#00f3ff', biomass: '#7fff00' };
            const labels = { energonite: 'Energonite', voidCrystal: 'Void Crystal', darkMatter: 'Dark Matter', biomass: 'Biomass' };
            return (
              <div key={key} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 font-mono-tech">{labels[key]}</span>
                  <span className="font-mono-tech" style={{ color: colors[key] }}>{val}%</span>
                </div>
                <div className="h-1 bg-gray-800/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${colors[key]}88, ${colors[key]})`,
                      boxShadow: `0 0 8px ${colors[key]}60` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Starfield background (static + twinkling) ────────────────────────────────
const STARS = Array.from({ length: 180 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 0.3 + Math.random() * 1.2,
  dur: 2 + Math.random() * 4,
}));

// ─── Main StellarMap component ─────────────────────────────────────────────────
export default function StellarMap() {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const svgRef = useRef(null);

  const handleSystemClick = useCallback((system) => {
    setSelectedSystem(prev => prev?.id === system.id ? null : system);
    setSelectedPlanet(null);
  }, []);

  const handlePlanetSelect = useCallback((planet) => {
    setSelectedPlanet(prev => prev?.id === planet.id ? null : planet);
  }, []);

  const handleBgClick = useCallback(() => {
    setSelectedSystem(null);
    setSelectedPlanet(null);
  }, []);

  // Find the selected system's data (for orbiting system)
  const activeSystem = selectedSystem
    ? STAR_SYSTEMS.find(s => s.id === selectedSystem.id)
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl" id="stellar-map">
      {/* Animated background grid */}
      <div className="absolute inset-0 animated-grid opacity-60" />

      {/* SVG stellar canvas */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleBgClick}
      >
        <defs>
          <filter id="glow-cyan">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-star">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background stars */}
        {STARS.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={0.5}>
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${s.dur}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Connection lines between stars */}
        {STAR_SYSTEMS.map((sys, i) =>
          STAR_SYSTEMS.slice(i + 1, i + 3).map(other => (
            <line key={`${sys.id}-${other.id}`}
              x1={`${sys.coordinates.x}%`} y1={`${sys.coordinates.y}%`}
              x2={`${other.coordinates.x}%`} y2={`${other.coordinates.y}%`}
              stroke="rgba(0,243,255,0.28)" strokeWidth="1.2" strokeDasharray="6 8"
            />
          ))
        )}

        {/* Star nodes */}
        {STAR_SYSTEMS.map(system => (
          <StarNode
            key={system.id}
            system={system}
            onClick={handleSystemClick}
            isSelected={selectedSystem?.id === system.id}
          />
        ))}
      </svg>

      {/* Orbital system view overlay (when system selected) */}
      <AnimatePresence>
        {activeSystem && (
          <motion.div
            key="orbit-view"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)', zIndex: 10 }}
          >
            <svg width={520} height={420} style={{ overflow: 'visible' }}>
              <g transform={`translate(260, 210)`}>
                {/* Orbit rings */}
                {activeSystem.planets.map(p => (
                  <OrbitRing key={p.id + '-ring'} radius={p.orbitR} color="rgba(0,243,255,0.35)" />
                ))}

                {/* Central star */}
                <circle r={activeSystem.size + 2} fill={activeSystem.color} opacity={0.9}>
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={activeSystem.size * 0.45} fill="white" opacity={0.7} />

                {/* Orbiting planets */}
                {activeSystem.planets.map(p => (
                  <g key={p.id} style={{ pointerEvents: 'all' }}>
                    <OrbitingPlanet
                      planet={p}
                      starId={activeSystem.id}
                      onSelect={handlePlanetSelect}
                      isSelected={selectedPlanet?.id === p.id}
                    />
                  </g>
                ))}
              </g>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {activeSystem && (
          <SystemDetailPanel
            key={activeSystem.id}
            system={activeSystem}
            selectedPlanet={selectedPlanet}
            onClose={() => { setSelectedSystem(null); setSelectedPlanet(null); }}
          />
        )}
      </AnimatePresence>

      {/* HUD overlays */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <div className="text-xs font-mono-tech text-cyan-400/60 leading-relaxed">
          <div>SECTOR SCAN: ACTIVE</div>
          <div>OBJECTS TRACKED: {STAR_SYSTEMS.length}</div>
          <div>RESOLUTION: 0.003″</div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div className="text-xs font-mono-tech text-cyan-400/40">
          CLICK STAR TO INSPECT · CLICK PLANET TO SELECT
        </div>
      </div>

      {/* Corner decoration lines */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
        style={{ borderTop: '2px solid rgba(0,243,255,0.4)', borderLeft: '2px solid rgba(0,243,255,0.4)' }} />
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
        style={{ borderBottom: '2px solid rgba(0,243,255,0.4)', borderRight: '2px solid rgba(0,243,255,0.4)' }} />
    </div>
  );
}
