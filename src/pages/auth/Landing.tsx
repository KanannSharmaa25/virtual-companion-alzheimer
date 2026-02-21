import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Users, Bell, MapPin, MessageCircle } from 'lucide-react';
import '../../styles/landing.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Heart size={32} />
          </div>
          <span>Virtual Companion</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Compassionate Care for Alzheimer's Patients</h1>
          <p>
            A trusted companion providing safety, connection, and peace of mind 
            for patients and their caregivers. Track location, set safe zones, 
            and stay connected with your loved ones.
          </p>
          <button className="start-button" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <div className="hero-circle hero-circle-1">
              <Users size={48} />
            </div>
            <div className="hero-circle hero-circle-2">
              <Shield size={48} />
            </div>
            <div className="hero-circle hero-circle-3">
              <MapPin size={48} />
            </div>
            <div className="hero-circle hero-circle-4">
              <Bell size={48} />
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <MapPin size={32} />
            </div>
            <h3>Location Tracking</h3>
            <p>Real-time location monitoring with customizable safe zones</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3>Safe Zones</h3>
            <p>Set virtual boundaries and receive alerts when they're crossed</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Bell size={32} />
            </div>
            <h3>Fall Detection</h3>
            <p>Instant alerts for falls and emergencies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle size={32} />
            </div>
            <h3>AI Companion</h3>
            <p>24/7 AI-powered conversation and reminders</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Users size={32} />
            </div>
            <h3>Family Connection</h3>
            <p>Keep all family members informed and connected</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Heart size={32} />
            </div>
            <h3>Personalized Care</h3>
            <p>Custom profiles with medical history, triggers, and preferences</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 Virtual Companion. Built with care for Alzheimer's patients and their families.</p>
      </footer>
    </div>
  );
};
