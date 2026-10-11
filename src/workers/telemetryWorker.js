// Mock background worker: generates telemetry alert streams
// Returns a cleanup function when called with a callback

const ALERT_TEMPLATES = [
  { level: 'INFO',    prefix: '[SYS]',    msgs: [
    'Navigation array calibrated. Drift correction: ±0.003 arc-sec.',
    'Quantum uplink handshake established with beacon XR-7.',
    'Stellar cartography update v2.4.1 applied successfully.',
    'Long-range scan initiated. Expected completion in 00:14:22.',
    'Fuel cell efficiency nominal at 98.7%. No intervention required.',
    'Crew bio-signs stable across all 47 active pods.',
    'Memory cache purged. Freeing 2.4 TB of residual scan data.',
    'Autopilot engaged. Following course delta-7 to Sector Gamma.',
  ]},
  { level: 'WARN',    prefix: '[ALERT]',  msgs: [
    'Micrometeorite impact detected — starboard shield at 84%. Monitoring.',
    'Solar wind intensity elevated in Sector Beta. Adjusting trajectory.',
    'Comm relay NX-19 is degraded. Rerouting through backup node.',
    'Propulsion thruster 4 showing elevated thermal signature: 2,340°C.',
    'Sensor array interference detected near Obsidian Gate perimeter.',
    'Hull stress fracture logged — Section 7G. Maintenance queued.',
    'Power fluctuation on sublevel 3. Engineering dispatched.',
    'Encrypted signal of unknown origin intercepted on frequency 9.74 GHz.',
  ]},
  { level: 'CRITICAL', prefix: '[!!CRIT]', msgs: [
    'WORMHOLE PROXIMITY ALERT — Miraxis Rift within 2.4 AU. Abort trajectory!',
    'Dark matter density spike! Navigation algorithms destabilized.',
    'HOSTILE SCAN DETECTED — source unidentified, bearing 047-Mark-22.',
    'Core temperature critical: 14,800°C. Emergency coolant deployed.',
    'Quantum encryption breach attempted on sector command channel.',
    'Temporal distortion wave originating from Obsidian Gate — brace!',
    'Life support O₂ generation offline on deck 9. Emergency protocols engaged.',
  ]},
  { level: 'DATA',    prefix: '[TELM]',  msgs: [
    'Energonite extraction rate: 4,712 MT/hr. Veins holding steady.',
    'Void crystal resonance frequency: 7.83 Hz — optimal collection window.',
    'Dark matter particle count: 1.2×10¹⁸ per cubic km. Above threshold.',
    'Biomass cultivation yield from Crystallis: +23% above projection.',
    'Gravitational shear at Hyperion Drift: 0.0042 Schwarzschild radii.',
    'Scan resolution upgraded to 0.003 arc-second. Targeting refined.',
    'Exoplanet atmospheric composition: N₂ 78%, O₂ 19%, Ar 1.2%, unknown 1.8%.',
    'Interstellar medium hydrogen density: 1.8 atoms/cm³ in current corridor.',
  ]},
];

const LEVEL_COLORS = {
  INFO:     '#00f3ff',
  WARN:     '#ff9500',
  CRITICAL: '#ff00a0',
  DATA:     '#7fff00',
};

function randomEntry(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function padTime(n) {
  return String(n).padStart(2, '0');
}

function timestamp() {
  const d = new Date();
  return `${padTime(d.getHours())}:${padTime(d.getMinutes())}:${padTime(d.getSeconds())}`;
}

export function startTelemetryWorker(onMessage) {
  let running = true;
  let timeoutId = null;
  let msgId = 0;

  const weights = [0, 0, 0, 0, 1, 1, 2, 3]; // bias toward INFO/WARN

  async function emit() {
    if (!running) return;

    const tpl = ALERT_TEMPLATES[weights[Math.floor(Math.random() * weights.length)]];
    const msg = randomEntry(tpl.msgs);

    onMessage({
      id: msgId++,
      timestamp: timestamp(),
      level: tpl.level,
      prefix: tpl.prefix,
      text: msg,
      color: LEVEL_COLORS[tpl.level],
    });

    // Variable delay: 600ms – 2800ms
    const delay = 600 + Math.random() * 2200;
    timeoutId = setTimeout(emit, delay);
  }

  // Kick off with a small initial delay
  timeoutId = setTimeout(emit, 400);

  return () => {
    running = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}
