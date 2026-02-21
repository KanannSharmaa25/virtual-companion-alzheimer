import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, Check, User, Siren, ChevronUp, ChevronDown } from 'lucide-react';
import { useData, useUser } from '../context/AppContext';
import type { EmergencyAlert, AlertType } from '../types';
import './EmergencyAlertAlarm.css';

const alertTypeLabels: Record<AlertType, string> = {
  inactivity: 'Inactivity Alert',
  safe_zone: 'Safe Zone Breach',
  fall: 'Fall Detected',
  sos: 'SOS Emergency',
  low_battery: 'Low Battery Alert',
};

const alertTypeColors: Record<AlertType, string> = {
  inactivity: '#F59E0B',
  safe_zone: '#EF4444',
  fall: '#DC2626',
  sos: '#DC2626',
  low_battery: '#F59E0B',
};

interface EmergencyAlertAlarmProps {
  alert: EmergencyAlert;
  onAcknowledge: (id: string) => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
}

export const EmergencyAlertAlarm: React.FC<EmergencyAlertAlarmProps> = ({
  alert,
  onAcknowledge,
  onEscalate,
  onResolve,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  useEffect(() => {
    const playAlarm = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.frequency.value = 2;
      lfoGain.gain.value = 0.2;
      
      oscillator.start();
      lfo.start();
      
      return () => {
        oscillator.stop();
        lfo.stop();
      };
    };

    const cleanup = playAlarm();
    return cleanup;
  }, []);

  useEffect(() => {
    if (!isAcknowledged && alert.status === 'active') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAcknowledged, alert.status]);

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    onAcknowledge(alert.id);
  };

  const handleEscalate = () => {
    onEscalate(alert.id);
  };

  const handleResolve = () => {
    onResolve(alert.id);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeSinceAlert = () => {
    const seconds = Math.floor((Date.now() - alert.timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  const getLevelBadge = () => {
    const levelColors: Record<string, string> = {
      caregiver: '#F59E0B',
      family: '#EF4444',
      emergency: '#DC2626',
    };
    const levelLabels: Record<string, string> = {
      caregiver: 'CAREGIVER',
      family: 'FAMILY',
      emergency: 'EMERGENCY',
    };
    return (
      <span 
        className="level-badge"
        style={{ backgroundColor: levelColors[alert.level] }}
      >
        {levelLabels[alert.level]}
      </span>
    );
  };

  return (
    <div className="emergency-alarm-overlay">
      <div className="emergency-alarm-container">
        <div 
          className="emergency-alarm-header"
          style={{ backgroundColor: alertTypeColors[alert.type] }}
        >
          <div className="alarm-icon-container">
            <Siren size={48} className="alarm-icon" />
          </div>
          <h1 className="alarm-title">EMERGENCY ALERT</h1>
          <div className="alert-type-label">{alertTypeLabels[alert.type]}</div>
          {getLevelBadge()}
        </div>

        <div className="emergency-alarm-body">
          <div className="alert-message-box">
            <h2>{alert.title}</h2>
            <p>{alert.message}</p>
            <div className="alert-meta">
              <span><Clock size={16} /> {getTimeSinceAlert()}</span>
              {alert.location && (
                <span><MapPin size={16} /> Location available</span>
              )}
            </div>
            {alert.isOffline && (
              <div className="offline-indicator">
                <AlertTriangle size={16} /> Offline Alert - Stored locally
              </div>
            )}
          </div>

          <div className="escalation-info">
            <div className="escalation-level">
              <span className="label">Current Level:</span>
              <span className="value" style={{ color: alertTypeColors[alert.type] }}>
                {alert.level === 'caregiver' ? 'Caregiver' : alert.level === 'family' ? 'Family Member' : 'Emergency Services'}
              </span>
            </div>
            {alert.escalatedTo && (
              <div className="escalated-to">
                <span className="label">Escalated to:</span>
                <span className="value">{alert.escalatedTo}</span>
              </div>
            )}
          </div>

          <button 
            className="details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <div className="alert-details">
              <div className="detail-row">
                <User size={16} />
                <span>Alert ID: {alert.id}</span>
              </div>
              <div className="detail-row">
                <Clock size={16} />
                <span>Timestamp: {new Date(alert.timestamp).toLocaleString()}</span>
              </div>
              {alert.acknowledgedBy && (
                <div className="detail-row">
                  <Check size={16} />
                  <span>Acknowledged by: {alert.acknowledgedBy} at {alert.acknowledgedAt ? formatTime(alert.acknowledgedAt) : 'N/A'}</span>
                </div>
              )}
              {alert.status === 'escalated' && alert.escalatedAt && (
                <div className="detail-row">
                  <AlertTriangle size={16} />
                  <span>Escalated at: {formatTime(alert.escalatedAt)}</span>
                </div>
              )}
            </div>
          )}

          <div className="emergency-actions">
            {!isAcknowledged && alert.status === 'active' && (
              <button 
                className="btn-acknowledge"
                onClick={handleAcknowledge}
              >
                <Check size={24} /> Acknowledge
              </button>
            )}

            {alert.status === 'acknowledged' && (
              <>
                <button 
                  className="btn-escalate"
                  onClick={handleEscalate}
                >
                  <AlertTriangle size={20} /> Escalate Alert
                </button>
                <button 
                  className="btn-resolve"
                  onClick={handleResolve}
                >
                  <Check size={20} /> Resolve Alert
                </button>
              </>
            )}

            {alert.status === 'escalated' && (
              <button 
                className="btn-resolve"
                onClick={handleResolve}
              >
                <Check size={20} /> Resolve Alert
              </button>
            )}
          </div>

          {alert.status === 'active' && (
            <div className="auto-escalate-timer">
              <span>Auto-escalation in: </span>
              <strong>{countdown}s</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmergencyAlarmManager: React.FC = () => {
  const { emergencyAlerts, acknowledgeAlert, escalateAlert, resolveAlert } = useData();
  const { user } = useUser();

  const activeAlert = emergencyAlerts.find(
    (a: EmergencyAlert) => a.status === 'active' || a.status === 'acknowledged' || a.status === 'escalated'
  );

  if (!activeAlert || user?.role !== 'caregiver') return null;

  return (
    <EmergencyAlertAlarm
      alert={activeAlert}
      onAcknowledge={(id) => acknowledgeAlert(id, user?.name || 'Caregiver')}
      onEscalate={escalateAlert}
      onResolve={resolveAlert}
    />
  );
};
