import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'highlight' | 'alert';
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', variant = 'default' }) => {
  return (
    <div className={`card card-${variant} ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
};
