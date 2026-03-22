import React, { useState } from 'react';
import { Bold, Italic, Type, List, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import './RichTextEditor.css';

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="rte-container">
      <div className="rte-toolbar">
        <button className="rte-tool" title="Bold"><Bold size={16} /></button>
        <button className="rte-tool" title="Italic"><Italic size={16} /></button>
        <div className="rte-divider"></div>
        <button className="rte-tool" title="Heading"><Type size={16} /></button>
        <button className="rte-tool" title="Bullet List"><List size={16} /></button>
        <div className="rte-divider"></div>
        <button className="rte-tool" title="Link"><LinkIcon size={16} /></button>
        <button className="rte-tool" title="Image"><ImageIcon size={16} /></button>
      </div>
      <textarea 
        className="rte-content" 
        placeholder="Tell your story..."
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};
