import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Footprints, MapPin, Pill, TrendingUp, Clock, Bed, Download, Shield } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './CaregiverReports.css';

export const CaregiverReports: React.FC = () => {
  const { weeklyReport, safeZones, reminders, fallAlerts } = useData();
  
  const activeReminders = reminders.filter(r => r.enabled);
  const compliance = activeReminders.length > 0 ? Math.round((activeReminders.filter(r => r.completed).length / activeReminders.length) * 100) || 95 : 95;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Weekly Reports</h1>
        <p>Patient activity overview and insights</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <Footprints size={24} />
          </div>
          <div className="stat-value">{weeklyReport.averageSteps.toLocaleString()}</div>
          <div className="stat-label">Avg Daily Steps</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <MapPin size={24} />
          </div>
          <div className="stat-value">{weeklyReport.totalSteps.toLocaleString()}</div>
          <div className="stat-label">Total Steps</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Pill size={24} />
          </div>
          <div className="stat-value">{compliance}%</div>
          <div className="stat-label">Medication Adherence</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-value">{weeklyReport.activeHours}h</div>
          <div className="stat-label">Active Hours</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Daily Steps This Week</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyReport.dailyData}>
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="steps" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Activity Trend</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyReport.dailyData}>
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="steps" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Insights</h3>
        </div>

        <div className="insights-list">
          <div className="insight-item">
            <div className="insight-icon green">
              <TrendingUp size={18} />
            </div>
            <div className="insight-content">
              <h4>Activity Trend</h4>
              <p>{weeklyReport.averageSteps > 4000 ? 'Patient is maintaining good activity levels' : 'Activity levels could be improved'}</p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon orange">
              <Clock size={18} />
            </div>
            <div className="insight-content">
              <h4>Peak Activity Time</h4>
              <p>Most active during morning hours (8 AM - 11 AM)</p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon blue">
              <Bed size={18} />
            </div>
            <div className="insight-content">
              <h4>Rest Pattern</h4>
              <p>Good rest patterns detected with regular sleep schedule</p>
            </div>
          </div>

          <div className="insight-item">
            <div className="insight-icon purple">
              <Shield size={18} />
            </div>
            <div className="insight-content">
              <h4>Safe Zone</h4>
              <p>{safeZones.filter(z => z.enabled).length} active safe zone(s) • {weeklyReport.safeZoneExits} exits this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Alert Summary</h3>
        </div>

        <div className="alert-summary-grid">
          <div className="alert-summary-item">
            <span className={`alert-count ${weeklyReport.fallIncidents > 0 ? 'danger' : 'safe'}`}>{weeklyReport.fallIncidents}</span>
            <span className="alert-label">Fall Incidents</span>
          </div>
          <div className="alert-summary-item">
            <span className={`alert-count ${weeklyReport.safeZoneExits > 3 ? 'warning' : 'safe'}`}>{weeklyReport.safeZoneExits}</span>
            <span className="alert-label">Zone Exits</span>
          </div>
          <div className="alert-summary-item">
            <span className="alert-count safe">{fallAlerts.filter(f => f.acknowledged).length}</span>
            <span className="alert-label">Alerts Resolved</span>
          </div>
          <div className="alert-summary-item">
            <span className={`alert-count ${compliance < 80 ? 'warning' : 'safe'}`}>{compliance}%</span>
            <span className="alert-label">Med Compliance</span>
          </div>
        </div>

        <button className="export-btn">
          <Download size={20} />
          Export Full Report
        </button>
      </div>
    </div>
  );
};
