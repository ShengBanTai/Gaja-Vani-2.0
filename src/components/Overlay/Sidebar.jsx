import React from 'react';
import { AlertTriangle, Radio, ShieldAlert, Activity } from 'lucide-react';

const Sidebar = ({ incidents, villageStatus, isOpen, onClose }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Close button for mobile */}
            <div className="mobile-close" style={{ alignSelf: 'flex-end', display: isOpen ? 'block' : 'none', cursor: 'pointer', marginBottom: '1rem' }} onClick={onClose}>
                X
            </div>

            {/* Live Incident Feed */}
            <div className="glass-panel sidebar-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                    <Radio size={20} className="text-glow" /> Live Incident Feed
                </h3>
                <div className="feed-list" style={{ flex: 1, overflowY: 'auto' }}>
                    {incidents.map(incident => (
                        <div key={incident.id} style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{incident.time}</div>
                            <div style={{ fontSize: '0.9rem' }}>{incident.description}</div>
                        </div>
                    ))}
                    {incidents.length === 0 && <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No recent incidents.</div>}
                </div>
            </div>

            {/* Village Safety Status */}
            <div className="glass-panel sidebar-panel">
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
                    <ShieldAlert size={20} /> Village Safety Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {villageStatus.map((bg, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem' }}>{bg.name}</span>
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                                <div style={{
                                    width: '30px', height: '8px', borderRadius: '4px',
                                    backgroundColor: bg.color === 'green' ? 'var(--color-primary)' :
                                        bg.color === 'yellow' ? 'var(--color-accent)' : 'var(--color-danger)',
                                    boxShadow: bg.color === 'red' ? '0 0 8px var(--color-danger)' : 'none'
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Proximity Alert */}
            <div className="glass-panel danger-glow sidebar-panel" style={{ background: 'rgba(255, 0, 60, 0.1)', border: '1px solid var(--color-danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', fontWeight: 'bold' }}>PROXIMITY ALERT</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>500m</div>
                    </div>
                    <Activity size={32} color="var(--color-danger)" className="pulse" />
                </div>
            </div>

        </div>
    );
};

export default Sidebar;
