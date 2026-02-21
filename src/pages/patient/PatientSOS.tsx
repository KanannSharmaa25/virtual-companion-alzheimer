import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '../../components/Button';
import { useData } from '../../context/AppContext';
import './PatientSOS.css';

export const PatientSOS: React.FC = () => {
  const [countdown, setCountdown] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const { triggerSOS, emergencySettings } = useData();

  const handleSOS = () => {
    if (!emergencySettings.sosAlertsEnabled) {
      alert('SOS alerts are currently disabled by your caregiver.');
      return;
    }
    setIsActivated(true);
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isActivated) {
      triggerSOS();
      alert('Emergency alert sent to your family!');
      setIsActivated(false);
    }
  }, [countdown, isActivated, triggerSOS]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Emergency SOS</h1>
        <p>Get help when you need it</p>
      </div>

      <div className="sos-container">
        {!isActivated ? (
          <>
            <div className="sos-icon-large">
              <AlertCircle size={64} color="#EF4444" />
            </div>
            <h2>Need Help?</h2>
            <p className="sos-description">
              Press the button below to send an emergency alert to all your family members with your current location.
            </p>
            <button className="sos-button-large" onClick={handleSOS}>
              <AlertCircle size={48} color="#FFFFFF" />
              <span>PRESS FOR EMERGENCY</span>
            </button>
          </>
        ) : (
          <>
            <div className="sos-countdown-container">
              <AlertCircle size={80} color="#EF4444" />
              <div className="sos-countdown">{countdown}</div>
              <h3>Sending Alert...</h3>
            </div>
            <Button variant="outline" onClick={() => { setIsActivated(false); setCountdown(0); }}>
              Cancel
            </Button>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>What happens when you send SOS?</h3>
        <div className="info-list">
          <div className="info-item">
            <MapPin size={20} color="#10B981" />
            <span>Your current location is sent to all family members</span>
          </div>
          <div className="info-item">
            <Users size={20} color="#10B981" />
            <span>All linked caregivers receive an instant notification</span>
          </div>
          <div className="info-item">
            <Clock size={20} color="#10B981" />
            <span>Alert includes the exact time of emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
