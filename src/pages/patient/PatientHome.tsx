import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Users, AlertCircle, Clock, Pill, MapPin, CheckCircle, Heart, Plus, BookOpen, Brain, Smile } from 'lucide-react';
import { useUser } from '../../context/AppContext';
import { useData } from '../../context/AppContext';
import './PatientHome.css';

export const PatientHome: React.FC = () => {
  const { user } = useUser();
  const { reminders, familyMembers, locationSharing, safeZones } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getDateString = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const upcomingReminders = reminders
    .filter(r => r.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 3);

  const enabledSafeZone = safeZones.find(z => z.enabled);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{getGreeting()}, {user?.name || 'there'}</h1>
        <p>{getDateString()}</p>
      </div>

      <div className="welcome-card">
        <div className="welcome-icon">
          <Heart size={32} color="white" />
        </div>
        <div className="welcome-content">
          <h2>Welcome back!</h2>
          <p>{enabledSafeZone ? `You're at ${enabledSafeZone.name}` : 'Set up your safe zone in settings'}</p>
        </div>
        <div className="welcome-time">
          <Clock size={40} color="#10B981" />
          <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="quick-actions-grid">
        <Link to="/patient/talk" className="action-card-large">
          <div className="action-icon-large purple">
            <Mic size={28} />
          </div>
          <div className="action-content">
            <h3>Talk to Me</h3>
            <p>Chat with your AI companion</p>
          </div>
        </Link>

        <Link to="/patient/wellness" className="action-card-large">
          <div className="action-icon-large pink">
            <Smile size={28} />
          </div>
          <div className="action-content">
            <h3>Wellness</h3>
            <p>AI checks on you & supports</p>
          </div>
        </Link>

        <Link to="/patient/journal" className="action-card-large">
          <div className="action-icon-large pink">
            <BookOpen size={28} />
          </div>
          <div className="action-content">
            <h3>My Journal</h3>
            <p>Write or record your thoughts</p>
          </div>
        </Link>

        <Link to="/patient/exercises" className="action-card-large">
          <div className="action-icon-large purple">
            <Brain size={28} />
          </div>
          <div className="action-content">
            <h3>Brain Exercises</h3>
            <p>Fun quizzes to keep sharp</p>
          </div>
        </Link>

        <Link to="/patient/family" className="action-card-large">
          <div className="action-icon-large orange">
            <Users size={28} />
          </div>
          <div className="action-content">
            <h3>My Family</h3>
            <p>{familyMembers.length} family members</p>
          </div>
        </Link>

        <Link to="/patient/location" className="action-card-large">
          <div className="action-icon-large blue">
            <MapPin size={28} />
          </div>
          <div className="action-content">
            <h3>My Location</h3>
            <p>{locationSharing ? 'Location shared' : 'Location private'}</p>
          </div>
        </Link>

        <Link to="/patient/reminders" className="action-card-large">
          <div className="action-icon-large green">
            <Pill size={28} />
          </div>
          <div className="action-content">
            <h3>Reminders</h3>
            <p>{reminders.filter(r => r.enabled).length} active</p>
          </div>
        </Link>

        <Link to="/patient/sos" className="action-card-large danger">
          <div className="action-icon-large red">
            <AlertCircle size={28} />
          </div>
          <div className="action-content">
            <h3>Emergency SOS</h3>
            <p>Get help immediately</p>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Pill size={22} color="#10B981" />
              <h3 className="card-title">Today's Reminders</h3>
            </div>
            <Link to="/patient/reminders" style={{ fontSize: '14px', color: '#10B981' }}>
              <Plus size={18} />
            </Link>
          </div>
          
          {upcomingReminders.length > 0 ? (
            <div className="reminder-list">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className="reminder-item">
                  <span className="reminder-time">{reminder.time}</span>
                  <span className="reminder-text">
                    {reminder.type === 'medication' && '💊 '}
                    {reminder.type === 'meal' && '🍽 '}
                    {reminder.type === 'appointment' && '📅 '}
                    {reminder.title}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748B', fontSize: '14px' }}>No reminders set. Add your first reminder!</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MapPin size={22} color="#10B981" />
              <h3 className="card-title">Safe Zone</h3>
            </div>
          </div>
          
          {enabledSafeZone ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <CheckCircle size={20} color="#10B981" />
                <span style={{ fontSize: '15px', fontWeight: '600' }}>{enabledSafeZone.name}</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '14px' }}>
                {enabledSafeZone.radius} km radius • Active
              </p>
            </>
          ) : (
            <p style={{ color: '#64748B', fontSize: '14px' }}>No safe zone set. Ask your caregiver to set one.</p>
          )}
          
          {familyMembers.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <div className="family-mini">
                <div className="family-mini-avatar">
                  {familyMembers[0].name.charAt(0)}
                </div>
                <div>
                  <span className="family-mini-name">{familyMembers[0].name}</span>
                  <span className="family-mini-status">• {familyMembers[0].relation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
