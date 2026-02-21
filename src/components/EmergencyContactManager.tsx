import React, { useState } from 'react';
import { Phone, User, Trash2, Edit2, Plus, Save, X, AlertCircle } from 'lucide-react';
import { useData } from '../context/AppContext';
import type { EmergencyContact } from '../types';

export const EmergencyContactManager: React.FC = () => {
  const { emergencySettings, updateEmergencySettings } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: '',
    priority: 1,
    notifyOnEscalation: true,
  });

  const contacts = emergencySettings.emergencyContacts || [];

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      ...formData,
    };
    const updatedContacts = [...contacts, newContact].sort((a, b) => a.priority - b.priority);
    updateEmergencySettings({ emergencyContacts: updatedContacts });
    setFormData({ name: '', phone: '', relation: '', priority: 1, notifyOnEscalation: true });
    setShowAddForm(false);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const updatedContacts = contacts.map(c => 
      c.id === editingId ? { ...c, ...formData } : c
    ).sort((a, b) => a.priority - b.priority);
    updateEmergencySettings({ emergencyContacts: updatedContacts });
    setEditingId(null);
    setFormData({ name: '', phone: '', relation: '', priority: 1, notifyOnEscalation: true });
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter(c => c.id !== id).map((c, idx) => ({
        ...c,
        priority: idx + 1,
      }));
      updateEmergencySettings({ emergencyContacts: updatedContacts });
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      priority: contact.priority,
      notifyOnEscalation: contact.notifyOnEscalation,
    });
    setShowAddForm(false);
  };

  const movePriority = (id: string, direction: 'up' | 'down') => {
    const sorted = [...contacts].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex(c => c.id === id);
    if (direction === 'up' && index > 0) {
      [sorted[index - 1], sorted[index]] = [sorted[index], sorted[index - 1]];
    } else if (direction === 'down' && index < sorted.length - 1) {
      [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
    }
    const updated = sorted.map((c, idx) => ({ ...c, priority: idx + 1 }));
    updateEmergencySettings({ emergencyContacts: updated });
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Primary (Caregiver)';
      case 2: return 'Secondary (Family)';
      case 3: return 'Emergency Contact';
      default: return `Priority ${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#10B981';
      case 2: return '#F59E0B';
      case 3: return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <div className="emergency-contacts-section">
      <div className="section-header">
        <h3><Phone size={20} /> Emergency Contacts</h3>
        <button 
          className="btn btn-primary"
          onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: '', phone: '', relation: '', priority: contacts.length + 1, notifyOnEscalation: true }); }}
        >
          <Plus size={18} /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No emergency contacts configured.</p>
          <p>Add contacts to enable auto-escalation.</p>
        </div>
      ) : (
        <div className="contacts-list">
          {[...contacts].sort((a, b) => a.priority - b.priority).map((contact, index) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-priority" style={{ backgroundColor: getPriorityColor(contact.priority) }}>
                <span>{contact.priority}</span>
                <div className="priority-controls">
                  <button 
                    onClick={() => movePriority(contact.id, 'up')}
                    disabled={index === 0}
                    className="priority-btn"
                  >↑</button>
                  <button 
                    onClick={() => movePriority(contact.id, 'down')}
                    disabled={index === contacts.length - 1}
                    className="priority-btn"
                  >↓</button>
                </div>
              </div>
              <div className="contact-info">
                <div className="contact-name">
                  <User size={16} />
                  <span>{contact.name}</span>
                  <span className="priority-label" style={{ color: getPriorityColor(contact.priority) }}>
                    {getPriorityLabel(contact.priority)}
                  </span>
                </div>
                <div className="contact-details">
                  <span><Phone size={14} /> {contact.phone}</span>
                  <span>{contact.relation}</span>
                </div>
                <div className="contact-flags">
                  {contact.notifyOnEscalation && (
                    <span className="flag">Escalation Enabled</span>
                  )}
                </div>
              </div>
              <div className="contact-actions">
                <button onClick={() => handleEditContact(contact)} className="icon-btn">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDeleteContact(contact.id)} className="icon-btn danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddForm || editingId) && (
        <div className="contact-form-overlay">
          <form 
            className="contact-form"
            onSubmit={editingId ? handleUpdateContact : handleAddContact}
          >
            <div className="form-header">
              <h4>{editingId ? 'Edit Contact' : 'Add Emergency Contact'}</h4>
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contact name"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                placeholder="e.g., Son, Daughter, Neighbor"
              />
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              >
                <option value={1}>1 - Primary (Caregiver)</option>
                <option value={2}>2 - Secondary (Family)</option>
                <option value={3}>3 - Emergency Contact</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="notifyOnEscalation"
                checked={formData.notifyOnEscalation}
                onChange={(e) => setFormData({ ...formData, notifyOnEscalation: e.target.checked })}
              />
              <label htmlFor="notifyOnEscalation">Notify on escalation</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> {editingId ? 'Update' : 'Add'} Contact
              </button>
              <button 
                type="button" 
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
