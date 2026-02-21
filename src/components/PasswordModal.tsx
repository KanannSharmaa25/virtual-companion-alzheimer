import React, { useState } from 'react';
import { Lock, X, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/AppContext';
import '../styles/password-modal.css';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  message?: string;
  error?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = 'Caregiver Verification Required',
  message = 'Please ask your caregiver to enter their password to continue.',
  error: externalError
}) => {
  const { verifyCaregiverPassword } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const displayError = externalError || error;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCaregiverPassword(password)) {
      onSuccess();
      setPassword('');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={handleClose}>
          <X size={20} />
        </button>
        
        <div className="modal-icon">
          <AlertTriangle size={48} />
        </div>
        
        <h2>{title}</h2>
        <p className="modal-message">{message}</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-input-wrapper">
            <Lock size={20} />
            <input
              type="password"
              placeholder="Enter caregiver password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          
          {displayError && <div className="modal-error">{displayError}</div>}
          
          <button type="submit" className="modal-submit">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export const usePasswordModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestPassword = (action: () => void) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };

  const handleSuccess = () => {
    if (pendingAction) {
      pendingAction();
    }
    setIsOpen(false);
    setPendingAction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    requestPassword,
    PasswordModalComponent: () => (
      <PasswordModal
        isOpen={isOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    )
  };
};
