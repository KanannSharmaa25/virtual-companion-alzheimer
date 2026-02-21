import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/AppContext';
import { DataProvider } from './context/AppContext';
import { Landing } from './pages/auth/Landing';
import { Login } from './pages/auth/Login';
import { RoleSelection } from './pages/auth/RoleSelection';
import { PatientProfileSetup } from './pages/setup/PatientProfileSetup';
import { CaregiverProfileSetup } from './pages/setup/CaregiverProfileSetup';
import { PatientHome } from './pages/patient/PatientHome';
import { PatientTalk } from './pages/patient/PatientTalk';
import { PatientFamily } from './pages/patient/PatientFamily';
import { PatientSOS } from './pages/patient/PatientSOS';
import { PatientLocation } from './pages/patient/PatientLocation';
import { PatientReminders } from './pages/patient/PatientReminders';
import { PatientMovement } from './pages/patient/PatientMovement';
import { VoiceMessages } from './pages/patient/VoiceMessages';
import { PhotoGallery } from './pages/patient/PhotoGallery';
import { Chat } from './pages/patient/Chat';
import { PatientSettings } from './pages/patient/PatientSettings';
import { MusicTherapy } from './pages/patient/MusicTherapy';
import { PatientJournal } from './pages/patient/PatientJournal';
import { PatientCognitiveExercises } from './pages/patient/PatientCognitiveExercises';
import { PatientWellness } from './pages/patient/PatientWellness';
import { CaregiverDashboard } from './pages/caregiver/CaregiverDashboard';
import { CaregiverExercises } from './pages/caregiver/CaregiverExercises';
import { CaregiverLocation } from './pages/caregiver/CaregiverLocation';
import { CaregiverSafeZone } from './pages/caregiver/CaregiverSafeZone';
import { CaregiverReports } from './pages/caregiver/CaregiverReports';
import { CaregiverMovement } from './pages/caregiver/CaregiverMovement';
import { CaregiverAlerts } from './pages/caregiver/CaregiverAlerts';
import { CaregiverBattery } from './pages/caregiver/CaregiverBattery';
import { CaregiverSettings } from './pages/caregiver/CaregiverSettings';
import { Layout } from './components/Layout';
import { EmergencyAlarmManager } from './components/EmergencyAlertAlarm';
import { OfflineIndicator } from './components/OfflineIndicator';
import './styles/global.css';
import './styles/forms.css';

const PatientRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PatientHome />} />
        <Route path="/talk" element={<PatientTalk />} />
        <Route path="/wellness" element={<PatientWellness />} />
        <Route path="/journal" element={<PatientJournal />} />
        <Route path="/exercises" element={<PatientCognitiveExercises />} />
        <Route path="/reminders" element={<PatientReminders />} />
        <Route path="/family" element={<PatientFamily />} />
        <Route path="/voice" element={<VoiceMessages />} />
        <Route path="/photos" element={<PhotoGallery />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/music" element={<MusicTherapy />} />
        <Route path="/settings" element={<PatientSettings />} />
        <Route path="/location" element={<PatientLocation />} />
        <Route path="/movement" element={<PatientMovement />} />
        <Route path="/sos" element={<PatientSOS />} />
      </Routes>
    </Layout>
  );
};

const CaregiverRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CaregiverDashboard />} />
        <Route path="/exercises" element={<CaregiverExercises />} />
        <Route path="/location" element={<CaregiverLocation />} />
        <Route path="/safezone" element={<CaregiverSafeZone />} />
        <Route path="/reports" element={<CaregiverReports />} />
        <Route path="/movement" element={<CaregiverMovement />} />
        <Route path="/voice" element={<VoiceMessages />} />
        <Route path="/photos" element={<PhotoGallery />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/alerts" element={<CaregiverAlerts />} />
        <Route path="/battery" element={<CaregiverBattery />} />
        <Route path="/settings" element={<CaregiverSettings />} />
      </Routes>
    </Layout>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const SetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.profileCompleted) {
    return <Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      
      <Route path="/login" element={
        user ? (
          user.profileCompleted 
            ? <Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace />
            : <Navigate to={user.role === 'patient' ? '/setup/patient' : '/setup/caregiver'} replace />
        ) : <Login />
      } />
      
      <Route path="/register" element={
        user ? (
          user.profileCompleted 
            ? <Navigate to={user.role === 'patient' ? '/patient' : '/caregiver'} replace />
            : <Navigate to={user.role === 'patient' ? '/setup/patient' : '/setup/caregiver'} replace />
        ) : <RoleSelection />
      } />
      
      <Route path="/setup/patient" element={
        <SetupGuard>
          <PatientProfileSetup />
        </SetupGuard>
      } />
      <Route path="/setup/caregiver" element={
        <SetupGuard>
          <CaregiverProfileSetup />
        </SetupGuard>
      } />
      
      <Route path="/patient/*" element={
        <ProtectedRoute>
          <PatientRoutes />
        </ProtectedRoute>
      } />
      <Route path="/caregiver/*" element={
        <ProtectedRoute>
          <CaregiverRoutes />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <DataProvider>
          <OfflineIndicator />
          <EmergencyAlarmManager />
          <AppRoutes />
        </DataProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
