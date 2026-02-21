export type UserRole = 'patient' | 'caregiver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  linkedTo?: string;
  relation?: string;
  password: string;
  profileCompleted: boolean;
}

export interface PatientProfile {
  id: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  medicalHistory: string[];
  currentMedications: string[];
  traumas: string[];
  triggers: string[];
  cognitiveState?: string;
  doctorName?: string;
  doctorPhone?: string;
  bloodType?: string;
  allergies: string[];
  notes?: string;
}

export interface CaregiverProfile {
  id: string;
  phone?: string;
  address?: string;
  relationToPatient: string;
  linkedPatientId?: string;
  experience?: string;
  certifications?: string[];
  notes?: string;
}

export interface AppSettings {
  darkMode: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  language: string;
}

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

export interface ReminderLog {
  id: string;
  reminderId: string;
  reminderTitle: string;
  scheduledTime: string;
  completedTime?: string;
  completed: boolean;
  dismissed: boolean;
  date: string;
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

export interface CaregiverLocation {
  lat: number;
  lng: number;
  timestamp: number;
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

export interface WeeklyReport {
  totalSteps: number;
  averageSteps: number;
  activeHours: number;
  safeZoneExits: number;
  fallIncidents: number;
  medicationCompliance: number;
  dailyData: { day: string; steps: number }[];
}

export interface BatteryInfo {
  level: number;
  isCharging: boolean;
  lastUpdate: number;
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  audioData: string;
  duration: number;
  timestamp: number;
  played: boolean;
}

export interface VideoMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  videoData: string;
  thumbnail?: string;
  duration: number;
  timestamp: number;
  played: boolean;
}

export interface Photo {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  imageData: string;
  caption?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  type: 'reminder_completed' | 'reminder_missed' | 'fall_alert' | 'safe_zone_exit' | 'message' | 'photo' | 'voice';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
}

export interface MusicTrack {
  id: string;
  name: string;
  audioData: string;
  duration: number;
  addedAt: number;
}

export interface MusicMemory {
  id: string;
  trackId: string;
  trackName: string;
  type: 'text' | 'voice';
  content: string;
  audioData?: string;
  audioDuration?: number;
  createdAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  audioData?: string;
  audioDuration?: number;
  prompt?: string;
  mood?: string;
  createdAt: number;
}

export interface CognitiveExercise {
  id: string;
  type: 'match_faces' | 'identify_objects' | 'recall_names' | 'sequence_memory' | 'word_recall' | 'picture_match';
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CognitiveResult {
  id: string;
  exerciseId: string;
  exerciseName: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completedAt: number;
  date: string;
}

export interface MoodAnalysis {
  overallMood: 'happy' | 'content' | 'neutral' | 'sad' | 'anxious' | 'lonely' | 'confused';
  confidence: number;
  triggers: string[];
  lastInteraction: number;
  interactionStreak: number;
  flags: {
    stress: boolean;
    sadness: boolean;
    confusion: boolean;
    loneliness: boolean;
  };
  recommendations: string[];
}

export interface WellnessCheck {
  id: string;
  timestamp: number;
  moodAnalysis: MoodAnalysis;
  trigger: 'scheduled' | 'low_interaction' | 'manual';
}

export type AlertType = 'inactivity' | 'safe_zone' | 'fall' | 'sos' | 'low_battery';
export type AlertLevel = 'caregiver' | 'family' | 'emergency';
export type AlertStatus = 'active' | 'acknowledged' | 'escalated' | 'resolved';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: number;
  notifyOnEscalation: boolean;
}

export interface EmergencySettings {
  enabled: boolean;
  inactivityTimeout: number;
  inactivityEnabled: boolean;
  safeZoneAlertsEnabled: boolean;
  fallAlertsEnabled: boolean;
  sosAlertsEnabled: boolean;
  caregiverResponseTimeout: number;
  familyResponseTimeout: number;
  emergencyContacts: EmergencyContact[];
  lastPatientActivity: number;
  isOfflineMode: boolean;
}

export interface EmergencyAlert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  message: string;
  timestamp: number;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  escalatedTo?: string;
  escalatedAt?: number;
  resolvedAt?: number;
  location?: { lat: number; lng: number };
  isOffline: boolean;
}
