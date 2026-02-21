import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Pill, AlertTriangle, FileText, Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { useUser, useData } from '../../context/AppContext';
import type { PatientProfile } from '../../types';
import '../../styles/setup.css';

export const PatientProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfileCompleted } = useUser();
  const { setPatientProfile } = useData();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({
    dateOfBirth: '',
    address: '',
    phone: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    medicalHistory: [],
    currentMedications: [],
    traumas: [],
    triggers: [],
    cognitiveState: '',
    doctorName: '',
    doctorPhone: '',
    bloodType: '',
    allergies: [],
    notes: '',
  });

  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newTrauma, setNewTrauma] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newMedicalHistory, setNewMedicalHistory] = useState('');

  const updateField = (field: keyof PatientProfile, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEmergencyContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact!, [field]: value }
    }));
  };

  const addToArray = (array: 'medicalHistory' | 'currentMedications' | 'traumas' | 'triggers' | 'allergies', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [array]: [...(prev[array] || []), value.trim()]
      }));
      setter('');
    }
  };

  const removeFromArray = (array: 'medicalHistory' | 'currentMedications' | 'traumas' | 'triggers' | 'allergies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [array]: (prev[array] || []).filter((_: unknown, i: number) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const profile: PatientProfile = {
      id: user?.id || '',
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      medicalHistory: formData.medicalHistory || [],
      currentMedications: formData.currentMedications || [],
      traumas: formData.traumas || [],
      triggers: formData.triggers || [],
      cognitiveState: formData.cognitiveState,
      doctorName: formData.doctorName,
      doctorPhone: formData.doctorPhone,
      bloodType: formData.bloodType,
      allergies: formData.allergies || [],
      notes: formData.notes,
    };

    setPatientProfile(profile);
    updateProfileCompleted(true);
    navigate('/patient');
  };

  const renderArrayItems = (array: string[], type: string) => {
    if (!array || array.length === 0) return null;
    return (
      <div className="array-tags">
        {array.map((item, index) => (
          <span key={index} className="array-tag">
            {item}
            <button type="button" onClick={() => removeFromArray(type as any, index)}>×</button>
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
              <User size={32} />
            </div>
            <span>Patient Profile</span>
          </div>
          <div className="setup-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
          <h1>
            {step === 1 && 'Personal Information'}
            {step === 2 && 'Medical Details'}
            {step === 3 && 'Additional Information'}
          </h1>
          <p>Please provide your information to help us care for you better</p>
        </div>

        <form className="setup-form" onSubmit={(e) => { e.preventDefault(); }}>
          {step === 1 && (
            <div className="form-section">
              <div className="form-group">
                <label><User size={18} /> Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><MapPin size={18} /> Address</label>
                <input
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><Phone size={18} /> Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>

              <div className="form-section-title">Emergency Contact</div>
              
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  placeholder="Emergency contact name"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => updateEmergencyContact('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Emergency contact phone"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => updateEmergencyContact('phone', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  placeholder="e.g., Son, Daughter, Spouse"
                  value={formData.emergencyContact?.relation || ''}
                  onChange={(e) => updateEmergencyContact('relation', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <div className="form-group">
                <label><Pill size={18} /> Blood Type</label>
                <select
                  value={formData.bloodType || ''}
                  onChange={(e) => updateField('bloodType', e.target.value)}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label><FileText size={18} /> Allergies</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add an allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                  />
                  <button type="button" onClick={() => addToArray('allergies', newAllergy, setNewAllergy)}>Add</button>
                </div>
                {renderArrayItems(formData.allergies || [], 'allergies')}
              </div>

              <div className="form-group">
                <label><Pill size={18} /> Current Medications</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add a medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                  />
                  <button type="button" onClick={() => addToArray('currentMedications', newMedication, setNewMedication)}>Add</button>
                </div>
                {renderArrayItems(formData.currentMedications || [], 'currentMedications')}
              </div>

              <div className="form-group">
                <label><FileText size={18} /> Medical History</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add medical condition"
                    value={newMedicalHistory}
                    onChange={(e) => setNewMedicalHistory(e.target.value)}
                  />
                  <button type="button" onClick={() => addToArray('medicalHistory', newMedicalHistory, setNewMedicalHistory)}>Add</button>
                </div>
                {renderArrayItems(formData.medicalHistory || [], 'medicalHistory')}
              </div>

              <div className="form-group">
                <label>Primary Doctor's Name</label>
                <input
                  type="text"
                  placeholder="Doctor's name"
                  value={formData.doctorName || ''}
                  onChange={(e) => updateField('doctorName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Doctor's Phone</label>
                <input
                  type="tel"
                  placeholder="Doctor's phone number"
                  value={formData.doctorPhone || ''}
                  onChange={(e) => updateField('doctorPhone', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <div className="form-group">
                <label><AlertTriangle size={18} /> Traumas (Past Experiences)</label>
                <p className="field-help">List any traumatic experiences that may affect care</p>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add a trauma"
                    value={newTrauma}
                    onChange={(e) => setNewTrauma(e.target.value)}
                  />
                  <button type="button" onClick={() => addToArray('traumas', newTrauma, setNewTrauma)}>Add</button>
                </div>
                {renderArrayItems(formData.traumas || [], 'traumas')}
              </div>

              <div className="form-group">
                <label><AlertTriangle size={18} /> Triggers (Things to Avoid)</label>
                <p className="field-help">List things that may cause distress or agitation</p>
                <div className="input-with-button">
                  <input
                    type="text"
                    placeholder="Add a trigger"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                  />
                  <button type="button" onClick={() => addToArray('triggers', newTrigger, setNewTrigger)}>Add</button>
                </div>
                {renderArrayItems(formData.triggers || [], 'triggers')}
              </div>

              <div className="form-group">
                <label>Cognitive State</label>
                <textarea
                  placeholder="Describe current cognitive state (optional)"
                  value={formData.cognitiveState || ''}
                  onChange={(e) => updateField('cognitiveState', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Any other information caregivers should know"
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={4}
                />
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
