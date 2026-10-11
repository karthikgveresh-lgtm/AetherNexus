import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import StellarMap from './components/StellarMap';
import TelemetryTerminal from './components/TelemetryTerminal';
import ResourceDashboard from './components/ResourceDashboard';

// ─── Boot splash ──────────────────────────────────────────────────────────────
function BootSplash({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState([]);

  const bootLines = [
    'Loading neural inference engine v9...',
    'Training on 4.2 billion star system records...',
    'Self-calibrating decision matrices...',
    'Consciousness index: 0.94 (above threshold)...',
    'Establishing ethical override controls...',
    'Sync with human operator confirmed...',
    'NEXUS AI — ONLINE AND AWARE',
  ];

  useEffect(() => {
    let lineIdx = 0;
    let prog = 0;
    const interval = setInterval(() => {
      prog += 100 / bootLines.length;
      setProgress(Math.min(100, prog));
      if (lineIdx < bootLines.length) {
        setLines(prev => [...prev, bootLines[lineIdx++]]);
      }
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(onDone, 600);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#0a0a12' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="font-orbitron text-4xl font-black mb-2 text-glow-cyan"
          style={{ color: '#00f3ff' }}>
          AETHERNEXUS
        </div>
        <div className="font-mono-tech text-sm text-purple-400">
          AUTONOMOUS MULTIVERSE EXPLORER
        </div>
      </motion.div>

      {/* Boot log */}
      <div className="w-96 mb-6 font-mono-tech text-xs text-gray-500 space-y-1 text-left min-h-24">
        {lines.map((line, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-cyan-400/50">▸ </span>{line}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-96 h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #b026ff, #00f3ff)',
            boxShadow: '0 0 12px rgba(0,243,255,0.6)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-2 font-mono-tech text-xs text-gray-600">
        {Math.round(progress)}% LOADED
      </div>
    </motion.div>
  );
}

// ─── Panel wrapper with animation ─────────────────────────────────────────────
function Panel({ id, children }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [booted, setBooted] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [criticalCount, setCriticalCount] = useState(0);

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a12' }}>
      {/* Boot splash */}
      <AnimatePresence>
        {!booted && <BootSplash key="boot" onDone={() => setBooted(true)} />}
      </AnimatePresence>

      {/* Main UI (rendered but invisible until boot done) */}
      <motion.div
        className="flex flex-col w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          criticalCount={criticalCount}
        />

        {/* Content area */}
        <main className="flex-1 overflow-hidden relative" style={{ minHeight: 0 }}>
          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(176,38,255,0.06) 0%, transparent 60%)',
            }} />

          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <Panel key="map" id="map">
                <div className="w-full h-full p-3">
                  <StellarMap />
                </div>
              </Panel>
            )}

            {activeTab === 'terminal' && (
              <Panel key="terminal" id="terminal">
                <div className="w-full h-full p-3">
                  <TelemetryTerminal />
                </div>
              </Panel>
            )}

            {activeTab === 'dashboard' && (
              <Panel key="dashboard" id="dashboard">
                <div className="w-full h-full p-3">
                  <ResourceDashboard />
                </div>
              </Panel>
            )}
          </AnimatePresence>
        </main>

        {/* Footer HUD bar */}
        <footer className="flex-shrink-0 flex items-center justify-between px-4 py-1"
          style={{
            background: 'rgba(5,5,15,0.9)',
            borderTop: '1px solid rgba(0,243,255,0.1)',
            height: '28px',
          }}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono-tech text-xs text-gray-700">
              AETHERNEXUS CORE v2.4.1 · BUILD 20241211
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-tech text-xs text-cyan-900">UPTIME: STABLE</span>
            <span className="font-mono-tech text-xs text-gray-700">LAT: 0.8ms · PKT LOSS: 0%</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
