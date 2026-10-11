import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAR_SYSTEMS } from '../data/starSystems';

// ─── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="font-mono-tech text-cyan-400 text-xs">
      <span className="text-gray-500 mr-1">STARDATE</span>
      {2187 + Math.floor(time.getTime() / 1e10)}.
      {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabButton({ id, label, icon, active, onClick, alertCount }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2 text-xs font-orbitron font-medium transition-all duration-200"
      style={{
        color: active ? '#00f3ff' : '#555',
        borderBottom: active ? '2px solid #00f3ff' : '2px solid transparent',
        background: active ? 'rgba(0,243,255,0.05)' : 'transparent',
      }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
      {label}
      {alertCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: '#ff00a0', color: 'white', fontSize: '9px' }}>
          {alertCount > 9 ? '9+' : alertCount}
        </span>
      )}
    </button>
  );
}

// ─── System status widget ─────────────────────────────────────────────────────
function StatusWidget() {
  const criticals = STAR_SYSTEMS.filter(s => s.status === 'CRITICAL').length;
  const anomalies = STAR_SYSTEMS.filter(s => s.status === 'ANOMALY').length;
  const actives   = STAR_SYSTEMS.filter(s => s.status === 'ACTIVE').length;

  return (
    <div className="flex items-center gap-3">
      {[
        { label: 'ACTIVE',   count: actives,   color: '#7fff00' },
        { label: 'ANOMALY',  count: anomalies,  color: '#ff9500' },
        { label: 'CRITICAL', count: criticals,  color: '#ff00a0' },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color,
            boxShadow: `0 0 6px ${item.color}` }} />
          <span className="text-xs font-mono-tech" style={{ color: item.color }}>{item.count}</span>
          <span className="text-xs font-mono-tech text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({ activeTab, onTabChange, criticalCount }) {
  const [showNotif, setShowNotif] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);

  const tabs = [
    { key: 'map',       label: 'STELLAR MAP',      icon: '🌌', id: 'tab-map' },
    { key: 'terminal',  label: 'TELEMETRY LOG',     icon: '📡', id: 'tab-terminal',
      alertCount: notifSeen ? 0 : criticalCount },
    { key: 'dashboard', label: 'RESOURCE DATABASE', icon: '⚡', id: 'tab-dashboard' },
  ];

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-4 py-0"
      style={{
        background: 'rgba(5, 5, 15, 0.95)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        height: '52px',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        {/* Animated logo icon */}
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#00f3ff" strokeWidth="1" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16"
                dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="16" r="7" fill="none" stroke="#b026ff" strokeWidth="1" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="360 16 16" to="0 16 16"
                dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="16" r="3" fill="#00f3ff" opacity="0.9" />
          </svg>
        </div>
        <div>
          <div className="font-orbitron text-sm font-bold text-glow-cyan" style={{ color: '#00f3ff' }}>
            AETHERNEXUS
          </div>
          <div className="text-xs font-mono-tech text-gray-600 leading-none">
            MULTIVERSE EXPLORER v2.4.1
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center h-full">
        {tabs.map(tab => (
          <TabButton
            key={tab.key}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.key}
            onClick={() => {
              onTabChange(tab.key);
              if (tab.key === 'terminal') setNotifSeen(true);
            }}
            alertCount={tab.alertCount || 0}
          />
        ))}
      </nav>

      {/* Right HUD */}
      <div className="flex items-center gap-4">
        <StatusWidget />
        <div className="w-px h-4 bg-gray-700" />
        <LiveClock />
        <div className="w-px h-4 bg-gray-700" />
        {/* Signal strength bars */}
        <div className="flex items-end gap-0.5 h-4">
          {[3, 5, 7, 9, 4].map((h, i) => (
            <div key={i} className="w-1 rounded-sm" style={{
              height: `${h * 2}px`,
              background: i < 4 ? '#00f3ff' : '#333',
              opacity: 0.8,
            }} />
          ))}
        </div>
      </div>
    </header>
  );
}
