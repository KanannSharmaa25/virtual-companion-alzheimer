import React, { useState } from 'react';
import { User, Shield, Key, Save, Check, X, Trash2, AlertTriangle, Activity, WifiOff, MapPin, Navigation } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import { EmergencyContactManager } from '../../components/EmergencyContactManager';
import './CaregiverDashboard.css';

export const CaregiverSettings: React.FC = () => {
  const { user, verifyCaregiverPassword, updateCaregiverPassword, logout } = useUser();
  const { linkedPatient, setLinkedPatient, caregiverProfile, emergencySettings, updateEmergencySettings, distanceAlert, updateDistanceAlert, caregiverLocation, setCaregiverLocation, patientLocation } = useData();
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [showLinkPatient, setShowLinkPatient] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'name' | 'id'>('id');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientRelation, setPatientRelation] = useState('');
  const [linkError, setLinkError] = useState('');

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetPassword, setResetPassword] = useState('');

  const [showEmergencySettings, setShowEmergencySettings] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    enabled: emergencySettings.enabled,
    inactivityEnabled: emergencySettings.inactivityEnabled,
    inactivityTimeout: emergencySettings.inactivityTimeout,
    safeZoneAlertsEnabled: emergencySettings.safeZoneAlertsEnabled,
    fallAlertsEnabled: emergencySettings.fallAlertsEnabled,
    sosAlertsEnabled: emergencySettings.sosAlertsEnabled,
    caregiverResponseTimeout: emergencySettings.caregiverResponseTimeout,
    familyResponseTimeout: emergencySettings.familyResponseTimeout,
    isOfflineMode: emergencySettings.isOfflineMode,
  });

  const [showDistanceSettings, setShowDistanceSettings] = useState(false);
  const [distanceForm, setDistanceForm] = useState({
    enabled: distanceAlert.enabled,
    maxDistance: distanceAlert.maxDistance,
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    updateCaregiverPassword(newPassword);
    setPasswordSuccess('Caregiver password changed successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  const handleLinkPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');

    if (linkMethod === 'id') {
      const patientId = patientIdInput.trim().toUpperCase();
      const patientRegistry = JSON.parse(localStorage.getItem('patientRegistry') || '{}');
      const patient = patientRegistry[patientId];

      if (!patient) {
        setLinkError('Patient ID not found. Please ask the patient to open their AI Companion first to generate an ID.');
        return;
      }

      patient.linked = true;
      patientRegistry[patientId] = patient;
      localStorage.setItem('patientRegistry', JSON.stringify(patientRegistry));

      setLinkedPatient({
        id: patientId,
        name: patient.name || 'Patient',
        relation: patientRelation || 'Patient',
        linkedAt: Date.now(),
        patientId: patientId,
      });
    } else {
      if (!patientName.trim()) return;
      setLinkedPatient({
        id: Date.now().toString(),
        name: patientName,
        relation: patientRelation || 'Patient',
        linkedAt: Date.now(),
      });
    }
    setShowLinkPatient(false);
    setPatientIdInput('');
    setPatientName('');
    setPatientRelation('');
  };

  const handleUnlinkPatient = () => {
    if (confirm('Are you sure you want to unlink this patient?')) {
      setLinkedPatient(null);
    }
  };

  const handleEmergencySettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencySettings(emergencyForm);
    setShowEmergencySettings(false);
  };

  const handleDistanceSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDistanceAlert(distanceForm);
    setShowDistanceSettings(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCaregiverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          });
          alert('Location updated! Distance alerts will now be based on your current position.');
        },
        (error) => {
          alert('Unable to get location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const calculateDistance = () => {
    if (!patientLocation || !caregiverLocation) return null;
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title"><User size={20} /> Account Information</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 0' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Name</label>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{user?.name}</div>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Email</label>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{user?.email}</div>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Role</label>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>Caregiver</div>
          </div>
          <div>
            <label style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Relationship to Patient</label>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{caregiverProfile?.relationToPatient || 'Not set'}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title"><Shield size={20} /> Linked Patient</h3>
        </div>
        
        {linkedPatient ? (
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{linkedPatient.name}</div>
                <div style={{ fontSize: '14px', color: '#64748B' }}>{linkedPatient.relation} • Linked {new Date(linkedPatient.linkedAt).toLocaleDateString()}</div>
                {linkedPatient.patientId && (
                  <div style={{ fontSize: '13px', color: '#3B82F6', marginTop: '4px' }}>
                    Patient ID: {linkedPatient.patientId}
                  </div>
                )}
              </div>
              <button 
                onClick={handleUnlinkPatient}
                style={{ 
                  padding: '8px 16px', 
                  background: '#FEE2E2', 
                  color: '#DC2626', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Unlink Patient
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px 0' }}>
            <p style={{ color: '#64748B', marginBottom: '16px' }}>No patient linked yet.</p>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.alert('Click registered! Opening form...');
                setShowLinkPatient(true);
              }}
              className="btn btn-primary"
            >
              Link Patient (Click Me)
            </button>
          </div>
        )}

        {showLinkPatient && (
          <form onSubmit={handleLinkPatient} style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setLinkMethod('id'); setLinkError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: linkMethod === 'id' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                  background: linkMethod === 'id' ? '#EFF6FF' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: linkMethod === 'id' ? '600' : '400',
                }}
              >
                Link by Patient ID
              </button>
              <button
                type="button"
                onClick={() => { setLinkMethod('name'); setLinkError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: linkMethod === 'name' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                  background: linkMethod === 'name' ? '#EFF6FF' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: linkMethod === 'name' ? '600' : '400',
                }}
              >
                Link by Name
              </button>
            </div>

            {linkMethod === 'id' ? (
              <div className="form-group">
                <label>Patient ID</label>
                <input
                  type="text"
                  placeholder="Enter 6-character Patient ID (e.g., ABC123)"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}
                />
                <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Ask the patient for their Patient ID shown in their AI Companion chat
                </span>
              </div>
            ) : (
              <div className="form-group">
                <label>Patient's Name</label>
                <input
                  type="text"
                  placeholder="Enter patient's name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Relationship to Patient</label>
              <input
                type="text"
                placeholder="e.g., Son, Daughter, Caregiver"
                value={patientRelation}
                onChange={(e) => setPatientRelation(e.target.value)}
              />
            </div>

            {linkError && (
              <div style={{ color: '#DC2626', marginBottom: '16px', fontSize: '14px' }}>
                {linkError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                Link Patient
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setShowLinkPatient(false); setLinkError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ border: '2px solid #3B82F6' }}>
        <div className="card-header">
          <h3 className="card-title"><Navigation size={20} /> Distance Alert</h3>
        </div>
        
        <p style={{ color: '#64748B', marginBottom: '16px' }}>
          Get alerted when the patient goes beyond a certain distance from your current location.
        </p>

        {patientLocation && caregiverLocation && (
          <div style={{ padding: '12px', background: '#EFF6FF', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Current distance to patient:</span>
              <span style={{ fontWeight: '700', color: '#3B82F6', fontSize: '18px' }}>
                {currentDistance?.toFixed(2)} km
              </span>
            </div>
          </div>
        )}

        {!caregiverLocation && (
          <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ color: '#92400E', margin: 0, fontSize: '14px' }}>
              ⚠️ Set your location first to enable distance alerts
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button 
            onClick={getCurrentLocation}
            className="btn btn-primary"
          >
            <MapPin size={18} /> {caregiverLocation ? 'Update My Location' : 'Set My Location'}
          </button>
          <button 
            onClick={() => { setShowDistanceSettings(true); setDistanceForm({ enabled: distanceAlert.enabled, maxDistance: distanceAlert.maxDistance }); }}
            className="btn btn-secondary"
            disabled={!caregiverLocation}
          >
            <Navigation size={18} /> Configure Distance Alert
          </button>
        </div>

        {distanceAlert.enabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#ECFDF5', borderRadius: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ color: '#065F46', fontWeight: '600' }}>
              Distance Alert Active: {distanceAlert.maxDistance} km
            </span>
          </div>
        )}

        {showDistanceSettings && (
          <form onSubmit={handleDistanceSettingsSave} style={{ marginTop: '16px', padding: '16px', background: '#F8FAFC', borderRadius: '12px' }}>
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="distanceEnabled"
                checked={distanceForm.enabled}
                onChange={(e) => setDistanceForm({ ...distanceForm, enabled: e.target.checked })}
              />
              <label htmlFor="distanceEnabled" style={{ fontWeight: 600 }}>
                Enable Distance Alert
              </label>
            </div>

            {distanceForm.enabled && (
              <div className="form-group">
                <label>Maximum Distance (km)</label>
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={distanceForm.maxDistance}
                  onChange={(e) => setDistanceForm({ ...distanceForm, maxDistance: parseFloat(e.target.value) || 5 })}
                  required
                />
                <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  You will be alerted if the patient is more than {distanceForm.maxDistance} km away
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Settings
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDistanceSettings(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Shield size={20} /> Caregiver Password</h3>
        </div>
        
        <p style={{ color: '#64748B', marginBottom: '16px' }}>
          This password is used to verify important patient actions like logout.
        </p>

        <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '14px' }}>
          <strong>Current caregiver password:</strong> {localStorage.getItem('caregiverPassword') || 'Not set'}
        </p>

        {!showPasswordChange ? (
          <button 
            onClick={() => setShowPasswordChange(true)}
            className="btn btn-primary"
          >
            <Key size={18} /> Change Caregiver Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && (
              <div style={{ color: '#DC2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={18} /> {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} /> {passwordSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save New Password
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => { setShowPasswordChange(false); setPasswordError(''); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ border: '2px solid #DC2626' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#DC2626' }}><Shield size={20} /> Emergency Alert System</h3>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: emergencySettings.enabled ? '#ECFDF5' : '#FEF3C7', borderRadius: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: emergencySettings.enabled ? '#10B981' : '#F59E0B' 
          }} />
          <span style={{ fontWeight: 600, color: emergencySettings.enabled ? '#065F46' : '#92400E' }}>
            {emergencySettings.enabled ? 'Emergency System Active' : 'Emergency System Disabled'}
          </span>
        </div>

        {!showEmergencySettings ? (
          <button 
            onClick={() => { setShowEmergencySettings(true); setEmergencyForm({ enabled: emergencySettings.enabled, inactivityEnabled: emergencySettings.inactivityEnabled, inactivityTimeout: emergencySettings.inactivityTimeout, safeZoneAlertsEnabled: emergencySettings.safeZoneAlertsEnabled, fallAlertsEnabled: emergencySettings.fallAlertsEnabled, sosAlertsEnabled: emergencySettings.sosAlertsEnabled, caregiverResponseTimeout: emergencySettings.caregiverResponseTimeout, familyResponseTimeout: emergencySettings.familyResponseTimeout, isOfflineMode: emergencySettings.isOfflineMode }); }}
            className="btn btn-primary"
          >
            <Activity size={18} /> Configure Emergency Settings
          </button>
        ) : (
          <form onSubmit={handleEmergencySettingsSave} style={{ marginTop: '16px' }}>
            <div className="form-group checkbox" style={{ marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="emergencyEnabled"
                checked={emergencyForm.enabled}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, enabled: e.target.checked })}
              />
              <label htmlFor="emergencyEnabled" style={{ fontWeight: 600, fontSize: '16px' }}>
                Enable Emergency Alert System
              </label>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>Alert Triggers</h4>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="inactivityEnabled"
                  checked={emergencyForm.inactivityEnabled}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, inactivityEnabled: e.target.checked })}
                />
                <label htmlFor="inactivityEnabled">Inactivity Detection</label>
              </div>

              {emergencyForm.inactivityEnabled && (
                <div className="form-group" style={{ marginLeft: '28px' }}>
                  <label>Inactivity Timeout (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={emergencyForm.inactivityTimeout}
                    onChange={(e) => setEmergencyForm({ ...emergencyForm, inactivityTimeout: parseInt(e.target.value) || 60 })}
                    style={{ width: '100px' }}
                  />
                </div>
              )}

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="safeZoneAlerts"
                  checked={emergencyForm.safeZoneAlertsEnabled}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, safeZoneAlertsEnabled: e.target.checked })}
                />
                <label htmlFor="safeZoneAlerts">Safe Zone Breach Alerts</label>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="fallAlerts"
                  checked={emergencyForm.fallAlertsEnabled}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, fallAlertsEnabled: e.target.checked })}
                />
                <label htmlFor="fallAlerts">Fall Detection</label>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="sosAlerts"
                  checked={emergencyForm.sosAlertsEnabled}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, sosAlertsEnabled: e.target.checked })}
                />
                <label htmlFor="sosAlerts">SOS Button Alerts</label>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>Auto-Escalation</h4>
              
              <div className="form-group">
                <label>Caregiver Response Timeout (seconds)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={emergencyForm.caregiverResponseTimeout}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, caregiverResponseTimeout: parseInt(e.target.value) || 30 })}
                  style={{ width: '100px' }}
                />
                <span style={{ marginLeft: '12px', fontSize: '13px', color: '#6B7280' }}>
                  Time before escalating to family (0 to disable)
                </span>
              </div>

              <div className="form-group">
                <label>Family Response Timeout (seconds)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={emergencyForm.familyResponseTimeout}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, familyResponseTimeout: parseInt(e.target.value) || 30 })}
                  style={{ width: '100px' }}
                />
                <span style={{ marginLeft: '12px', fontSize: '13px', color: '#6B7280' }}>
                  Time before escalating to emergency (0 to disable)
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>Offline Mode</h4>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="offlineMode"
                  checked={emergencyForm.isOfflineMode}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, isOfflineMode: e.target.checked })}
                />
                <label htmlFor="offlineMode">
                  <WifiOff size={16} style={{ marginRight: '4px' }} />
                  Enable Offline Emergency Mode
                </label>
              </div>
              <p style={{ marginLeft: '28px', fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                When enabled, alerts will be stored locally and synced when connection is restored. SMS simulation will be used.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Emergency Settings
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowEmergencySettings(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <EmergencyContactManager />
      </div>

      <div className="card" style={{ border: '2px solid #FEE2E2' }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#DC2626' }}><Trash2 size={20} /> Reset All Data</h3>
        </div>
        
        <p style={{ color: '#64748B', marginBottom: '16px' }}>
          This will delete ALL data including all accounts, profiles, reminders, messages, photos, and voice recordings. This action cannot be undone.
        </p>

        {!showResetConfirm ? (
          <button 
            onClick={() => setShowResetConfirm(true)}
            style={{ 
              padding: '12px 24px', 
              background: '#DC2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={18} /> Reset All Data
          </button>
        ) : (
          <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px' }}>
            <p style={{ color: '#DC2626', fontWeight: '600', marginBottom: '12px' }}>
              Are you sure? Enter caregiver password to confirm:
            </p>
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter caregiver password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                onClick={() => {
                  if (verifyCaregiverPassword(resetPassword)) {
                    localStorage.clear();
                    logout();
                  } else {
                    alert('Incorrect password');
                    setResetPassword('');
                  }
                }}
                style={{ 
                  padding: '12px 24px', 
                  background: '#DC2626', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete Everything
              </button>
              <button 
                onClick={() => { setShowResetConfirm(false); setResetPassword(''); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
