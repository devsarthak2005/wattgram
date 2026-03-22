import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, meta, authorDetails }) => (
  <div className="card-header">
    <div className="card-author-meta">
      {authorDetails && <div className="card-author">{authorDetails}</div>}
      {meta && <span className="card-date">{meta}</span>}
    </div>
    <h3 className="card-title">{title}</h3>
  </div>
);

export const CardContent = ({ children }) => (
  <div className="card-content">
    {children}
  </div>
);
