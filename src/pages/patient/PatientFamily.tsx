import React, { useState } from 'react';
import { MapPin, Phone, MessageCircle, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useData, type FamilyMember } from '../../context/AppContext';
import './PatientFamily.css';

export const PatientFamily: React.FC = () => {
  const { familyMembers, addFamilyMember, updateFamilyMember, removeFamilyMember, locationSharing, setLocationSharing } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', relation: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.relation.trim()) return;

    if (editingId) {
      updateFamilyMember(editingId, formData);
      setEditingId(null);
    } else {
      addFamilyMember({ ...formData, isOnline: false });
    }
    setFormData({ name: '', relation: '', phone: '' });
    setShowForm(false);
  };

  const handleEdit = (member: FamilyMember) => {
    setFormData({ name: member.name, relation: member.relation, phone: member.phone || '' });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this family member?')) {
      removeFamilyMember(id);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Family</h1>
        <p>People who care about you</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Location Sharing</h3>
          <label className="switch">
            <input
              type="checkbox"
              checked={locationSharing}
              onChange={(e) => setLocationSharing(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          {locationSharing ? 'Your family can see your location' : 'Location sharing is turned off'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Family Members</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', relation: '', phone: '' }); }}>
          <Plus size={18} /> Add
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', background: '#F8FAFC' }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit' : 'Add'} Family Member</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', padding: '4px' }}>
              <X size={20} color="#64748B" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="e.g., My Wife, My Son"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                placeholder="e.g., Wife, Son, Daughter"
                value={formData.relation}
                onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Family Member
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {familyMembers.length > 0 ? (
        <div className="family-grid">
          {familyMembers.map((member) => (
            <div key={member.id} className="family-card-large">
              <div className="family-header">
                <div className={`family-avatar-large ${member.isOnline ? 'online' : ''}`}>
                  {member.name.charAt(0)}
                </div>
                <div className="family-info-large">
                  <h3>{member.name}</h3>
                  <span className={`status ${member.isOnline ? 'online' : ''}`}>
                    {member.isOnline ? '● Online' : '○ Offline'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(member)} style={{ background: 'none', padding: '4px' }}>
                    <Edit2 size={16} color="#64748B" />
                  </button>
                  <button onClick={() => handleDelete(member.id)} style={{ background: 'none', padding: '4px' }}>
                    <Trash2 size={16} color="#EF4444" />
                  </button>
                </div>
              </div>

              <div className="family-location">
                <MapPin size={16} color="#64748B" />
                <span>{member.relation}</span>
              </div>

              <div className="family-actions">
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="action-btn">
                    <Phone size={18} />
                    Call
                  </a>
                )}
                <button className="action-btn">
                  <MessageCircle size={18} />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Users size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No family members yet</h3>
          <p style={{ color: '#64748B' }}>Add your family members to stay connected</p>
        </div>
      )}
    </div>
  );
};

function Users(props: any) {
  return <MapPin {...props} />;
}
