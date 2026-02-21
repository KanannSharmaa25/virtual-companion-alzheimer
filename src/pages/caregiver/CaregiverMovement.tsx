import React from 'react';
import { Footprints, Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './CaregiverDashboard.css';

export const CaregiverMovement: React.FC = () => {
  const { movementData, linkedPatient } = useData();

  if (!linkedPatient) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Movement Tracking</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Activity size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h2>Link a Patient First</h2>
          <p style={{ color: '#64748B' }}>Link a patient to track their movement</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: { bg: '#D1FAE5', color: '#059669' },
    inactive: { bg: '#FEE2E2', color: '#DC2626' },
    unusual: { bg: '#FEF3C7', color: '#D97706' }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Movement Tracking</h1>
        <p>Monitor {linkedPatient.name}'s activity and movement patterns</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon green">
            <Footprints size={24} />
          </div>
          <div className="stat-value">{movementData.steps.toLocaleString()}</div>
          <div className="stat-label">Today's Steps</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Activity size={24} />
          </div>
          <div className="stat-value">{movementData.status === 'active' ? 'Active' : movementData.status === 'inactive' ? 'Inactive' : 'Unusual'}</div>
          <div className="stat-label">Current Status</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Clock size={24} />
          </div>
          <div className="stat-value">
            {movementData.lastMovement ? Math.round((Date.now() - movementData.lastMovement) / 60000) + ' min' : 'N/A'}
          </div>
          <div className="stat-label">Last Movement</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Movement Status</h3>
        </div>
        
        <div style={{ 
          padding: '24px', 
          background: statusColors[movementData.status].bg, 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {movementData.status === 'active' ? (
            <CheckCircle size={32} color={statusColors.active.color} />
          ) : movementData.status === 'inactive' ? (
            <AlertCircle size={32} color={statusColors.inactive.color} />
          ) : (
            <AlertCircle size={32} color={statusColors.unusual.color} />
          )}
          <div>
            <h4 style={{ color: statusColors[movementData.status].color, fontSize: '18px', fontWeight: '600' }}>
              {movementData.status === 'active' ? 'Patient is Active' : 
               movementData.status === 'inactive' ? 'No Movement Detected' : 
               'Unusual Movement Pattern'}
            </h4>
            <p style={{ color: '#64748B', marginTop: '4px' }}>
              {movementData.status === 'active' ? 'Patient is moving around normally' : 
               movementData.status === 'inactive' ? 'No movement detected for a while. May need attention.' : 
               'Movement pattern has changed significantly. Please check on patient.'}
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Indoor Movement Detection</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>Normal</h4>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Movement pattern</p>
          </div>
          <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>Detected</h4>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Indoor activity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
