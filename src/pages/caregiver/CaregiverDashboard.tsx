import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Shield, Clock, Battery, Activity, AlertTriangle, RefreshCw, UserPlus, Footprints, Zap, Pill, MessageCircle, Image, Mic, Brain, TrendingUp } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './CaregiverDashboard.css';

export const CaregiverDashboard: React.FC = () => {
  const { 
    linkedPatient, 
    safeZones, 
    patientBattery, 
    patientLocation, 
    fallAlerts, 
    movementData,
    reminders,
    reminderLogs,
    cognitiveResults,
    chatMessages,
    photos,
    voiceMessages,
    videoMessages,
    distanceAlert,
    weeklyReport
  } = useData();
  
  const enabledSafeZone = safeZones.find(z => z.enabled);
  const unacknowledgedFalls = fallAlerts.filter(f => !f.acknowledged);
  const lowBattery = patientBattery.level < 20;

  const today = new Date().toISOString().split('T')[0];
  const todayReminders = reminders.filter(r => r.enabled);
  const completedToday = reminderLogs.filter(r => r.date === today && r.completed).length;
  const missedToday = reminderLogs.filter(r => r.date === today && r.dismissed).length;
  
  const recentExercises = cognitiveResults.slice(-3).reverse();
  const recentMessages = chatMessages.slice(-5).reverse();
  const recentPhotos = photos.slice(-4).reverse();
  const unreadMessages = chatMessages.filter(m => !m.read).length;

  const getExerciseScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>{linkedPatient ? `Monitor ${linkedPatient.name}'s daily status` : 'Monitor your patient\'s daily status'}</p>
      </div>

      {!linkedPatient ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <UserPlus size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: '12px' }}>Link a Patient</h2>
          <p style={{ color: '#64748B', marginBottom: '24px' }}>Connect with a patient to monitor their safety and activity</p>
          <Link to="/caregiver/settings" className="btn btn-primary">
            <UserPlus size={18} /> Go to Settings to Link Patient
          </Link>
        </div>
      ) : (
        <>
          {unacknowledgedFalls.length > 0 && (
            <div className="alert-banner">
              <AlertTriangle size={24} />
              <div>
                <strong>Fall Detected!</strong>
                <p>Possible fall detected. Check on the patient immediately.</p>
              </div>
              <Link to="/caregiver/alerts" className="btn btn-danger">View Alert</Link>
            </div>
          )}

          {lowBattery && (
            <div className="warning-banner">
              <Battery size={24} />
              <div>
                <strong>Low Battery Alert</strong>
                <p>Patient's device battery is at {patientBattery.level}%</p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <Link to="/caregiver/location" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              background: '#EFF6FF', 
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#1E40AF'
            }}>
              <MapPin size={24} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>View Location</span>
            </Link>
            
            <Link to="/caregiver/chat" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              background: '#F0FDF4', 
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#166534'
            }}>
              <MessageCircle size={24} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Send Message</span>
            </Link>
            
            <Link to="/caregiver/voice" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              background: '#FEF3C7', 
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#92400E'
            }}>
              <Mic size={24} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Record Video</span>
            </Link>
            
            <Link to="/caregiver/settings" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '16px', 
              background: '#F3E8FF', 
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#7C3AED'
            }}>
              <Shield size={24} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Safe Zones</span>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Shield size={18} /> Safe Zones</h3>
                <Link to="/caregiver/safezone" style={{ fontSize: '13px', color: '#3B82F6' }}>Manage</Link>
              </div>
              <div style={{ padding: '12px 0' }}>
                {safeZones.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {safeZones.slice(0, 3).map(zone => (
                      <div key={zone.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '8px',
                        background: zone.enabled ? '#ECFDF5' : '#F8FAFC',
                        borderRadius: '6px'
                      }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: zone.enabled ? '#10B981' : '#CBD5E1' 
                        }} />
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{zone.name}</span>
                        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
                          {zone.radius}m
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748B', fontSize: '13px' }}>No safe zones configured</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Shield size={18} /> Distance Alert</h3>
              </div>
              <div style={{ padding: '12px 0' }}>
                {distanceAlert.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: '#10B981' 
                    }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>Active</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Max distance: {distanceAlert.maxDistance} km
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: '#CBD5E1' 
                    }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>Disabled</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Enable in Settings
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Mic size={18} /> Send to Patient</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', padding: '12px 0' }}>
                <Link 
                  to="/caregiver/voice" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '13px' }}
                >
                  <Mic size={16} style={{ marginRight: '4px' }} />
                  Voice Msg
                </Link>
                <Link 
                  to="/caregiver/chat" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, textAlign: 'center', padding: '10px', fontSize: '13px' }}
                >
                  <MessageCircle size={16} style={{ marginRight: '4px' }} />
                  Chat
                </Link>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <MapPin size={24} />
              </div>
              <div className="stat-value">{patientLocation ? 'At Location' : 'Unknown'}</div>
              <div className="stat-label">Current Location</div>
            </div>

            <div className="stat-card">
              <div className={`stat-icon ${lowBattery ? 'red' : 'blue'}`}>
                <Battery size={24} />
              </div>
              <div className="stat-value">{patientBattery.level}%</div>
              <div className="stat-label">Device Battery</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Footprints size={24} />
              </div>
              <div className="stat-value">{movementData.steps}</div>
              <div className="stat-label">Today's Steps</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Activity size={24} />
              </div>
              <div className="stat-value">{movementData.status === 'active' ? 'Active' : movementData.status === 'inactive' ? 'Inactive' : 'Unusual'}</div>
              <div className="stat-label">Movement Status</div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Pill size={18} /> Today's Reminders</h3>
                <Link to="/caregiver/reports" style={{ fontSize: '13px', color: '#3B82F6' }}>View All</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{completedToday}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#EF4444' }}>{missedToday}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Missed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#64748B' }}>{todayReminders.length}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Total</div>
                  </div>
                </div>
                {todayReminders.slice(0, 3).map(reminder => {
                  const log = reminderLogs.find(l => l.reminderId === reminder.id && l.date === today);
                  return (
                    <div key={reminder.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px',
                      background: log?.completed ? '#ECFDF5' : log?.dismissed ? '#FEF2F2' : '#F8FAFC',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      fontSize: '13px'
                    }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%',
                        background: log?.completed ? '#10B981' : log?.dismissed ? '#EF4444' : '#94A3B8'
                      }} />
                      <span style={{ flex: 1 }}>{reminder.title}</span>
                      <span style={{ color: '#64748B' }}>{reminder.time}</span>
                    </div>
                  );
                })}
                {todayReminders.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>No reminders set for today</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Brain size={18} /> Recent Exercises</h3>
                <Link to="/caregiver/exercises" style={{ fontSize: '13px', color: '#3B82F6' }}>View All</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recentExercises.length > 0 ? (
                  recentExercises.map(exercise => (
                    <div key={exercise.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '10px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px',
                        background: getExerciseScoreColor(exercise.score, exercise.totalQuestions),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {Math.round((exercise.score / exercise.totalQuestions) * 100)}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{exercise.exerciseName}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {exercise.score}/{exercise.totalQuestions} correct • {new Date(exercise.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>No exercises completed yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '16px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><MessageCircle size={18} /> Messages</h3>
                <Link to="/caregiver/chat" style={{ fontSize: '13px', color: '#3B82F6' }}>View Chat</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recentMessages.length > 0 ? (
                  <>
                    {recentMessages.map(msg => (
                      <div key={msg.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px',
                        background: !msg.read ? '#EFF6FF' : 'transparent',
                        borderRadius: '8px',
                        marginBottom: '4px'
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          background: msg.senderRole === 'patient' ? '#8B5CF6' : '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {msg.senderName.charAt(0)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: !msg.read ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {msg.content}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {unreadMessages > 0 && (
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#3B82F6', fontWeight: '600' }}>
                        {unreadMessages} unread message{unreadMessages > 1 ? 's' : ''}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>No messages yet</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Image size={18} /> Recent Photos</h3>
                <Link to="/caregiver/photos" style={{ fontSize: '13px', color: '#3B82F6' }}>View All</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recentPhotos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {recentPhotos.map(photo => (
                      <div key={photo.id} style={{ 
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#F1F5F9'
                      }}>
                        <img 
                          src={photo.imageData} 
                          alt={photo.caption || 'Patient photo'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>No photos shared</p>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><Mic size={18} /> Voice/Video</h3>
                <Link to="/caregiver/voice" style={{ fontSize: '13px', color: '#3B82F6' }}>View All</Link>
              </div>
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#8B5CF6' }}>{voiceMessages.length}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Voice</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#EC4899' }}>{videoMessages.length}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Video</div>
                  </div>
                </div>
                <p style={{ textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                  Check Voice Messages page for recordings
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              <h3 className="card-title"><TrendingUp size={18} /> Weekly Summary</h3>
              <Link to="/caregiver/reports" style={{ fontSize: '13px', color: '#3B82F6' }}>View Detailed Report</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', padding: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>{weeklyReport.totalSteps.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Total Steps</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{weeklyReport.averageSteps.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Avg Daily</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>{weeklyReport.activeHours}h</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Active Hours</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: weeklyReport.safeZoneExits > 0 ? '#EF4444' : '#10B981' }}>{weeklyReport.safeZoneExits}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Zone Exits</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{weeklyReport.medicationCompliance}%</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Medication</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={20} color={unacknowledgedFalls.length > 0 ? '#EF4444' : '#10B981'} />
                <h3 className="card-title">Recent Alerts</h3>
              </div>
              <Link to="/caregiver/alerts" style={{ fontSize: '13px', color: '#3B82F6' }}>View All</Link>
            </div>

            {unacknowledgedFalls.length > 0 ? (
              <div className="alert-item" style={{ background: '#FEE2E2' }}>
                <div className="alert-dot red"></div>
                <span>⚠️ Fall detected - Requires attention</span>
              </div>
            ) : (
              <div className="alert-item">
                <div className="alert-dot green"></div>
                <span>All systems normal - No active alerts</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
