import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useData } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const { emergencySettings } = useData();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (emergencySettings.isOfflineMode) {
        const offlineAlerts = JSON.parse(localStorage.getItem('offlineAlerts') || '[]');
        if (offlineAlerts.length > 0) {
          setPendingAlerts(offlineAlerts);
          setShowSyncModal(true);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [emergencySettings.isOfflineMode]);

  const handleSync = () => {
    const offlineAlerts = JSON.parse(localStorage.getItem('offlineAlerts') || '[]');
    localStorage.setItem('offlineAlerts', '[]');
    setPendingAlerts([]);
    setShowSyncModal(false);
    alert(`${offlineAlerts.length} offline alerts synced successfully!`);
  };

  if (!emergencySettings.isOfflineMode) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: isOnline ? '#10B981' : '#DC2626',
          color: 'white',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        {isOnline ? 'Online - Emergency Mode Active' : 'Offline - Alerts will be stored locally'}
      </div>

      {showSyncModal && pendingAlerts.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => setShowSyncModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <RefreshCw size={24} color="#10B981" />
              <h3 style={{ margin: 0 }}>Sync Offline Alerts</h3>
            </div>
            <p style={{ color: '#64748B', marginBottom: '16px' }}>
              You were offline and {pendingAlerts.length} emergency alert(s) were stored locally. 
              Would you like to sync them now?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSyncModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Later
              </button>
              <button
                onClick={handleSync}
                style={{
                  padding: '10px 20px',
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Sync Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
