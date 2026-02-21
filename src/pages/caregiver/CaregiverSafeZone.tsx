import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Shield, AlertCircle } from 'lucide-react';
import { useData, type SafeZone } from '../../context/AppContext';
import './CaregiverSafeZone.css';

export const CaregiverSafeZone: React.FC = () => {
  const { safeZones, addSafeZone, updateSafeZone, removeSafeZone, distanceAlert, updateDistanceAlert, linkedPatient } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    radius: 1,
    enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateSafeZone(editingId, formData);
      setEditingId(null);
    } else {
      addSafeZone(formData);
    }
    setFormData({ name: '', address: '', radius: 1, enabled: true });
    setShowForm(false);
  };

  const handleEdit = (zone: SafeZone) => {
    setFormData({
      name: zone.name,
      address: zone.address || '',
      radius: zone.radius,
      enabled: zone.enabled,
    });
    setEditingId(zone.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this safe zone?')) {
      removeSafeZone(id);
    }
  };

  const toggleZone = (id: string, enabled: boolean) => {
    updateSafeZone(id, { enabled });
  };

  const activeZones = safeZones.filter(z => z.enabled);
  const hasOverlappingZones = activeZones.length > 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Safe Zones</h1>
        <p>Define areas where the patient can move safely</p>
      </div>

      {!linkedPatient ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Shield size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Link a Patient First</h2>
          <p style={{ color: '#64748B' }}>Link a patient to set up safe zones for them</p>
        </div>
      ) : (
        <>
          {hasOverlappingZones && (
            <div className="warning-banner" style={{ marginBottom: '24px' }}>
              <AlertCircle size={24} />
              <div>
                <strong>Multiple Active Zones</strong>
                <p>You have {activeZones.length} active safe zones. The patient needs to be inside at least one.</p>
              </div>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Zone Map</h3>
              </div>

              <div className="map-view-large">
                <Shield size={60} color="#10B981" />
                <p>Zone Visualization</p>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  {activeZones.length} active zone(s)
                </span>
              </div>

              <div style={{ padding: '16px 0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Zone Overview</h4>
                {safeZones.length > 0 ? (
                  <div className="zone-badges">
                    {safeZones.map(zone => (
                      <div key={zone.id} className={`zone-badge ${zone.enabled ? 'active' : ''}`}>
                        <MapPin size={14} />
                        {zone.name} ({zone.radius}km)
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: '14px' }}>No zones configured</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Manage Zones</h3>
                <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', address: '', radius: 1, enabled: true }); }}>
                  <Plus size={16} /> Add
                </button>
              </div>

              {safeZones.length > 0 ? (
                <div className="zone-list">
                  {safeZones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`zone-item ${zone.enabled ? 'active' : ''}`}
                    >
                      <div className="zone-icon">
                        <MapPin size={20} color={zone.enabled ? '#fff' : '#64748B'} />
                      </div>
                      <div className="zone-info">
                        <span className="zone-name">{zone.name}</span>
                        <span className="zone-radius">{zone.radius} km radius</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label className="switch" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={zone.enabled}
                            onChange={(e) => toggleZone(zone.id, e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                        <button onClick={() => handleEdit(zone)} style={{ background: 'none', padding: '4px' }}>
                          <Edit2 size={16} color="#64748B" />
                        </button>
                        <button onClick={() => handleDelete(zone.id)} style={{ background: 'none', padding: '4px' }}>
                          <Trash2 size={16} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748B', textAlign: 'center', padding: '24px' }}>No safe zones yet. Add one to get started.</p>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">{editingId ? 'Edit' : 'Add New'} Safe Zone</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Zone Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Home, Park, Daughter's House"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Address (optional)</label>
                <input
                  type="text"
                  placeholder="Enter address or location description"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Radius: {formData.radius} km</label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                  <span>0.1 km (home)</span>
                  <span>10 km (neighborhood)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Add'} Zone
                </button>
                {showForm && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Distance Alert</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={distanceAlert.enabled}
                  onChange={(e) => updateDistanceAlert({ enabled: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            {distanceAlert.enabled && (
              <div>
                <p style={{ color: '#64748B', marginBottom: '16px' }}>
                  Get notified if patient is more than <strong>{distanceAlert.maxDistance} km</strong> away from you
                </p>
                <div className="form-group">
                  <label>Max Distance: {distanceAlert.maxDistance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={distanceAlert.maxDistance}
                    onChange={(e) => updateDistanceAlert({ maxDistance: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
