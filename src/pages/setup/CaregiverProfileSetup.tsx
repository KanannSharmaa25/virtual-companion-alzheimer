import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, MapPin, Award, FileText, Save, ArrowRight, ArrowLeft, Users, Shield } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import type { CaregiverProfile } from '../../types';
import '../../styles/setup.css';

export const CaregiverProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfileCompleted } = useUser();
  const { setCaregiverProfile, setLinkedPatient } = useData();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CaregiverProfile>>({
    phone: '',
    address: '',
    relationToPatient: '',
    linkedPatientId: '',
    experience: '',
    certifications: [],
    notes: '',
  });

  const [newCertification, setNewCertification] = useState('');

  const updateField = (field: keyof CaregiverProfile, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_: unknown, i: number) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const profile: CaregiverProfile = {
      id: user?.id || '',
      phone: formData.phone || '',
      address: formData.address || '',
      relationToPatient: formData.relationToPatient || '',
      linkedPatientId: formData.linkedPatientId || '',
      experience: formData.experience || '',
      certifications: formData.certifications || [],
      notes: formData.notes || '',
    };

    setCaregiverProfile(profile);
    
    if (formData.linkedPatientId) {
      setLinkedPatient({
        id: Date.now().toString(),
        name: formData.linkedPatientId,
        relation: formData.relationToPatient || 'Patient',
        linkedAt: Date.now(),
      });
    }
    
    updateProfileCompleted(true);
    navigate('/caregiver');
  };

  const renderCertifications = () => {
    const certs = formData.certifications || [];
    if (certs.length === 0) return null;
    return (
      <div className="array-tags">
        {certs.map((cert, index) => (
          <span key={index} className="array-tag">
            {cert}
            <button type="button" onClick={() => removeCertification(index)}>×</button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-header">
          <div className="setup-logo">
            <div className="setup-logo-icon">
              <Heart size={32} />
            </div>
            <span>Caregiver Profile</span>
          </div>
          <div className="setup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <h1>
            {step === 1 && 'Your Information'}
            {step === 2 && 'Patient Information'}
            {step === 3 && 'Experience & Notes'}
          </h1>
          <p>Tell us about yourself and the patient you're caring for</p>
        </div>

        <form className="setup-form" onSubmit={(e) => { e.preventDefault(); }}>
          {step === 1 && (
            <div className="form-section">
              <div className="form-group">
                <label><Phone size={18} /> Your Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><MapPin size={18} /> Your Address</label>
                <input
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><Users size={18} /> Relationship to Patient</label>
                <select
                  value={formData.relationToPatient || ''}
                  onChange={(e) => updateField('relationToPatient', e.target.value)}
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Son-in-law">Son-in-law</option>
                  <option value="Daughter-in-law">Daughter-in-law</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Granddaughter">Granddaughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Niece">Niece</option>
                  <option value="Nephew">Nephew</option>
                  <option value="Friend">Friend</option>
                  <option value="Professional Caregiver">Professional Caregiver</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Set Caregiver Password</label>
                <p className="field-help">This password will be required for important patient actions</p>
                <input
                  type="password"
                  placeholder="Create a caregiver password"
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <div className="info-box">
                <Shield size={24} />
                <div>
                  <h4>Link Patient Account</h4>
                  <p>To monitor a patient, you'll need their account details. Ask the patient or their family member to share their account information.</p>
                </div>
              </div>

              <div className="form-group">
                <label><Users size={18} /> Patient's Name</label>
                <input
                  type="text"
                  placeholder="Enter patient's name"
                  value={formData.linkedPatientId || ''}
                  onChange={(e) => updateField('linkedPatientId', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><FileText size={18} /> Patient's Email</label>
                <input
                  type="email"
                  placeholder="Patient's registered email"
                  value={formData.experience || ''}
                  onChange={(e) => updateField('experience', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><Award size={18} /> Years of Caregiving Experience</label>
                <select
                  value={formData.certifications ? formData.certifications[0] : ''}
                  onChange={(e) => updateField('certifications', [e.target.value])}
                >
                  <option value="">Select experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <div className="form-group">
                <label><Award size={18} /> Certifications & Training</label>
                <p className="field-help">Any relevant certifications (CPR, dementia care, etc.)</p>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add a certification"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                  />
                  <button type="button" onClick={addCertification}>Add</button>
                </div>
                {renderCertifications()}
              </div>

              <div className="form-group">
                <label><FileText size={18} /> Additional Notes</label>
                <p className="field-help">Any other information about your caregiving situation</p>
                <textarea
                  placeholder="Describe your caregiving situation, special requirements, or any other relevant details..."
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={6}
                />
              </div>

              <div className="info-box success">
                <Heart size={24} />
                <div>
                  <h4>You're All Set!</h4>
                  <p>Complete your profile to start monitoring and caring for your loved one.</p>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button type="button" className="btn-submit" onClick={handleSubmit}>
                <Save size={18} /> Complete Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
