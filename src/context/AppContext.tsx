import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AppSettings, PatientProfile, CaregiverProfile, VoiceMessage, VideoMessage, Photo, ChatMessage, Notification, ReminderLog, MusicTrack, MusicMemory, JournalEntry, CognitiveResult, MoodAnalysis, WellnessCheck, EmergencySettings, EmergencyAlert, EmergencyContact, AlertType, AlertLevel } from '../types';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string, role: 'patient' | 'caregiver') => boolean;
  verifyCaregiverPassword: (password: string) => boolean;
  updateCaregiverPassword: (password: string) => void;
  updateProfileCompleted: (completed: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [caregiverPassword, setCaregiverPassword] = useState<string>('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedCaregiverPwd = localStorage.getItem('caregiverPassword');
    if (savedCaregiverPwd) {
      setCaregiverPassword(savedCaregiverPwd);
    }
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => u.email === email && u.password === password);
    
    if (foundUser) {
      handleSetUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (email: string, password: string, name: string, role: 'patient' | 'caregiver'): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
      profileCompleted: false,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    handleSetUser(newUser);
    
    if (role === 'caregiver') {
      setCaregiverPassword(password);
      localStorage.setItem('caregiverPassword', password);
    }
    
    return true;
  };

  const verifyCaregiverPassword = (password: string): boolean => {
    return password === caregiverPassword;
  };

  const updateCaregiverPassword = (password: string) => {
    setCaregiverPassword(password);
    localStorage.setItem('caregiverPassword', password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfileCompleted = (completed: boolean) => {
    if (user) {
      const updatedUser = { ...user, profileCompleted: completed };
      handleSetUser(updatedUser);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: handleSetUser, 
      logout, 
      login, 
      register,
      verifyCaregiverPassword,
      updateCaregiverPassword,
      updateProfileCompleted
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone?: string;
  isOnline?: boolean;
  lastActive?: number;
}

export interface Reminder {
  id: string;
  type: 'medication' | 'meal' | 'appointment' | 'custom';
  title: string;
  time: string;
  notes?: string;
  enabled: boolean;
  completed?: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  enabled: boolean;
}

export interface DistanceAlert {
  id?: string;
  maxDistance: number;
  enabled: boolean;
}

export interface LinkedPatient {
  id: string;
  name: string;
  relation: string;
  linkedAt: number;
  patientId?: string;
}

export interface MovementData {
  steps: number;
  lastMovement: number;
  status: 'active' | 'inactive' | 'unusual';
}

export interface FallAlert {
  id: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface BatteryInfo {
  level: number;
  isCharging: boolean;
  lastUpdate: number;
}

export interface WeeklyReport {
  totalSteps: number;
  averageSteps: number;
  activeHours: number;
  safeZoneExits: number;
  fallIncidents: number;
  medicationCompliance: number;
  dailyData: { day: string; steps: number }[];
}

interface DataContextType {
  familyMembers: FamilyMember[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void;
  removeFamilyMember: (id: string) => void;
  
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;

  reminderLogs: ReminderLog[];
  addReminderLog: (log: Omit<ReminderLog, 'id'>) => void;
  updateReminderLog: (id: string, log: Partial<ReminderLog>) => void;
  
  safeZones: SafeZone[];
  addSafeZone: (zone: Omit<SafeZone, 'id'>) => void;
  updateSafeZone: (id: string, zone: Partial<SafeZone>) => void;
  removeSafeZone: (id: string) => void;
  
  distanceAlert: DistanceAlert;
  updateDistanceAlert: (alert: Partial<DistanceAlert>) => void;
  
  caregiverLocation: { lat: number; lng: number; timestamp: number } | null;
  setCaregiverLocation: (location: { lat: number; lng: number; timestamp: number } | null) => void;
  
  linkedPatient: LinkedPatient | null;
  setLinkedPatient: (patient: LinkedPatient | null) => void;
  
  patientLocation: { lat: number; lng: number; timestamp: number } | null;
  setPatientLocation: (location: { lat: number; lng: number; timestamp: number } | null) => void;
  
  patientBattery: BatteryInfo;
  setPatientBattery: (battery: Partial<BatteryInfo>) => void;
  
  locationSharing: boolean;
  setLocationSharing: (enabled: boolean) => void;

  movementData: MovementData;
  updateMovementData: (data: Partial<MovementData>) => void;

  fallAlerts: FallAlert[];
  addFallAlert: () => void;
  acknowledgeFallAlert: (id: string) => void;

  weeklyReport: WeeklyReport;
  
  patientProfile: PatientProfile | null;
  setPatientProfile: (profile: PatientProfile | null) => void;
  
  caregiverProfile: CaregiverProfile | null;
  setCaregiverProfile: (profile: CaregiverProfile | null) => void;

  voiceMessages: VoiceMessage[];
  addVoiceMessage: (message: Omit<VoiceMessage, 'id' | 'timestamp' | 'played'>) => void;
  markVoiceMessagePlayed: (id: string) => void;

  videoMessages: VideoMessage[];
  addVideoMessage: (message: Omit<VideoMessage, 'id' | 'timestamp' | 'played'>) => void;
  markVideoMessagePlayed: (id: string) => void;

  photos: Photo[];
  addPhoto: (photo: Omit<Photo, 'id' | 'timestamp'>) => void;

  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => void;
  markChatMessagesRead: () => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  getUnreadNotificationCount: () => number;

  musicTracks: MusicTrack[];
  addMusicTrack: (track: Omit<MusicTrack, 'id' | 'addedAt'>) => void;
  removeMusicTrack: (id: string) => void;

  musicMemories: MusicMemory[];
  addMusicMemory: (memory: Omit<MusicMemory, 'id' | 'createdAt'>) => void;
  removeMusicMemory: (id: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => void;
  removeJournalEntry: (id: string) => void;

  cognitiveResults: CognitiveResult[];
  addCognitiveResult: (result: Omit<CognitiveResult, 'id' | 'completedAt'>) => void;

  moodAnalysis: MoodAnalysis | null;
  analyzeWellness: () => void;
  wellnessChecks: WellnessCheck[];
  addWellnessCheck: (check: Omit<WellnessCheck, 'id' | 'timestamp'>) => void;

  emergencySettings: EmergencySettings;
  updateEmergencySettings: (settings: Partial<EmergencySettings>) => void;
  
  emergencyAlerts: EmergencyAlert[];
  createEmergencyAlert: (type: AlertType, title: string, message: string, location?: { lat: number; lng: number }) => void;
  acknowledgeAlert: (id: string, acknowledgedBy: string) => void;
  escalateAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  updatePatientActivity: () => void;
  checkInactivity: () => void;
  checkSafeZoneBreach: () => void;
  triggerFallAlert: () => void;
  triggerSOS: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [distanceAlert, setDistanceAlert] = useState<DistanceAlert>({ maxDistance: 5, enabled: false });
  const [linkedPatient, setLinkedPatient] = useState<LinkedPatient | null>(null);
  const [patientLocation, setPatientLocation] = useState<{ lat: number; lng: number; timestamp: number } | null>(null);
  const [caregiverLocation, setCaregiverLocation] = useState<{ lat: number; lng: number; timestamp: number } | null>(null);
  const [patientBattery, setPatientBatteryState] = useState<BatteryInfo>({ level: 100, isCharging: false, lastUpdate: Date.now() });
  const [locationSharing, setLocationSharing] = useState(true);
  const [movementData, setMovementData] = useState<MovementData>({ steps: 0, lastMovement: Date.now(), status: 'active' });
  const [fallAlerts, setFallAlerts] = useState<FallAlert[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>({
    totalSteps: 0,
    averageSteps: 0,
    activeHours: 0,
    safeZoneExits: 0,
    fallIncidents: 0,
    medicationCompliance: 0,
    dailyData: []
  });
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfile | null>(null);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [videoMessages, setVideoMessages] = useState<VideoMessage[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [musicMemories, setMusicMemories] = useState<MusicMemory[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [cognitiveResults, setCognitiveResults] = useState<CognitiveResult[]>([]);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [wellnessChecks, setWellnessChecks] = useState<WellnessCheck[]>([]);
  const [emergencySettings, setEmergencySettings] = useState<EmergencySettings>({
    enabled: true,
    inactivityTimeout: 60,
    inactivityEnabled: true,
    safeZoneAlertsEnabled: true,
    fallAlertsEnabled: true,
    sosAlertsEnabled: true,
    caregiverResponseTimeout: 30,
    familyResponseTimeout: 30,
    emergencyContacts: [],
    lastPatientActivity: Date.now(),
    isOfflineMode: false,
  });
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFamilyMembers(data.familyMembers || []);
      setReminders(data.reminders || []);
      setReminderLogs(data.reminderLogs || []);
      setSafeZones(data.safeZones || []);
      setDistanceAlert(data.distanceAlert || { maxDistance: 5, enabled: false });
      setCaregiverLocation(data.caregiverLocation || null);
      setLinkedPatient(data.linkedPatient || null);
      setLocationSharing(data.locationSharing !== false);
      setMovementData(data.movementData || { steps: 0, lastMovement: Date.now(), status: 'active' });
      setFallAlerts(data.fallAlerts || []);
      setWeeklyReport(data.weeklyReport || {
        totalSteps: 35000,
        averageSteps: 5000,
        activeHours: 6,
        safeZoneExits: 2,
        fallIncidents: 0,
        medicationCompliance: 95,
        dailyData: [
          { day: 'Mon', steps: 5200 },
          { day: 'Tue', steps: 4800 },
          { day: 'Wed', steps: 6100 },
          { day: 'Thu', steps: 3200 },
          { day: 'Fri', steps: 5500 },
          { day: 'Sat', steps: 4200 },
          { day: 'Sun', steps: 3900 },
        ]
      });
      setPatientProfile(data.patientProfile || null);
      setCaregiverProfile(data.caregiverProfile || null);
      setVoiceMessages(data.voiceMessages || []);
      setVideoMessages(data.videoMessages || []);
      setPhotos(data.photos || []);
      setChatMessages(data.chatMessages || []);
      setNotifications(data.notifications || []);
      setMusicTracks(data.musicTracks || []);
      setMusicMemories(data.musicMemories || []);
      setJournalEntries(data.journalEntries || []);
      setCognitiveResults(data.cognitiveResults || []);
      setMoodAnalysis(data.moodAnalysis || null);
      setWellnessChecks(data.wellnessChecks || []);
      setEmergencySettings(prev => ({
        ...prev,
        ...data.emergencySettings,
        lastPatientActivity: data.emergencySettings?.lastPatientActivity || Date.now(),
      }));
      setEmergencyAlerts(data.emergencyAlerts || []);
    }
  }, []);

  const saveData = () => {
    localStorage.setItem('appData', JSON.stringify({
      familyMembers,
      reminders,
      reminderLogs,
      safeZones,
      distanceAlert,
      caregiverLocation,
      linkedPatient,
      locationSharing,
      movementData,
      fallAlerts,
      weeklyReport,
      patientProfile,
      caregiverProfile,
      voiceMessages,
      videoMessages,
      photos,
      chatMessages,
      notifications,
      musicTracks,
      musicMemories,
      journalEntries,
      cognitiveResults,
      moodAnalysis,
      wellnessChecks,
      emergencySettings,
      emergencyAlerts,
    }));
  };

  useEffect(() => {
    saveData();
  }, [familyMembers, reminders, reminderLogs, safeZones, distanceAlert, caregiverLocation, linkedPatient, locationSharing, movementData, fallAlerts, weeklyReport, patientProfile, caregiverProfile, voiceMessages, videoMessages, photos, chatMessages, notifications, musicTracks, musicMemories, journalEntries, cognitiveResults, moodAnalysis, wellnessChecks, emergencySettings, emergencyAlerts]);

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    setFamilyMembers(prev => [...prev, { ...member, id: Date.now().toString() }]);
  };

  const updateFamilyMember = (id: string, member: Partial<FamilyMember>) => {
    setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...member } : m));
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    setReminders(prev => [...prev, { ...reminder, id: Date.now().toString() }]);
  };

  const updateReminder = (id: string, reminder: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...reminder } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addReminderLog = (log: Omit<ReminderLog, 'id'>) => {
    setReminderLogs(prev => [...prev, { ...log, id: Date.now().toString() }]);
  };

  const updateReminderLog = (id: string, log: Partial<ReminderLog>) => {
    setReminderLogs(prev => prev.map(l => l.id === id ? { ...l, ...log } : l));
  };

  const addSafeZone = (zone: Omit<SafeZone, 'id'>) => {
    setSafeZones(prev => [...prev, { ...zone, id: Date.now().toString() }]);
  };

  const updateSafeZone = (id: string, zone: Partial<SafeZone>) => {
    setSafeZones(prev => prev.map(z => z.id === id ? { ...z, ...zone } : z));
  };

  const removeSafeZone = (id: string) => {
    setSafeZones(prev => prev.filter(z => z.id !== id));
  };

  const updateDistanceAlert = (alert: Partial<DistanceAlert>) => {
    setDistanceAlert(prev => ({ ...prev, ...alert }));
  };

  const setPatientBattery = (battery: Partial<BatteryInfo>) => {
    setPatientBatteryState(prev => ({ ...prev, ...battery, lastUpdate: Date.now() }));
  };

  const updateMovementData = (data: Partial<MovementData>) => {
    setMovementData(prev => ({ ...prev, ...data }));
  };

  const addFallAlert = () => {
    setFallAlerts(prev => [...prev, { id: Date.now().toString(), timestamp: Date.now(), acknowledged: false }]);
  };

  const acknowledgeFallAlert = (id: string) => {
    setFallAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const addVoiceMessage = (message: Omit<VoiceMessage, 'id' | 'timestamp' | 'played'>) => {
    setVoiceMessages(prev => [...prev, { 
      ...message, 
      id: Date.now().toString(), 
      timestamp: Date.now(),
      played: false 
    }]);
  };

  const markVoiceMessagePlayed = (id: string) => {
    setVoiceMessages(prev => prev.map(m => m.id === id ? { ...m, played: true } : m));
  };

  const addVideoMessage = (message: Omit<VideoMessage, 'id' | 'timestamp' | 'played'>) => {
    setVideoMessages(prev => [...prev, { 
      ...message, 
      id: Date.now().toString(), 
      timestamp: Date.now(),
      played: false 
    }]);
  };

  const markVideoMessagePlayed = (id: string) => {
    setVideoMessages(prev => prev.map(m => m.id === id ? { ...m, played: true } : m));
  };

  const addPhoto = (photo: Omit<Photo, 'id' | 'timestamp'>) => {
    setPhotos(prev => [...prev, { ...photo, id: Date.now().toString(), timestamp: Date.now() }]);
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => {
    setChatMessages(prev => [...prev, { 
      ...message, 
      id: Date.now().toString(), 
      timestamp: Date.now(),
      read: false 
    }]);
  };

  const markChatMessagesRead = () => {
    setChatMessages(prev => prev.map(m => ({ ...m, read: true })));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [...prev, { 
      ...notification, 
      id: Date.now().toString(), 
      timestamp: Date.now(),
      read: false 
    }]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const addMusicTrack = (track: Omit<MusicTrack, 'id' | 'addedAt'>) => {
    setMusicTracks(prev => [...prev, { 
      ...track, 
      id: Date.now().toString(), 
      addedAt: Date.now() 
    }]);
  };

  const removeMusicTrack = (id: string) => {
    setMusicTracks(prev => prev.filter(t => t.id !== id));
    setMusicMemories(prev => prev.filter(m => m.trackId !== id));
  };

  const addMusicMemory = (memory: Omit<MusicMemory, 'id' | 'createdAt'>) => {
    setMusicMemories(prev => [...prev, { 
      ...memory, 
      id: Date.now().toString(), 
      createdAt: Date.now() 
    }]);
  };

  const removeMusicMemory = (id: string) => {
    setMusicMemories(prev => prev.filter(m => m.id !== id));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    setJournalEntries(prev => [...prev, { 
      ...entry, 
      id: Date.now().toString(), 
      createdAt: Date.now() 
    }]);
  };

  const removeJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const addCognitiveResult = (result: Omit<CognitiveResult, 'id' | 'completedAt'>) => {
    setCognitiveResults(prev => [...prev, { 
      ...result, 
      id: Date.now().toString(), 
      completedAt: Date.now() 
    }]);
  };

  const analyzeWellness = useCallback(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const threeDays = 3 * oneDay;
    const oneWeek = 7 * oneDay;

    const recentJournal = journalEntries.filter(j => now - j.createdAt < oneWeek);
    const recentMusic = musicMemories.filter(m => now - m.createdAt < oneWeek);
    const recentExercise = cognitiveResults.filter(c => now - c.completedAt < oneWeek);
    const recentReminders = reminderLogs.filter(r => now - parseInt(r.date) < oneWeek);
    const recentChat = chatMessages.filter(c => now - c.timestamp < oneWeek);
    const recentVoice = voiceMessages.filter(v => now - v.timestamp < oneWeek);

    const allContent = [
      ...recentJournal.map(j => j.content),
      ...recentMusic.map(m => m.content),
    ].join(' ').toLowerCase();

    const sadWords = ['sad', 'lonely', 'miss', 'lost', 'crying', 'depressed', 'unhappy', 'hurt', 'pain', 'grief', 'gone', 'remember', 'memory', 'forget'];
    const stressWords = ['worried', 'anxious', 'stress', 'nervous', 'panic', 'overwhelmed', 'busy', 'rush', 'pressure'];
    const confusedWords = ['confused', 'forgot', 'confused', 'lost', 'don\'t know', 'uncertain', 'upset', 'frustrated'];
    const happyWords = ['happy', 'joy', 'love', 'wonderful', 'great', 'good', 'grateful', 'blessed', 'amazing', 'beautiful', 'smile', 'laugh'];
    const lonelyWords = ['lonely', 'alone', 'miss', 'nobody', 'no one', 'empty', 'isolated', 'solitary'];

    let sadnessScore = sadWords.filter(w => allContent.includes(w)).length;
    let stressScore = stressWords.filter(w => allContent.includes(w)).length;
    let confusionScore = confusedWords.filter(w => allContent.includes(w)).length;
    let happinessScore = happyWords.filter(w => allContent.includes(w)).length;
    let lonelinessScore = lonelyWords.filter(w => allContent.includes(w)).length;

    const missedReminders = recentReminders.filter(r => !r.completed && r.dismissed);
    if (missedReminders.length > 2) {
      stressScore += missedReminders.length;
    }

    const exerciseScores = recentExercise.map(e => (e.score / e.totalQuestions) * 100);
    const avgExerciseScore = exerciseScores.length > 0 
      ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length 
      : 50;
    
    if (avgExerciseScore < 40) {
      confusionScore += 2;
    }

    const flags = {
      stress: stressScore >= 2,
      sadness: sadnessScore >= 2 || lonelinessScore >= 1,
      confusion: confusionScore >= 1,
      loneliness: lonelinessScore >= 1 || (recentChat.length === 0 && recentVoice.length === 0 && now - journalEntries[journalEntries.length - 1]?.createdAt > threeDays),
    };

    const interactions = recentChat.length + recentVoice.length + recentJournal.length + recentMusic.length;
    const daysSinceLastInteraction = journalEntries.length > 0 
      ? Math.floor((now - journalEntries[journalEntries.length - 1].createdAt) / oneDay)
      : 999;

    let overallMood: MoodAnalysis['overallMood'] = 'neutral';
    let recommendations: string[] = [];

    if (flags.loneliness || daysSinceLastInteraction >= 3) {
      overallMood = 'lonely';
      recommendations = [
        'I notice you haven\'t been as active lately. How about we call a family member?',
        'Your family would love to hear from you!',
        'Would you like me to start a conversation with you?',
        'Let\'s do something fun together!',
      ];
    } else if (flags.sadness) {
      overallMood = 'sad';
      recommendations = [
        'I\'m here for you. It\'s okay to feel sad sometimes.',
        'Would you like to talk about what\'s on your mind?',
        'Remember, your family loves you very much.',
        'Would listening to some of your favorite music help?',
      ];
    } else if (flags.stress) {
      overallMood = 'anxious';
      recommendations = [
        'Take a deep breath. Everything will be okay.',
        'Would you like to try a relaxing activity?',
        'Your caregiver is always here to help.',
        'How about we listen to some calming music together?',
      ];
    } else if (flags.confusion) {
      overallMood = 'confused';
      recommendations = [
        'It\'s okay to feel confused. Let\'s work through this together.',
        'Would you like me to help you with something?',
        'Your caregiver is just a message away if you need help.',
        'Let\'s take it one step at a time.',
      ];
    } else if (happinessScore > sadnessScore && interactions > 5) {
      overallMood = 'happy';
      recommendations = [
        'I\'m so glad you\'re feeling good today!',
        'Keep up the great work with your activities!',
        'Your positive energy is wonderful!',
      ];
    } else if (interactions > 3) {
      overallMood = 'content';
      recommendations = [
        'You\'re doing great! Keep up your activities.',
        'I\'m here whenever you need me.',
        'Remember to stay active and engaged!',
      ];
    }

    const analysis: MoodAnalysis = {
      overallMood,
      confidence: Math.min(95, 50 + interactions * 5),
      triggers: [
        ...(flags.sadness ? ['sadness'] : []),
        ...(flags.stress ? ['stress'] : []),
        ...(flags.confusion ? ['confusion'] : []),
        ...(flags.loneliness ? ['loneliness'] : []),
      ],
      lastInteraction: now,
      interactionStreak: interactions,
      flags,
      recommendations,
    };

    setMoodAnalysis(analysis);
    setWellnessChecks(prev => [...prev.slice(-29), {
      id: Date.now().toString(),
      timestamp: now,
      moodAnalysis: analysis,
      trigger: daysSinceLastInteraction >= 3 ? 'low_interaction' : 'scheduled',
    }]);

    return analysis;
  }, [journalEntries, musicMemories, cognitiveResults, reminderLogs, chatMessages, voiceMessages]);

  const addWellnessCheck = (check: Omit<WellnessCheck, 'id' | 'timestamp'>) => {
    setWellnessChecks(prev => [...prev, { 
      ...check, 
      id: Date.now().toString(), 
      timestamp: Date.now() 
    }]);
  };

  const updateEmergencySettings = (settings: Partial<EmergencySettings>) => {
    setEmergencySettings(prev => ({ ...prev, ...settings }));
  };

  const createEmergencyAlert = useCallback((type: AlertType, title: string, message: string, location?: { lat: number; lng: number }) => {
    if (!emergencySettings.enabled) return;
    if (!emergencySettings[`${type}AlertsEnabled` as keyof EmergencySettings] && type !== 'sos') return;

    const alert: EmergencyAlert = {
      id: Date.now().toString(),
      type,
      level: 'caregiver',
      status: 'active',
      title,
      message,
      timestamp: Date.now(),
      location,
      isOffline: emergencySettings.isOfflineMode,
    };

    setEmergencyAlerts(prev => [...prev, alert]);
    setActiveAlertId(alert.id);

    const contacts = emergencySettings.emergencyContacts;
    
    if (emergencySettings.isOfflineMode && navigator.onLine === false) {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineAlerts') || '[]');
      offlineQueue.push({ ...alert, queuedAt: Date.now() });
      localStorage.setItem('offlineAlerts', JSON.stringify(offlineQueue));
    }

    if (contacts.length > 0 && emergencySettings.caregiverResponseTimeout > 0) {
      setTimeout(() => {
        setEmergencyAlerts(prev => {
          const currentAlert = prev.find(a => a.id === alert.id && a.status === 'active');
          if (currentAlert) {
            return prev.map(a => a.id === alert.id ? { ...a, level: 'family' as AlertLevel, status: 'escalated' as const, escalatedAt: Date.now() } : a);
          }
          return prev;
        });
      }, emergencySettings.caregiverResponseTimeout * 1000);

      setTimeout(() => {
        setEmergencyAlerts(prev => {
          const currentAlert = prev.find(a => a.id === alert.id && a.level === 'family');
          if (currentAlert) {
            return prev.map(a => a.id === alert.id ? { ...a, level: 'emergency' as AlertLevel, status: 'escalated' as const } : a);
          }
          return prev;
        });
      }, emergencySettings.caregiverResponseTimeout * 1000 + emergencySettings.familyResponseTimeout * 1000);
    }

  }, [emergencySettings]);

  const acknowledgeAlert = (id: string, acknowledgedBy: string) => {
    setEmergencyAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'acknowledged' as const, acknowledgedBy, acknowledgedAt: Date.now() } : a
    ));
    if (activeAlertId === id) {
      setActiveAlertId(null);
    }
  };

  const escalateAlert = (id: string) => {
    const alert = emergencyAlerts.find(a => a.id === id);
    if (!alert) return;

    const contacts = emergencySettings.emergencyContacts;
    const currentLevel = alert.level;
    
    let nextContact: EmergencyContact | undefined;
    if (currentLevel === 'caregiver') {
      nextContact = contacts.find(c => c.priority === 2 && c.notifyOnEscalation);
    } else if (currentLevel === 'family') {
      nextContact = contacts.find(c => c.priority === 3 && c.notifyOnEscalation);
    }

    if (nextContact) {
      const nextLevel: AlertLevel = currentLevel === 'caregiver' ? 'family' : 'emergency';
      setEmergencyAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, level: nextLevel, status: 'escalated' as const, escalatedTo: nextContact?.name, escalatedAt: Date.now() } : a
      ));
    }
  };

  const resolveAlert = (id: string) => {
    setEmergencyAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'resolved' as const, resolvedAt: Date.now() } : a
    ));
    if (activeAlertId === id) {
      setActiveAlertId(null);
    }
  };

  const updatePatientActivity = useCallback(() => {
    setEmergencySettings(prev => ({ ...prev, lastPatientActivity: Date.now() }));
  }, []);

  const checkInactivity = useCallback(() => {
    if (!emergencySettings.inactivityEnabled) return;
    
    const now = Date.now();
    const inactiveMinutes = Math.floor((now - emergencySettings.lastPatientActivity) / 60000);
    
    if (inactiveMinutes >= emergencySettings.inactivityTimeout) {
      const existingInactivityAlert = emergencyAlerts.find(
        a => a.type === 'inactivity' && a.status === 'active'
      );
      if (!existingInactivityAlert) {
        createEmergencyAlert(
          'inactivity',
          'Patient Inactivity Alert',
          `No activity detected for ${inactiveMinutes} minutes. Please check on the patient.`,
          undefined
        );
      }
    }
  }, [emergencySettings.inactivityEnabled, emergencySettings.inactivityTimeout, emergencySettings.lastPatientActivity, createEmergencyAlert, emergencyAlerts]);

  const checkSafeZoneBreach = useCallback(() => {
    if (!emergencySettings.safeZoneAlertsEnabled || !patientLocation) return;
    
    const enabledZones = safeZones.filter(z => z.enabled);
    if (enabledZones.length === 0) return;

    const isInsideAnyZone = enabledZones.some(zone => {
      if (!zone.latitude || !zone.longitude) return false;
      const distance = calculateDistance(
        patientLocation.lat,
        patientLocation.lng,
        zone.latitude,
        zone.longitude
      );
      return distance <= zone.radius;
    });

    if (!isInsideAnyZone) {
      const existingZoneAlert = emergencyAlerts.find(
        a => a.type === 'safe_zone' && a.status === 'active'
      );
      if (!existingZoneAlert) {
        const zoneNames = enabledZones.map(z => z.name).join(', ');
        createEmergencyAlert(
          'safe_zone',
          'Safe Zone Breach',
          `Patient has left the safe zone (${zoneNames}). Current location: ${patientLocation.lat.toFixed(4)}, ${patientLocation.lng.toFixed(4)}`,
          { lat: patientLocation.lat, lng: patientLocation.lng }
        );
        
        setWeeklyReport(prev => ({
          ...prev,
          safeZoneExits: prev.safeZoneExits + 1,
        }));
      }
    }
  }, [emergencySettings.safeZoneAlertsEnabled, patientLocation, safeZones, emergencyAlerts, createEmergencyAlert]);

  const triggerFallAlert = useCallback(() => {
    if (!emergencySettings.fallAlertsEnabled) return;
    
    const existingFallAlert = emergencyAlerts.find(
      a => a.type === 'fall' && a.status === 'active'
    );
    if (!existingFallAlert) {
      createEmergencyAlert(
        'fall',
        'Fall Detected',
        'A fall has been detected! Immediate attention required.',
        patientLocation || undefined
      );
      
      setFallAlerts(prev => [...prev, { id: Date.now().toString(), timestamp: Date.now(), acknowledged: false }]);
      setWeeklyReport(prev => ({
        ...prev,
        fallIncidents: prev.fallIncidents + 1,
      }));
    }
  }, [emergencySettings.fallAlertsEnabled, patientLocation, emergencyAlerts, createEmergencyAlert]);

  const triggerSOS = useCallback(() => {
    if (!emergencySettings.sosAlertsEnabled) return;
    
    const existingSOSAlert = emergencyAlerts.find(
      a => a.type === 'sos' && a.status === 'active'
    );
    if (!existingSOSAlert) {
      createEmergencyAlert(
        'sos',
        'SOS Emergency',
        'Patient has triggered an SOS alert! Immediate response required.',
        patientLocation || undefined
      );
    }
  }, [emergencySettings.sosAlertsEnabled, patientLocation, emergencyAlerts, createEmergencyAlert]);

  const checkDistanceAlert = useCallback(() => {
    if (!distanceAlert.enabled || !patientLocation || !caregiverLocation) return;
    
    const distance = calculateDistance(
      patientLocation.lat,
      patientLocation.lng,
      caregiverLocation.lat,
      caregiverLocation.lng
    );
    
    if (distance > distanceAlert.maxDistance) {
      const existingDistanceAlert = emergencyAlerts.find(
        a => a.type === 'safe_zone' && a.status === 'active'
      );
      if (!existingDistanceAlert) {
        createEmergencyAlert(
          'safe_zone',
          'Distance Alert - Too Far',
          `Patient is ${distance.toFixed(1)}km away (max: ${distanceAlert.maxDistance}km). They may be wandering.`,
          { lat: patientLocation.lat, lng: patientLocation.lng }
        );
      }
    }
  }, [distanceAlert, patientLocation, caregiverLocation, emergencyAlerts, createEmergencyAlert]);

  useEffect(() => {
    if (emergencySettings.inactivityEnabled && emergencySettings.enabled) {
      const interval = setInterval(() => {
        checkInactivity();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [emergencySettings.inactivityEnabled, emergencySettings.enabled, checkInactivity]);

  useEffect(() => {
    if (emergencySettings.safeZoneAlertsEnabled && emergencySettings.enabled && patientLocation) {
      checkSafeZoneBreach();
    }
  }, [patientLocation, emergencySettings.safeZoneAlertsEnabled, emergencySettings.enabled, checkSafeZoneBreach]);

  useEffect(() => {
    if (distanceAlert.enabled && patientLocation && caregiverLocation) {
      checkDistanceAlert();
    }
  }, [patientLocation, caregiverLocation, distanceAlert.enabled, checkDistanceAlert]);

  return (
    <DataContext.Provider value={{
      familyMembers,
      addFamilyMember,
      updateFamilyMember,
      removeFamilyMember,
      reminders,
      addReminder,
      updateReminder,
      removeReminder,
      reminderLogs,
      addReminderLog,
      updateReminderLog,
      safeZones,
      addSafeZone,
      updateSafeZone,
      removeSafeZone,
      distanceAlert,
      updateDistanceAlert,
      caregiverLocation,
      setCaregiverLocation,
      linkedPatient,
      setLinkedPatient,
      patientLocation,
      setPatientLocation,
      patientBattery,
      setPatientBattery,
      locationSharing,
      setLocationSharing,
      movementData,
      updateMovementData,
      fallAlerts,
      addFallAlert,
      acknowledgeFallAlert,
      weeklyReport,
      patientProfile,
      setPatientProfile,
      caregiverProfile,
      setCaregiverProfile,
      voiceMessages,
      addVoiceMessage,
      markVoiceMessagePlayed,
      videoMessages,
      addVideoMessage,
      markVideoMessagePlayed,
      photos,
      addPhoto,
      chatMessages,
      addChatMessage,
      markChatMessagesRead,
      notifications,
      addNotification,
      markNotificationRead,
      getUnreadNotificationCount,
      musicTracks,
      addMusicTrack,
      removeMusicTrack,
      musicMemories,
      addMusicMemory,
      removeMusicMemory,
      journalEntries,
      addJournalEntry,
      removeJournalEntry,
      cognitiveResults,
      addCognitiveResult,
      moodAnalysis,
      analyzeWellness,
      wellnessChecks,
      addWellnessCheck,
      emergencySettings,
      updateEmergencySettings,
      emergencyAlerts,
      createEmergencyAlert,
      acknowledgeAlert,
      escalateAlert,
      resolveAlert,
      updatePatientActivity,
      checkInactivity,
      checkSafeZoneBreach,
      triggerFallAlert,
      triggerSOS,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  fontSize: 'large',
  language: 'en',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
