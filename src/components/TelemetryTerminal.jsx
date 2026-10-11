import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { startTelemetryWorker } from '../workers/telemetryWorker';

const MAX_MESSAGES = 80;

const LEVEL_STYLE = {
  INFO:     { color: '#00f3ff', bg: 'rgba(0,243,255,0.06)' },
  WARN:     { color: '#ff9500', bg: 'rgba(255,149,0,0.06)' },
  CRITICAL: { color: '#ff00a0', bg: 'rgba(255,0,160,0.1)', border: '1px solid rgba(255,0,160,0.3)' },
  DATA:     { color: '#7fff00', bg: 'rgba(127,255,0,0.05)' },
};

function TelemetryLine({ msg }) {
  const style = LEVEL_STYLE[msg.level] || LEVEL_STYLE.INFO;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2 px-3 py-1.5 rounded mb-0.5"
      style={{
        background: style.bg,
        border: style.border || 'none',
      }}
    >
      {/* Timestamp */}
      <span className="text-xs font-mono-tech text-gray-500 flex-shrink-0 mt-px">
        {msg.timestamp}
      </span>
      {/* Level badge */}
      <span
        className="text-xs font-mono-tech font-bold flex-shrink-0 w-16"
        style={{ color: style.color }}
      >
        {msg.prefix}
      </span>
      {/* Message */}
      <span className="text-xs font-mono-tech text-gray-300 leading-relaxed">
        {msg.text}
      </span>
    </motion.div>
  );
}

export default function TelemetryTerminal() {
  const [messages, setMessages] = useState([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [stats, setStats] = useState({ INFO: 0, WARN: 0, CRITICAL: 0, DATA: 0 });
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const cleanupRef = useRef(null);

  pausedRef.current = paused;

  // Start worker
  useEffect(() => {
    cleanupRef.current = startTelemetryWorker((msg) => {
      if (pausedRef.current) return;
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
      });
      setStats(prev => ({ ...prev, [msg.level]: (prev[msg.level] || 0) + 1 }));
    });
    return () => cleanupRef.current?.();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, paused]);

  const filtered = filter === 'ALL' ? messages : messages.filter(m => m.level === filter);

  const FILTERS = ['ALL', 'INFO', 'WARN', 'CRITICAL', 'DATA'];
  const filterColors = { ALL: '#8888aa', INFO: '#00f3ff', WARN: '#ff9500', CRITICAL: '#ff00a0', DATA: '#7fff00' };

  return (
    <div className="flex flex-col h-full glass-panel border-purple relative overflow-hidden" id="telemetry-terminal">
      {/* Scanline overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none z-10" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-purple-900/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="font-orbitron text-xs text-purple-300 ml-1">
            AETHERNEXUS TELEMETRY LOG
          </span>
          <span className="neon-badge" style={{ borderColor: '#b026ff', color: '#b026ff' }}>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="telemetry-pause-btn"
            onClick={() => setPaused(p => !p)}
            className="text-xs font-mono-tech px-2 py-0.5 rounded border transition-all"
            style={{
              borderColor: paused ? '#ff9500' : 'rgba(0,243,255,0.3)',
              color: paused ? '#ff9500' : '#00f3ff',
              background: paused ? 'rgba(255,149,0,0.1)' : 'rgba(0,243,255,0.05)',
            }}
          >
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <button
            onClick={() => setMessages([])}
            className="text-xs font-mono-tech px-2 py-0.5 rounded border border-gray-700 text-gray-500 hover:text-red-400 hover:border-red-500/40 transition-all"
          >
            ✕ CLEAR
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b border-gray-900/60 flex-shrink-0">
        {Object.entries(stats).map(([level, count]) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: filterColors[level] }} />
            <span className="text-xs font-mono-tech" style={{ color: filterColors[level] }}>
              {level}
            </span>
            <span className="text-xs font-mono-tech text-gray-500">{count}</span>
          </div>
        ))}
        <div className="ml-auto text-xs font-mono-tech text-gray-600">
          {messages.length} entries
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-b border-gray-900/60 flex-shrink-0">
        {FILTERS.map(f => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className="text-xs font-mono-tech px-2 py-0.5 rounded transition-all"
            style={{
              background: filter === f ? `${filterColors[f]}20` : 'transparent',
              border: `1px solid ${filter === f ? filterColors[f] : 'rgba(255,255,255,0.1)'}`,
              color: filter === f ? filterColors[f] : '#666',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-2"
        style={{ minHeight: 0 }}
      >
        {/* Prompt line at top */}
        <div className="px-3 py-1 mb-1">
          <span className="text-xs font-mono-tech text-purple-400">
            root@aethernexus:~$ <span className="text-cyan-400">stream telemetry --live --sector=ALL</span>
          </span>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((msg) => (
            <TelemetryLine key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        {/* Blinking cursor line */}
        {!paused && (
          <div className="px-3 py-1">
            <span className="text-xs font-mono-tech text-cyan-400/60 cursor-blink">
              AWAITING TELEMETRY
            </span>
          </div>
        )}
        {paused && (
          <div className="px-3 py-1">
            <span className="text-xs font-mono-tech text-yellow-500/70">
              ── STREAM PAUSED ──
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
