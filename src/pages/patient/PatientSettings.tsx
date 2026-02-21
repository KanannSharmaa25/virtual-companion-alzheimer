import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Activity, Shield } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';

export const PatientSettings: React.FC = () => {
  const { user, updateCaregiverPassword } = useUser();
  const { triggerFallAlert, emergencySettings } = useData();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFallTest, setShowFallTest] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    updateCaregiverPassword(newPassword);
    setSuccess('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowPasswordForm(false);
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
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
            <div style={{ fontSize: '16px', fontWeight: '600' }}>Patient</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title"><Shield size={20} /> Emergency System</h3>
        </div>
        <div style={{ padding: '16px 0' }}>
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

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>
              The emergency system monitors for:
            </p>
            <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '4px' }}>Inactivity - alerts if no activity for {emergencySettings.inactivityTimeout} minutes</li>
              <li style={{ marginBottom: '4px' }}>Safe zone breach - alerts when leaving safe areas</li>
              <li style={{ marginBottom: '4px' }}>Fall detection - alerts when a fall is detected</li>
              <li style={{ marginBottom: '4px' }}>SOS button - immediate emergency alerts</li>
            </ul>
          </div>

          {!showFallTest ? (
            <button
              onClick={() => setShowFallTest(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: emergencySettings.fallAlertsEnabled ? '#DC2626' : '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: emergencySettings.fallAlertsEnabled ? 'pointer' : 'not-allowed',
              }}
            >
              <Activity size={18} />
              Test Fall Detection
            </button>
          ) : (
            <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', border: '2px solid #FECACA' }}>
              <p style={{ color: '#DC2626', fontWeight: '600', marginBottom: '12px' }}>
                Test Fall Detection?
              </p>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
                This will send a test fall alert to your caregiver. Only use for testing purposes.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (emergencySettings.fallAlertsEnabled) {
                      triggerFallAlert();
                      alert('Test fall alert sent to caregiver!');
                    }
                    setShowFallTest(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Send Test Alert
                </button>
                <button
                  onClick={() => setShowFallTest(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Lock size={20} /> Logout Password</h3>
        </div>
        <div style={{ padding: '16px 0' }}>
          <p style={{ color: '#64748B', marginBottom: '16px', fontSize: '14px' }}>
            Set a password that your caregiver must enter when you want to log out. 
            This keeps your account secure.
          </p>
          
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Lock size={18} />
              Set / Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 16px',
                      border: '2px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  background: '#FEF2F2', 
                  color: '#DC2626', 
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {success && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  background: '#F0FDF4', 
                  color: '#059669', 
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={18} />
                  Save Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
