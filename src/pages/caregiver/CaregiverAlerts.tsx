import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Battery, Shield, Activity, MapPin, User, Phone } from 'lucide-react';
import { useData, useUser } from '../../context/AppContext';
import type { AlertType, AlertStatus, AlertLevel } from '../../types';
import './CaregiverDashboard.css';

interface AlertDisplay {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: number;
  status: AlertStatus;
  level: AlertLevel;
  location?: { lat: number; lng: number };
  isOffline?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  escalatedTo?: string;
  escalatedAt?: number;
  resolvedAt?: number;
}

export const CaregiverAlerts: React.FC = () => {
  const { linkedPatient, emergencyAlerts, acknowledgeAlert, escalateAlert, resolveAlert, emergencySettings } = useData();
  const { user } = useUser();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const displayPatient = linkedPatient || { name: 'Demo Patient' };

  const getAlertTypeIcon = (type: AlertType) => {
    switch(type) {
      case 'fall': return AlertTriangle;
      case 'inactivity': return Activity;
      case 'safe_zone': return Shield;
      case 'sos': return AlertTriangle;
      case 'low_battery': return Battery;
      default: return AlertTriangle;
    }
  };

  const getAlertTypeColor = (type: AlertType) => {
    switch(type) {
      case 'fall': return '#DC2626';
      case 'sos': return '#DC2626';
      case 'inactivity': return '#F59E0B';
      case 'safe_zone': return '#EF4444';
      case 'low_battery': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return '#DC2626';
      case 'acknowledged': return '#F59E0B';
      case 'escalated': return '#EF4444';
      case 'resolved': return '#10B981';
      default: return '#64748B';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredAlerts = emergencyAlerts.filter((alert: AlertDisplay) => {
    if (filter === 'active') return alert.status !== 'resolved';
    if (filter === 'resolved') return alert.status === 'resolved';
    return true;
  });

  const mockAlerts: AlertDisplay[] = [
    { id: 'legacy-1', type: 'fall', message: 'Possible fall detected', timestamp: Date.now() - 7200000, status: 'active', level: 'caregiver', title: 'Fall Detected' },
    { id: 'legacy-2', type: 'safe_zone', message: 'Left safe zone: Home', timestamp: Date.now() - 18000000, status: 'resolved', level: 'caregiver', title: 'Safe Zone Breach' },
    { id: 'legacy-3', type: 'low_battery', message: 'Battery low (15%)', timestamp: Date.now() - 86400000, status: 'resolved', level: 'caregiver', title: 'Low Battery' },
  ];

  const allEmergencyAlerts: AlertDisplay[] = [...filteredAlerts, ...mockAlerts].sort((a, b) => b.timestamp - a.timestamp);

  const activeCount = emergencyAlerts.filter((a: AlertDisplay) => a.status === 'active').length;
  const escalatedCount = emergencyAlerts.filter((a: AlertDisplay) => a.status === 'escalated').length;
  const resolvedCount = emergencyAlerts.filter((a: AlertDisplay) => a.status === 'resolved').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Alert Center</h1>
        <p>Monitor and manage all alerts for {displayPatient.name}</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-label">Active Alerts</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Shield size={24} />
          </div>
          <div className="stat-value">{escalatedCount}</div>
          <div className="stat-label">Escalated</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{resolvedCount}</div>
          <div className="stat-label">Resolved</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Phone size={24} />
          </div>
          <div className="stat-value">{emergencySettings.emergencyContacts?.length || 0}</div>
          <div className="stat-label">Contacts</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            background: filter === 'all' ? '#3B82F6' : '#F1F5F9',
            color: filter === 'all' ? 'white' : '#64748B',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '8px 16px',
            background: filter === 'active' ? '#DC2626' : '#F1F5F9',
            color: filter === 'active' ? 'white' : '#64748B',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('resolved')}
          style={{
            padding: '8px 16px',
            background: filter === 'resolved' ? '#10B981' : '#F1F5F9',
            color: filter === 'resolved' ? 'white' : '#64748B',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Resolved
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Emergency Alerts</h3>
          <span style={{ fontSize: '14px', color: '#64748B' }}>{allEmergencyAlerts.length} alerts</span>
        </div>

        {allEmergencyAlerts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allEmergencyAlerts.map((alert) => {
              const Icon = getAlertTypeIcon(alert.type);
              const color = getAlertTypeColor(alert.type);
              
              return (
                <div 
                  key={alert.id}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    background: alert.status === 'resolved' ? '#F8FAFC' : `${color}08`,
                    borderRadius: '12px',
                    borderLeft: `4px solid ${color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={24} color={color} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{alert.title}</h4>
                        <span style={{ 
                          background: getStatusColor(alert.status), 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>{alert.status}</span>
                        <span style={{ 
                          background: color, 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>{alert.level}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>{alert.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', color: '#6B7280', fontSize: '13px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {formatTime(alert.timestamp)}
                        </span>
                        {alert.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            Location available
                          </span>
                        )}
                        {alert.isOffline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                            <AlertTriangle size={14} />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {alert.status === 'active' && (
                        <button 
                          onClick={() => acknowledgeAlert(alert.id, user?.name || 'Caregiver')}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            padding: '8px 16px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          <CheckCircle size={16} />
                          Acknowledge
                        </button>
                      )}
                      {(alert.status === 'acknowledged' || alert.status === 'escalated') && (
                        <>
                          {alert.status !== 'escalated' && (
                            <button 
                              onClick={() => escalateAlert(alert.id)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                padding: '8px 16px',
                                background: '#F59E0B',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              <User size={16} />
                              Escalate
                            </button>
                          )}
                          <button 
                            onClick={() => resolveAlert(alert.id)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              padding: '8px 16px',
                              background: '#3B82F6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle size={16} />
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#F1F5F9',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: '#64748B',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {expandedAlert === alert.id ? 'Hide Details' : 'Show Details'}
                  </button>

                  {expandedAlert === alert.id && (
                    <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', marginLeft: '64px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                        <div><strong>Alert ID:</strong> {alert.id}</div>
                        <div><strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}</div>
                        {alert.acknowledgedBy && (
                          <div><strong>Acknowledged by:</strong> {alert.acknowledgedBy}</div>
                        )}
                        {alert.acknowledgedAt && (
                          <div><strong>Acknowledged at:</strong> {new Date(alert.acknowledgedAt).toLocaleString()}</div>
                        )}
                        {alert.escalatedTo && (
                          <div><strong>Escalated to:</strong> {alert.escalatedTo}</div>
                        )}
                        {alert.escalatedAt && (
                          <div><strong>Escalated at:</strong> {new Date(alert.escalatedAt).toLocaleString()}</div>
                        )}
                        {alert.resolvedAt && (
                          <div><strong>Resolved at:</strong> {new Date(alert.resolvedAt).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
            <h3>No Alerts</h3>
            <p style={{ color: '#64748B' }}>All clear! No alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
