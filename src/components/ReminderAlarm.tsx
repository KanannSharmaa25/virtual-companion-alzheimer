import React, { useState, useEffect, useRef } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import { useUser, useData } from '../context/AppContext';
import type { Reminder, ReminderLog } from '../types';
import '../styles/alarm.css';

interface AlarmModalProps {
  reminder: {
    id: string;
    title: string;
    type: string;
    notes?: string;
  };
  onComplete: () => void;
  onDismiss: () => void;
}

const AlarmModal: React.FC<AlarmModalProps> = ({ reminder, onComplete, onDismiss }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' + 'A'.repeat(100));
    audioRef.current = audio;
    
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
      }
    };
    
    playAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleComplete = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onComplete();
  };

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onDismiss();
  };

  const getReminderIcon = () => {
    switch (reminder.type) {
      case 'medication':
        return '💊';
      case 'meal':
        return '🍽️';
      case 'appointment':
        return '📅';
      default:
        return '⏰';
    }
  };

  return (
    <div className="alarm-overlay">
      <div className="alarm-container">
        <div className="alarm-icon">
          <AlertTriangle size={64} />
        </div>
        
        <h1>Reminder!</h1>
        
        <div className="alarm-content">
          <span className="reminder-icon">{getReminderIcon()}</span>
          <h2>{reminder.title}</h2>
          {reminder.notes && <p>{reminder.notes}</p>}
        </div>

        <div className="alarm-actions">
          <button className="complete-btn" onClick={handleComplete}>
            <Check size={24} />
            <span>Done</span>
          </button>
          <button className="dismiss-btn" onClick={handleDismiss}>
            <X size={24} />
            <span>Dismiss</span>
          </button>
        </div>

        <p className="alarm-hint">
          This alarm will keep playing until you respond
        </p>
      </div>
    </div>
  );
};

export const ReminderAlarm: React.FC = () => {
  const { user } = useUser();
  const { reminders, reminderLogs, addReminderLog, updateReminderLog, addNotification, updateReminder } = useData();
  
  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    title: string;
    type: string;
    notes?: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== 'patient') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const today = now.toLocaleDateString();

      reminders.forEach((reminder: Reminder) => {
        if (!reminder.enabled) return;
        if (reminder.time === currentTime) {
          const alreadyTriggered = reminderLogs.some(
            (log: ReminderLog) => log.reminderId === reminder.id && log.date === today && (log.completed || log.dismissed)
          );
          
          if (!alreadyTriggered && (!activeAlarm || activeAlarm.id !== reminder.id)) {
            setActiveAlarm({
              id: reminder.id,
              title: reminder.title,
              type: reminder.type,
              notes: reminder.notes
            });
            
            const log = {
              reminderId: reminder.id,
              reminderTitle: reminder.title,
              scheduledTime: reminder.time,
              completed: false,
              dismissed: false,
              date: today,
            };
            addReminderLog(log as Omit<ReminderLog, 'id'>);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 1000);
    checkReminders();

    return () => clearInterval(interval);
  }, [user, reminders, reminderLogs, activeAlarm]);

  const handleComplete = () => {
    if (activeAlarm) {
      const today = new Date().toLocaleDateString();
      const todayLogs = reminderLogs.filter(
        (log: ReminderLog) => log.reminderId === activeAlarm.id && log.date === today && !log.completed && !log.dismissed
      );
      
      if (todayLogs.length > 0) {
        updateReminderLog(todayLogs[0].id, { 
          completed: true, 
          completedTime: new Date().toTimeString().slice(0, 5) 
        });
      }

      updateReminder(activeAlarm.id, { completed: true });

      addNotification({
        type: 'reminder_completed',
        title: 'Reminder Completed',
        message: `${user?.name || 'Patient'} completed: ${activeAlarm.title}`,
      });

      setActiveAlarm(null);
    }
  };

  const handleDismiss = () => {
    if (activeAlarm) {
      const today = new Date().toLocaleDateString();
      const todayLogs = reminderLogs.filter(
        (log: ReminderLog) => log.reminderId === activeAlarm.id && log.date === today && !log.completed && !log.dismissed
      );
      
      if (todayLogs.length > 0) {
        updateReminderLog(todayLogs[0].id, { dismissed: true });
      }

      addNotification({
        type: 'reminder_missed',
        title: 'Reminder Dismissed',
        message: `${user?.name || 'Patient'} dismissed: ${activeAlarm.title}`,
      });

      setActiveAlarm(null);
    }
  };

  if (!activeAlarm) return null;

  return (
    <AlarmModal
      reminder={activeAlarm}
      onComplete={handleComplete}
      onDismiss={handleDismiss}
    />
  );
};
