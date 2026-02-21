import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, Edit2, Trash2, Pill, Clock, Calendar, Coffee } from 'lucide-react';
import { useData, type Reminder } from '../../context/AppContext';
import './PatientFamily.css';

const reminderTypes = [
  { id: 'medication', label: 'Medication', icon: Pill },
  { id: 'meal', label: 'Meal', icon: Coffee },
  { id: 'appointment', label: 'Appointment', icon: Calendar },
  { id: 'custom', label: 'Custom', icon: Clock },
];

type ReminderFormData = Omit<Reminder, 'id'>;

export const PatientReminders: React.FC = () => {
  const { reminders, addReminder, updateReminder, removeReminder } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReminderFormData>({
    type: 'medication',
    title: '',
    time: '08:00',
    notes: '',
    enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateReminder(editingId, formData);
      setEditingId(null);
    } else {
      addReminder(formData);
    }
    setFormData({ type: 'medication', title: '', time: '08:00', notes: '', enabled: true });
    setShowForm(false);
  };

  const handleEdit = (reminder: Reminder) => {
    setFormData({
      type: reminder.type,
      title: reminder.title,
      time: reminder.time,
      notes: reminder.notes || '',
      enabled: reminder.enabled,
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this reminder?')) {
      removeReminder(id);
    }
  };

  const toggleReminder = (id: string, enabled: boolean) => {
    updateReminder(id, { enabled });
  };

  const sortedReminders = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/patient" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', marginBottom: '12px' }}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <h1>My Reminders</h1>
        <p>Manage your daily reminders</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{reminders.length} Reminder{reminders.length !== 1 ? 's' : ''}</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setFormData({ type: 'medication', title: '', time: '08:00', notes: '', enabled: true }); }}>
          <Plus size={18} /> Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', background: '#F8FAFC' }}>
          <div className="card-header">
            <h3 className="card-title">{editingId ? 'Edit' : 'Add'} Reminder</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', padding: '4px' }}>
              <X size={20} color="#64748B" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Type</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {reminderTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.id as any })}
                    className={`type-btn ${formData.type === type.id ? 'active' : ''}`}
                  >
                    <type.icon size={18} />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder={formData.type === 'medication' ? 'e.g., Morning medication' : formData.type === 'meal' ? 'e.g., Breakfast' : 'e.g., Doctor appointment'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Reminder
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {sortedReminders.length > 0 ? (
        <div className="reminders-list">
          {sortedReminders.map(reminder => (
            <div key={reminder.id} className={`reminder-card ${!reminder.enabled ? 'disabled' : ''}`}>
              <div className="reminder-icon">
                {reminder.type === 'medication' && <Pill size={24} />}
                {reminder.type === 'meal' && <Coffee size={24} />}
                {reminder.type === 'appointment' && <Calendar size={24} />}
                {reminder.type === 'custom' && <Clock size={24} />}
              </div>
              <div className="reminder-content">
                <h4>{reminder.title}</h4>
                <p>{reminder.time} • {reminder.type}</p>
                {reminder.notes && <span className="reminder-notes">{reminder.notes}</span>}
              </div>
              <div className="reminder-actions">
                <label className="switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={(e) => toggleReminder(reminder.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
                <button onClick={() => handleEdit(reminder)} style={{ background: 'none', padding: '8px' }}>
                  <Edit2 size={16} color="#64748B" />
                </button>
                <button onClick={() => handleDelete(reminder.id)} style={{ background: 'none', padding: '8px' }}>
                  <Trash2 size={16} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Clock size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: '8px' }}>No reminders yet</h3>
          <p style={{ color: '#64748B', marginBottom: '20px' }}>Add your first reminder to stay on track</p>
        </div>
      )}
    </div>
  );
};
