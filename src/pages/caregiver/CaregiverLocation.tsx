import React from 'react';
import { MapPin, RefreshCw, Clock, UserPlus, Battery } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './CaregiverLocation.css';

export const CaregiverLocation: React.FC = () => {
  const { distanceAlert, updateDistanceAlert, linkedPatient, patientLocation, patientBattery, caregiverLocation } = useData();
  
  const calculateDistance = () => {
    if (!patientLocation || !caregiverLocation) return 0;
    const R = 6371;
    const dLat = (patientLocation.lat - caregiverLocation.lat) * Math.PI / 180;
    const dLon = (patientLocation.lng - caregiverLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(caregiverLocation.lat * Math.PI / 180) * Math.cos(patientLocation.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const currentDistance = calculateDistance();
  const isOverLimit = distanceAlert.enabled && currentDistance > distanceAlert.maxDistance;
  const lowBattery = patientBattery.level < 20;
  const criticalBattery = patientBattery.level < 10;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Live Location</h1>
        <p>{linkedPatient ? `Track ${linkedPatient.name}'s real-time location` : 'Link a patient to track location'}</p>
      </div>

      {!linkedPatient ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <UserPlus size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '12px' }}>No Patient Linked</h2>
          <p style={{ color: '#64748B' }}>Link a patient to start tracking their location</p>
        </div>
      ) : (
        <>
          {lowBattery && (
            <div className={criticalBattery ? "alert-banner" : "warning-banner"}>
              <Battery size={24} />
              <div>
                <strong>{criticalBattery ? 'Critical Battery!' : 'Low Battery Alert'}</strong>
                <p>Patient's device battery is at {patientBattery.level}%</p>
              </div>
            </div>
          )}

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-icon blue">
                <MapPin size={24} />
              </div>
              <div className="stat-value">
                {patientLocation ? 'Located' : 'Unknown'}
              </div>
              <div className="stat-label">Current Status</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Clock size={24} />
              </div>
              <div className="stat-value">
                {patientLocation ? 'Just now' : 'N/A'}
              </div>
              <div className="stat-label">Last Update</div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${isOverLimit ? 'red' : 'green'}`}>
                <MapPin size={24} />
              </div>
              <div className="stat-value">
                {currentDistance.toFixed(1)} km
              </div>
              <div className="stat-label">From You</div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${lowBattery ? 'red' : patientBattery.isCharging ? 'green' : 'orange'}`}>
                <Battery size={24} />
              </div>
              <div className="stat-value" style={{ color: lowBattery ? '#EF4444' : undefined }}>
                {patientBattery.level}%
              </div>
              <div className="stat-label">
                {patientBattery.isCharging ? 'Charging' : 'Battery'}
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Location Map</h3>
                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>

              <div className="map-view-large">
                <MapPin size={60} color="#10B981" />
                <p>Map View</p>
                <span>
                  {patientLocation 
                    ? `${patientLocation.lat.toFixed(4)}° N, ${patientLocation.lng.toFixed(4)}° W`
                    : 'Location unavailable'
                  }
                </span>
              </div>
            </div>

            <div className="card">
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

              <div className="distance-display">
                <div className="distance-circle" style={{ 
                  background: `conic-gradient(${isOverLimit ? '#EF4444' : '#10B981'} ${distanceAlert.enabled ? (currentDistance / distanceAlert.maxDistance) * 100 : 0}%, #E2E8F0 0%)` 
                }}>
                  <div className="distance-inner">
                    <span className="distance-value">{currentDistance.toFixed(1)}</span>
                    <span className="distance-unit">km</span>
                  </div>
                </div>
                <p>Alert if patient is more than {distanceAlert.maxDistance} km away</p>
              </div>

              {distanceAlert.enabled && (
                <div className="distance-slider-section">
                  <label>Max distance: {distanceAlert.maxDistance} km</label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={distanceAlert.maxDistance}
                    onChange={(e) => updateDistanceAlert({ maxDistance: parseInt(e.target.value) })}
                    className="slider"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Location History</h3>
            </div>
            <div className="history-links">
              <button className="history-link">
                <Clock size={18} />
                <span>Last 24 Hours</span>
              </button>
              <button className="history-link">
                <Clock size={18} />
                <span>Last 7 Days</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
