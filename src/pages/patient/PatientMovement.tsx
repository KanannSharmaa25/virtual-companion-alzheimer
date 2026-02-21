import React from 'react';
import { Footprints, Activity, Clock, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './PatientHome.css';

export const PatientMovement: React.FC = () => {
  const { movementData, safeZones } = useData();
  const enabledSafeZone = safeZones.find(z => z.enabled);

  const statusColors = {
    active: { bg: '#D1FAE5', color: '#059669', icon: CheckCircle },
    inactive: { bg: '#FEE2E2', color: '#DC2626', icon: AlertTriangle },
    unusual: { bg: '#FEF3C7', color: '#D97706', icon: AlertTriangle }
  };

  const StatusIcon = statusColors[movementData.status].icon;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Movement</h1>
        <p>Track your daily activity</p>
      </div>

      <div className="welcome-card">
        <div className="welcome-icon">
          <Footprints size={32} color="white" />
        </div>
        <div className="welcome-content">
          <h2>Today's Activity</h2>
          <p>You're doing great! Keep moving.</p>
        </div>
        <div className="welcome-time">
          <span style={{ fontSize: '36px', fontWeight: '700' }}>{movementData.steps.toLocaleString()}</span>
          <span style={{ fontSize: '14px' }}>steps</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
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
            <StatusIcon size={32} color={statusColors[movementData.status].color} />
            <div>
              <h4 style={{ color: statusColors[movementData.status].color, fontSize: '18px', fontWeight: '600' }}>
                {movementData.status === 'active' ? 'Active' : 
                 movementData.status === 'inactive' ? 'No Movement' : 
                 'Unusual Activity'}
              </h4>
              <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px' }}>
                {movementData.status === 'active' ? 'Great job staying active!' : 
                 movementData.status === 'inactive' ? 'Try to move around a bit' : 
                 'Your movement pattern has changed'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px' }}>
            <Clock size={16} />
            <span>Last movement: {Math.round((Date.now() - movementData.lastMovement) / 60000)} minutes ago</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Safe Zone</h3>
          </div>
          
          {enabledSafeZone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '14px', 
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={24} color="#10B981" />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{enabledSafeZone.name}</h4>
                <p style={{ color: '#64748B', fontSize: '14px' }}>{enabledSafeZone.radius} km radius • Active</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
              <Shield size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
              <p>No safe zone set</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Daily Tips</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
            <Activity size={18} color="#10B981" />
            <span style={{ fontSize: '14px' }}>Aim for 5,000-10,000 steps daily</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
            <Clock size={18} color="#3B82F6" />
            <span style={{ fontSize: '14px' }}>Take short walks every 1-2 hours</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
            <Shield size={18} color="#8B5CF6" />
            <span style={{ fontSize: '14px' }}>Stay within your safe zone for safety</span>
          </div>
        </div>
      </div>
    </div>
  );
};
