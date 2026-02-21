import React, { useState } from 'react';
import { MapPin, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useData, useUser } from '../../context/AppContext';
import { PasswordModal } from '../../components/PasswordModal';
import './PatientHome.css';

export const PatientLocation: React.FC = () => {
  const { safeZones, familyMembers, locationSharing, setLocationSharing } = useData();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  
  const enabledSafeZone = safeZones.find(z => z.enabled);

  const handleToggleSharing = (enable: boolean) => {
    if (enable) {
      setLocationSharing(true);
    } else {
      setPendingToggle(false);
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSuccess = () => {
    if (pendingToggle === false) {
      setLocationSharing(false);
    }
    setShowPasswordModal(false);
    setPendingToggle(null);
    setError('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Location</h1>
        <p>View your current location and safe zones</p>
      </div>

      <div className="location-map">
        <div style={{ fontSize: '60px', marginBottom: '8px' }}>📍</div>
        <p>Map View</p>
        <span>Your location is {locationSharing ? 'shared with family' : 'private'}</span>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <h3 className="card-title">Safe Zone</h3>
          </div>
          {enabledSafeZone ? (
            <div className="status-badge safe">
              <span>●</span> Active
            </div>
          ) : (
            <div className="status-badge warning">
              <span>○</span> Not Set
            </div>
          )}
        </div>
        {enabledSafeZone ? (
          <p style={{ color: '#64748B', fontSize: '15px' }}>
            You're currently within {enabledSafeZone.radius} km of {enabledSafeZone.name}
          </p>
        ) : (
          <p style={{ color: '#64748B', fontSize: '15px' }}>
            Ask your caregiver to set up a safe zone for you
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <h3 className="card-title">Family Nearby</h3>
        </div>
        
        {familyMembers.length > 0 ? (
          <div className="family-list">
            {familyMembers.map((member) => (
              <div key={member.id} className="family-item">
                <div className="family-avatar">
                  {member.name.charAt(0)}
                </div>
                <div className="family-info">
                  <span className="family-name">{member.name}</span>
                  <span className={`family-status ${member.isOnline ? 'online' : ''}`}>
                    {member.isOnline ? '● Online' : '○ Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B', textAlign: 'center', padding: '24px' }}>
            No family members added yet
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header">
          <h3 className="card-title"><MapPin size={20} /> Location Sharing</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {locationSharing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '14px' }}>
                <CheckCircle size={16} /> Active
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontSize: '14px' }}>
                <AlertCircle size={16} /> Off
              </span>
            )}
          </div>
        </div>
        
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '16px' }}>
            {locationSharing 
              ? 'Your location is being shared with your family members. Your caregiver can see where you are.'
              : 'Your location is private and not shared with anyone. Your caregiver will not be able to see your location.'
            }
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleToggleSharing(true)}
              disabled={locationSharing}
              style={{
                padding: '12px 20px',
                background: locationSharing ? '#10B981' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: locationSharing ? 'default' : 'pointer',
                opacity: locationSharing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={18} /> Enable Sharing
            </button>
            
            <button
              onClick={() => handleToggleSharing(false)}
              disabled={!locationSharing}
              style={{
                padding: '12px 20px',
                background: !locationSharing ? '#F1F5F9' : '#EF4444',
                color: !locationSharing ? '#94A3B8' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: !locationSharing ? 'default' : 'pointer',
                opacity: !locationSharing ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Lock size={18} /> Disable Sharing (Requires Password)
            </button>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#F8FAFC', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Lock size={18} color="#64748B" style={{ marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              <strong>Security Note:</strong> To turn off location sharing, your caregiver's password is required. 
              This ensures only authorized people can disable location tracking.
            </div>
          </div>
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); setError(''); }}
        onSuccess={handlePasswordSuccess}
        title="Verify Caregiver Password"
        message="Please ask your caregiver to enter their password to disable location sharing."
        error={error}
      />
    </div>
  );
};
