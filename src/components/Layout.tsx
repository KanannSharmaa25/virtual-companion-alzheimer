import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  LayoutDashboard, 
  MapPin, 
  Shield, 
  BarChart3, 
  Users,
  MessageCircle,
  LogOut,
  Home,
  Pill,
  AlertTriangle,
  Battery,
  Footprints,
  Lock,
  Mic,
  Image,
  Bell,
  Settings,
  X,
  Music,
  BookOpen,
  Brain,
  Smile
} from 'lucide-react';
import { useUser, useData } from '../context/AppContext';
import { PasswordModal } from './PasswordModal';
import { ReminderAlarm } from './ReminderAlarm';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useUser();
  const { getUnreadNotificationCount, notifications, markNotificationRead, updatePatientActivity, emergencySettings } = useData();
  const navigate = useNavigate();
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.role === 'patient' && emergencySettings.inactivityEnabled) {
      updatePatientActivity();
      
      const handleActivity = () => {
        updatePatientActivity();
      };

      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [user?.role, emergencySettings.inactivityEnabled, updatePatientActivity]);

  const handleLogoutClick = () => {
    if (user?.role === 'patient') {
      setPendingLogout(true);
      setShowPasswordModal(true);
    } else {
      doLogout();
    }
  };

  const doLogout = () => {
    logout();
    navigate('/');
  };

  const handlePasswordSuccess = () => {
    if (pendingLogout) {
      doLogout();
    }
    setShowPasswordModal(false);
    setPendingLogout(false);
  };

  const patientNavItems = [
    { to: '/patient', icon: Home, label: 'Home', exact: true },
    { to: '/patient/talk', icon: MessageCircle, label: 'AI Companion' },
    { to: '/patient/wellness', icon: Smile, label: 'Wellness' },
    { to: '/patient/music', icon: Music, label: 'Music Therapy' },
    { to: '/patient/journal', icon: BookOpen, label: 'Journal' },
    { to: '/patient/exercises', icon: Brain, label: 'Brain Exercises' },
    { to: '/patient/reminders', icon: Pill, label: 'Reminders' },
    { to: '/patient/family', icon: Users, label: 'Family' },
    { to: '/patient/voice', icon: Mic, label: 'Voice Messages' },
    { to: '/patient/photos', icon: Image, label: 'Photos' },
    { to: '/patient/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/patient/location', icon: MapPin, label: 'My Location' },
    { to: '/patient/movement', icon: Footprints, label: 'Movement' },
    { to: '/patient/sos', icon: AlertTriangle, label: 'Emergency SOS' },
    { to: '/patient/settings', icon: Settings, label: 'Settings' },
  ];

  const caregiverNavItems = [
    { to: '/caregiver', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/caregiver/location', icon: MapPin, label: 'Live Location' },
    { to: '/caregiver/safezone', icon: Shield, label: 'Safe Zones' },
    { to: '/caregiver/reports', icon: BarChart3, label: 'Weekly Reports' },
    { to: '/caregiver/movement', icon: Footprints, label: 'Movement' },
    { to: '/caregiver/exercises', icon: Brain, label: 'Brain Exercises' },
    { to: '/caregiver/voice', icon: Mic, label: 'Voice Messages' },
    { to: '/caregiver/photos', icon: Image, label: 'Photos' },
    { to: '/caregiver/chat', icon: MessageCircle, label: 'Chat' },
    { to: '/caregiver/alerts', icon: AlertTriangle, label: 'Alerts' },
    { to: '/caregiver/battery', icon: Battery, label: 'Battery' },
    { to: '/caregiver/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = user?.role === 'patient' ? patientNavItems : caregiverNavItems;
  const unreadCount = getUnreadNotificationCount();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="layout">
      {user?.role === 'patient' && <ReminderAlarm />}
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Heart size={24} color="white" />
            </div>
            <div>
              <h1>Virtual Companion</h1>
              <span>Alzheimer's Care</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={(item as any).exact}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          {user?.role === 'caregiver' && (
            <div className="notification-bell">
              <button 
                className="bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <p className="no-notifications">No notifications</p>
                    ) : (
                      notifications.slice().reverse().slice(0, 10).map(n => (
                        <div 
                          key={n.id} 
                          className={`notification-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => markNotificationRead(n.id)}
                        >
                          <div className="notification-title">{n.title}</div>
                          <div className="notification-message">{n.message}</div>
                          <div className="notification-time">{formatTime(n.timestamp)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role === 'patient' ? 'Patient' : 'Caregiver'}</div>
            </div>
            <button 
              onClick={handleLogoutClick} 
              style={{ background: 'none', padding: '8px' }}
              title={user?.role === 'patient' ? 'Logout (requires caregiver password)' : 'Logout'}
            >
              <LogOut size={18} color="#94A3B8" />
            </button>
          </div>
          {user?.role === 'patient' && (
            <div className="patient-notice">
              <Lock size={14} />
              <span>Some actions require caregiver password</span>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
        title={pendingLogout ? 'Logout Verification' : 'Caregiver Verification Required'}
        message={pendingLogout ? 'Please ask your caregiver to enter their password to log out.' : 'Please ask your caregiver to enter their password to continue.'}
      />
    </div>
  );
};
