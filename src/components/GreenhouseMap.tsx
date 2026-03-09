import React, { useState, useEffect } from 'react';
import { getAllPlants, savePlant } from '../data/db';

// Grille 5x8 = 40 emplacements pour une serre ~20m²
const COLS = 5;
const ROWS = 8;
const CELL_SIZE = 64;

const VARIETY_COLORS = {
  yuzu: '#f5c842',
  citron: '#f5e642',
  kumquat: '#f59642',
  mandarine: '#f57842',
  pomelo: '#f5a07a',
  bergamote: '#c8e86b',
  combava: '#7bcf72',
  default: '#d4e8c2',
};

export default function GreenhouseMap({ onSelectPlant }) {
  const [plants, setPlants] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    getAllPlants().then(setPlants);
  }, []);

  const getPlantAtPosition = (col, row) =>
    plants.find(p => p.position?.col === col && p.position?.row === row);

  const handleCellClick = (col, row) => {
    const plant = getPlantAtPosition(col, row);
    if (plant) {
      onSelectPlant(plant);
    } else {
      setSelectedCell({ col, row });
      setShowAddModal(true);
    }
  };

  const getCellColor = (col, row) => {
    const plant = getPlantAtPosition(col, row);
    if (!plant) return '#f0f7e6';
    return VARIETY_COLORS[plant.variety?.toLowerCase()] || VARIETY_COLORS.default;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🌿 Plan de la serre</h2>
      <div style={styles.legend}>
        {Object.entries(VARIETY_COLORS).filter(([k]) => k !== 'default').map(([variety, color]) => (
          <span key={variety} style={{ ...styles.legendItem, background: color }}>
            {variety}
          </span>
        ))}
      </div>
      <svg
        width={COLS * CELL_SIZE + 20}
        height={ROWS * CELL_SIZE + 20}
        style={styles.svg}
      >
        {/* Contour serre */}
        <rect x={5} y={5} width={COLS * CELL_SIZE + 10} height={ROWS * CELL_SIZE + 10}
          rx={8} fill="#e8f5e9" stroke="#4caf50" strokeWidth={2} />

        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const plant = getPlantAtPosition(col, row);
            const x = col * CELL_SIZE + 10;
            const y = row * CELL_SIZE + 10;
            return (
              <g key={`${col}-${row}`} onClick={() => handleCellClick(col, row)}
                style={{ cursor: 'pointer' }}>
                <rect x={x} y={y} width={CELL_SIZE - 4} height={CELL_SIZE - 4}
                  rx={6} fill={getCellColor(col, row)}
                  stroke={plant ? '#888' : '#c5e0b4'} strokeWidth={1} />
                {plant && (
                  <>
                    <text x={x + CELL_SIZE / 2 - 2} y={y + 22}
                      textAnchor="middle" fontSize={20}>🍋</text>
                    <text x={x + CELL_SIZE / 2 - 2} y={y + 42}
                      textAnchor="middle" fontSize={9} fill="#333">
                      {plant.name?.substring(0, 8)}
                    </text>
                  </>
                )}
                {!plant && (
                  <text x={x + CELL_SIZE / 2 - 2} y={y + CELL_SIZE / 2}
                    textAnchor="middle" fontSize={18} fill="#ccc">+</text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {showAddModal && (
        <AddPlantModal
          position={selectedCell}
          onSave={async (plant) => {
            await savePlant({ ...plant, position: selectedCell });
            const updated = await getAllPlants();
            setPlants(updated);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddPlantModal({ position, onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', variety: 'yuzu', rootstock: '',
    hardiness: '', purchaseDate: '', plantingDate: '', notes: ''
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>🌱 Ajouter un agrume</h3>
        <p style={styles.posCell}>Emplacement : col {position.col + 1}, rang {position.row + 1}</p>

        {[
          ['Nom / surnom', 'name', 'text'],
          ['Porte-greffe', 'rootstock', 'text'],
          ['Rusticité (°C min)', 'hardiness', 'text'],
          ['Date d\'achat', 'purchaseDate', 'date'],
          ['Date de plantation', 'plantingDate', 'date'],
        ].map(([label, key, type]) => (
          <div key={key} style={styles.field}>
            <label style={styles.label}>{label}</label>
            <input type={type} value={form[key]}
              onChange={e => update(key, e.target.value)}
              style={styles.input} />
          </div>
        ))}

        <div style={styles.field}>
          <label style={styles.label}>Variété</label>
          <select value={form.variety} onChange={e => update('variety', e.target.value)} style={styles.input}>
            {['yuzu', 'citron', 'kumquat', 'mandarine', 'pomelo', 'bergamote', 'combava', 'autre'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Notes</label>
          <textarea value={form.notes} onChange={e => update('notes', e.target.value)}
            style={{ ...styles.input, height: 60 }} />
        </div>

        <div style={styles.modalButtons}>
          <button onClick={onClose} style={styles.btnCancel}>Annuler</button>
          <button onClick={() => onSave(form)} style={styles.btnSave}>💾 Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '16px', overflowX: 'auto' },
  title: { fontSize: 20, color: '#2e7d32', margin: '0 0 8px' },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  legendItem: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  svg: { borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100
  },
  modal: {
    background: '#fff', borderRadius: '20px 20px 0 0', padding: 20,
    width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto'
  },
  posCell: { color: '#888', fontSize: 12, marginBottom: 12 },
  field: { marginBottom: 12 },
  label: { display: 'block', fontSize: 13, color: '#555', marginBottom: 4 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: 10, marginTop: 16 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ddd', background: '#f5f5f5', fontSize: 15 },
  btnSave: { flex: 2, padding: 12, borderRadius: 10, border: 'none', background: '#f5a623', color: '#fff', fontSize: 15, fontWeight: 700 },
};
