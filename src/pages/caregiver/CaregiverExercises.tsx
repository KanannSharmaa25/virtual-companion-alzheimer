import React from 'react';
import { Brain, Trophy, Clock, Calendar, TrendingUp, BarChart3, Star, Users } from 'lucide-react';
import { useData } from '../../context/AppContext';

export const CaregiverExercises: React.FC = () => {
  const { cognitiveResults, linkedPatient } = useData();

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const todayResults = cognitiveResults.filter(r => r.date === getTodayDate());
  const weeklyResults = cognitiveResults.slice(-7);
  
  const totalExercises = cognitiveResults.length;
  const averageScore = totalExercises > 0 
    ? Math.round(cognitiveResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / totalExercises)
    : 0;

  const exerciseTypes = [...new Set(cognitiveResults.map(r => r.exerciseName))];
  
  const exerciseStats = exerciseTypes.map(type => {
    const results = cognitiveResults.filter(r => r.exerciseName === type);
    const avgScore = Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length);
    const totalAttempts = results.length;
    return { type, avgScore, totalAttempts };
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><Brain size={28} /> Cognitive Exercises</h1>
        <p>Track {linkedPatient?.name || 'patient'}'s brain exercise progress</p>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon purple">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalExercises}</div>
            <div className="stat-label">Total Exercises</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon blue">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{todayResults.length}</div>
            <div className="stat-label">Today's Exercises</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{exerciseTypes.length}</div>
            <div className="stat-label">Exercise Types Tried</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title"><BarChart3 size={20} /> Performance by Exercise</h3>
        </div>
        
        {exerciseStats.length > 0 ? (
          <div className="exercise-stats-grid">
            {exerciseStats.map((stat, idx) => (
              <div key={idx} className="exercise-stat-item">
                <div className="exercise-stat-header">
                  <span className="exercise-name">{stat.type}</span>
                  <span className="exercise-attempts">{stat.totalAttempts} attempts</span>
                </div>
                <div className="exercise-stat-bar">
                  <div 
                    className="exercise-stat-fill"
                    style={{ width: `${stat.avgScore}%` }}
                  />
                </div>
                <div className="exercise-stat-score">{stat.avgScore}%</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B', textAlign: 'center', padding: '24px' }}>
            No exercises completed yet. Patient hasn't done any brain exercises.
          </p>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><Calendar size={20} /> Recent Activity</h3>
        </div>
        
        {cognitiveResults.length > 0 ? (
          <div className="activity-list">
            {cognitiveResults.slice().reverse().slice(0, 10).map(result => (
              <div key={result.id} className="activity-item">
                <div className="activity-icon">
                  <Brain size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{result.exerciseName}</div>
                  <div className="activity-meta">
                    <span>{result.date}</span>
                    <span>•</span>
                    <span>{result.timeTaken}s</span>
                  </div>
                </div>
                <div className={`activity-score ${result.score / result.totalQuestions >= 0.7 ? 'good' : 'needs-work'}`}>
                  {result.score}/{result.totalQuestions}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748B', textAlign: 'center', padding: '24px' }}>
            No activity yet. Patient hasn't completed any exercises.
          </p>
        )}
      </div>

      <style>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.purple { background: linear-gradient(135deg, #8B5CF6, #A78BFA); }
        .stat-icon.green { background: linear-gradient(135deg, #10B981, #34D399); }
        .stat-icon.blue { background: linear-gradient(135deg, #3B82F6, #60A5FA); }
        .stat-icon.orange { background: linear-gradient(135deg, #F59E0B, #FBBF24); }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1E293B;
        }

        .stat-label {
          font-size: 14px;
          color: #64748B;
        }

        .exercise-stats-grid {
          display: grid;
          gap: 20px;
          padding: 16px 0;
        }

        .exercise-stat-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .exercise-stat-header {
          width: 180px;
          display: flex;
          flex-direction: column;
        }

        .exercise-name {
          font-weight: 600;
          color: #1E293B;
        }

        .exercise-attempts {
          font-size: 13px;
          color: #94A3B8;
        }

        .exercise-stat-bar {
          flex: 1;
          height: 12px;
          background: #E2E8F0;
          border-radius: 6px;
          overflow: hidden;
        }

        .exercise-stat-fill {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #34D399);
          border-radius: 6px;
          transition: width 0.3s ease;
        }

        .exercise-stat-score {
          width: 50px;
          text-align: right;
          font-weight: 700;
          color: #10B981;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #E2E8F0;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 44px;
          height: 44px;
          background: #F5F3FF;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 4px;
        }

        .activity-meta {
          display: flex;
          gap: 8px;
          font-size: 13px;
          color: #94A3B8;
        }

        .activity-score {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
        }

        .activity-score.good {
          background: #F0FDF4;
          color: #059669;
        }

        .activity-score.needs-work {
          background: #FEF3C7;
          color: #D97706;
        }
      `}</style>
    </div>
  );
};
