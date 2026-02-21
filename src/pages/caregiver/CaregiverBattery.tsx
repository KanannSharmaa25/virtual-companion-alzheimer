import React from 'react';
import { Battery, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './CaregiverDashboard.css';

export const CaregiverBattery: React.FC = () => {
  const { patientBattery, linkedPatient } = useData();

  const displayPatient = linkedPatient || { name: 'Demo Patient' };
  const displayBattery = linkedPatient ? patientBattery : { level: 72, isCharging: false, lastUpdate: Date.now() };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return '#EF4444';
    if (level <= 50) return '#F59E0B';
    return '#10B981';
  };

  const getBatteryStatus = (level: number, isCharging: boolean) => {
    if (isCharging) return { text: 'Charging', color: '#3B82F6' };
    if (level <= 20) return { text: 'Low Battery - Please Charge', color: '#EF4444' };
    if (level <= 50) return { text: 'Medium Battery', color: '#F59E0B' };
    return { text: 'Good Battery Level', color: '#10B981' };
  };

  const status = getBatteryStatus(displayBattery.level, displayBattery.isCharging);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Battery Monitoring</h1>
        <p>Monitor {displayPatient.name}'s device battery</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '40px',
          background: `${getBatteryColor(displayBattery.level)}15`,
          borderRadius: '16px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Battery size={80} color={getBatteryColor(displayBattery.level)} />
            <div style={{ 
              fontSize: '64px', 
              fontWeight: '700', 
              color: getBatteryColor(displayBattery.level),
              marginTop: '16px'
            }}>
              {displayBattery.level}%
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              color: status.color,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {displayBattery.isCharging ? <Zap size={20} /> : null}
              {status.text}
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className={`stat-icon ${displayBattery.level <= 20 ? 'red' : displayBattery.level <= 50 ? 'orange' : 'green'}`}>
            <Battery size={24} />
          </div>
          <div className="stat-value">{displayBattery.level}%</div>
          <div className="stat-label">Current Level</div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${displayBattery.isCharging ? 'blue' : 'gray'}`}>
            <Zap size={24} />
          </div>
          <div className="stat-value">{displayBattery.isCharging ? 'Yes' : 'No'}</div>
          <div className="stat-label">Charging</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Clock size={24} />
          </div>
          <div className="stat-value">
            {displayBattery.lastUpdate ? new Date(displayBattery.lastUpdate).toLocaleTimeString() : 'N/A'}
          </div>
          <div className="stat-label">Last Update</div>
        </div>
      </div>

      {displayBattery.level <= 20 && !displayBattery.isCharging && (
        <div className="alert-banner" style={{ marginTop: '24px' }}>
          <AlertTriangle size={24} />
          <div>
            <strong>Low Battery Alert!</strong>
            <p>{displayPatient.name}'s device battery is at {displayBattery.level}%. Please remind them to charge or check on them.</p>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Battery Alerts</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F8FAFC',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Battery size={20} color="#64748B" />
              <span>Alert when battery below 20%</span>
            </div>
            <CheckCircle size={20} color="#10B981" />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F8FAFC',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap size={20} color="#64748B" />
              <span>Alert when battery is critically low (10%)</span>
            </div>
            <CheckCircle size={20} color="#10B981" />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px',
            background: '#F8FAFC',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} color="#64748B" />
              <span>Alert when device is powered off</span>
            </div>
            <CheckCircle size={20} color="#10B981" />
          </div>
        </div>
      </div>
    </div>
  );
};
