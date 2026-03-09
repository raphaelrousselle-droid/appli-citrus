import React, { useEffect, useState } from 'react';
import { getCareLogsForPlant, saveCareLog } from '../data/db';

export default function PlantCard({ plant, onClose }) {
  const [logs, setLogs] = useState([]);
  const [showAddLog, setShowAddLog] = useState(false);
  const [logForm, setLogForm] = useState({ type: 'engrais', product: '', dose: '', notes: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (plant) getCareLogsForPlant(plant.id).then(setLogs);
  }, [plant]);

  const addLog = async () => {
    await saveCareLog({ ...logForm, plantId: plant.id });
    const updated = await getCareLogsForPlant(plant.id);
    setLogs(updated);
    setShowAddLog(false);
  };

  if (!plant) return null;

  const EMOJI = { yuzu: '🍋', citron: '🍋', kumquat: '🟠', mandarine: '🍊', pomelo: '🟡', default: '🌿' };
  const emoji = EMOJI[plant.variety?.toLowerCase()] || EMOJI.default;

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
        <div style={styles.header}>
          <span style={styles.emoji}>{emoji}</span>
          <div>
            <h2 style={styles.plantName}>{plant.name || 'Sans nom'}</h2>
            <span style={styles.variety}>{plant.variety}</span>
          </div>
        </div>

        <div style={styles.grid}>
          {[
            ['Porte-greffe', plant.rootstock],
            ['Rusticité', plant.hardiness ? `${plant.hardiness}°C` : '—'],
            ['Acheté le', plant.purchaseDate || '—'],
            ['Planté le', plant.plantingDate || '—'],
          ].map(([label, value]) => (
            <div key={label} style={styles.infoBox}>
              <div style={styles.infoLabel}>{label}</div>
              <div style={styles.infoValue}>{value || '—'}</div>
            </div>
          ))}
        </div>

        {plant.notes && <p style={styles.notes}>📝 {plant.notes}</p>}

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>📋 Journal des soins</h3>
            <button onClick={() => setShowAddLog(true)} style={styles.addBtn}>+ Ajouter</button>
          </div>

          {logs.length === 0 && <p style={styles.empty}>Aucun soin enregistré</p>}

          {[...logs].reverse().map((log, i) => (
            <div key={i} style={styles.logItem}>
              <div style={styles.logType}>{
                log.type === 'engrais' ? '🌱 Engrais' :
                log.type === 'arrosage' ? '💧 Arrosage' :
                log.type === 'taille' ? '✂️ Taille' : '🔧 Traitement'
              }</div>
              <div style={styles.logDate}>{new Date(log.date).toLocaleDateString('fr-FR')}</div>
              {log.product && <div style={styles.logDetail}>{log.product} {log.dose && `— ${log.dose}`}</div>}
              {log.notes && <div style={styles.logNotes}>{log.notes}</div>}
            </div>
          ))}
        </div>

        {showAddLog && (
          <div style={styles.logForm}>
            <h4>Nouveau soin</h4>
            <select value={logForm.type} onChange={e => setLogForm(f => ({...f, type: e.target.value}))} style={styles.input}>
              {['engrais', 'arrosage', 'taille', 'traitement'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Produit (ex: NPK 10-10-10)" value={logForm.product}
              onChange={e => setLogForm(f => ({...f, product: e.target.value}))} style={styles.input} />
            <input placeholder="Dose (ex: 2g/L)" value={logForm.dose}
              onChange={e => setLogForm(f => ({...f, dose: e.target.value}))} style={styles.input} />
            <input type="date" value={logForm.date}
              onChange={e => setLogForm(f => ({...f, date: e.target.value}))} style={styles.input} />
            <textarea placeholder="Notes..." value={logForm.notes}
              onChange={e => setLogForm(f => ({...f, notes: e.target.value}))} style={{...styles.input, height: 60}} />
            <div style={{display:'flex', gap:8}}>
              <button onClick={() => setShowAddLog(false)} style={styles.btnCancel}>Annuler</button>
              <button onClick={addLog} style={styles.btnSave}>💾 Enregistrer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'flex-end' },
  card: { background:'#fff', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxHeight:'92vh', overflowY:'auto' },
  closeBtn: { position:'absolute', right:20, top:20, background:'#f0f0f0', border:'none', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' },
  header: { display:'flex', alignItems:'center', gap:12, marginBottom:16, marginTop:8 },
  emoji: { fontSize:48 },
  plantName: { margin:0, fontSize:22, color:'#1b5e20' },
  variety: { background:'#f5a623', color:'#fff', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:700 },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 },
  infoBox: { background:'#f9f9f9', borderRadius:10, padding:'8px 12px' },
  infoLabel: { fontSize:11, color:'#888', marginBottom:2 },
  infoValue: { fontSize:14, fontWeight:600, color:'#333' },
  notes: { background:'#fffde7', padding:'8px 12px', borderRadius:8, fontSize:13, color:'#555' },
  section: { marginTop:16 },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  sectionTitle: { margin:0, fontSize:16, color:'#2e7d32' },
  addBtn: { background:'#e8f5e9', color:'#2e7d32', border:'none', borderRadius:8, padding:'6px 12px', fontWeight:600, cursor:'pointer' },
  empty: { color:'#aaa', fontSize:13, textAlign:'center', padding:'12px 0' },
  logItem: { background:'#fafafa', borderRadius:10, padding:'10px 12px', marginBottom:8, borderLeft:'3px solid #f5a623' },
  logType: { fontWeight:700, fontSize:14 },
  logDate: { fontSize:12, color:'#888', marginTop:2 },
  logDetail: { fontSize:13, color:'#555', marginTop:4 },
  logNotes: { fontSize:12, color:'#888', fontStyle:'italic', marginTop:4 },
  logForm: { background:'#f9f9f9', borderRadius:12, padding:16, marginTop:12 },
  input: { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', fontSize:14, marginBottom:8, boxSizing:'border-box' },
  btnCancel: { flex:1, padding:10, borderRadius:8, border:'1px solid #ddd', background:'#f5f5f5', cursor:'pointer' },
  btnSave: { flex:2, padding:10, borderRadius:8, border:'none', background:'#f5a623', color:'#fff', fontWeight:700, cursor:'pointer' },
};
