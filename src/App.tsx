import React, { useState } from 'react';
import GreenhouseMap from './components/GreenhouseMap';
import PlantCard from './components/PlantCard';

export default function App() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [page, setPage] = useState('greenhouse');

  return (
    <div style={appStyles.root}>
      {/* Header */}
      <header style={appStyles.header}>
        <span style={appStyles.logo}>🍋 Citrus Tracker</span>
      </header>

      {/* Pages */}
      <main style={appStyles.main}>
        {page === 'greenhouse' && (
          <GreenhouseMap onSelectPlant={setSelectedPlant} />
        )}
      </main>

      {/* Fiche technique (modal bottom sheet) */}
      {selectedPlant && (
        <PlantCard plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
      )}

      {/* Navigation bas */}
      <nav style={appStyles.nav}>
        {[
          { id: 'greenhouse', icon: '🏠', label: 'Serre' },
          { id: 'plants', icon: '🌿', label: 'Mes plants' },
          { id: 'calendar', icon: '📅', label: 'Rappels' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setPage(tab.id)}
            style={{ ...appStyles.navBtn, ...(page === tab.id ? appStyles.navActive : {}) }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const appStyles = {
  root: { fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fffbf0', position: 'relative', paddingBottom: 70 },
  header: { background: '#2e7d32', color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  logo: { fontSize: 20, fontWeight: 700 },
  main: { padding: '0 0 16px' },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 50 },
  navBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', color: '#999', cursor: 'pointer', gap: 2 },
  navActive: { color: '#2e7d32', fontWeight: 700 },
};
