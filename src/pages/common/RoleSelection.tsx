import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User as UserIcon, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useUser } from '../../context/AppContext';
import { Button } from '../../components/Button';
import type { UserRole } from '../../types';
import './RoleSelection.css';

export const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [step, setStep] = useState<'role' | 'name'>('role');

  const handleContinue = () => {
    if (!selectedRole || !name.trim()) {
      alert('Please enter your name');
      return;
    }

    const user = {
      id: Date.now().toString(),
      email: '',
      name: name.trim(),
      role: selectedRole,
      password: '',
      profileCompleted: false,
    };

    setUser(user);

    if (selectedRole === 'patient') {
      navigate('/patient');
    } else {
      navigate('/caregiver');
    }
  };

  return (
    <div className="role-selection">
      <div className="role-container">
        <div className="role-header">
          <div className="logo-large">
            <Heart size={40} color="white" />
          </div>
          <h1>Virtual Companion</h1>
          <p>Supporting Alzheimer's patients and their families</p>
        </div>

        <div className="role-content">
          {step === 'role' ? (
            <>
              <h2>How will you use this app?</h2>
              
              <div className="role-cards">
                <button
                  className={`role-card ${selectedRole === 'patient' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('patient')}
                >
                  <div className="role-icon-large patient-bg">
                    <UserIcon size={48} color="#10B981" />
                  </div>
                  <h3>Patient</h3>
                  <p>Get daily reminders, AI companionship, and stay connected with family</p>
                </button>

                <button
                  className={`role-card ${selectedRole === 'caregiver' ? 'selected' : ''}`}
                  onClick={() => setSelectedRole('caregiver')}
                >
                  <div className="role-icon-large caregiver-bg">
                    <Users size={48} color="#3B82F6" />
                  </div>
                  <h3>Caregiver / Family</h3>
                  <p>Monitor location, set safe zones, and receive alerts to keep your loved one safe</p>
                </button>
              </div>

              {selectedRole && (
                <div className="continue-btn">
                  <Button onClick={() => setStep('name')} size="large">
                    Continue <ArrowRight size={20} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="name-input-section">
              <label>What's your name?</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              />

              <div className="button-row">
                <Button variant="outline" onClick={() => setStep('role')}>
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button onClick={handleContinue} size="large">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
