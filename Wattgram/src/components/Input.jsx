import React from 'react';
import './Input.css';

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <textarea className="input-field textarea-field" {...props}></textarea>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};
