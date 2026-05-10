import React from 'react';
import { StyleId } from '../hooks/useWallpaperGenerator';
import './StyleToggle.css';

const STYLES: { id: StyleId; label: string }[] = [
  { id: 'gradient',    label: 'Gradient'     },
  { id: 'colorblocks', label: 'Color Blocks' },
];

interface Props {
  value: StyleId;
  onChange: (id: StyleId) => void;
}

const StyleToggle: React.FC<Props> = ({ value, onChange }) => (
  <nav className="style-toggle">
    {STYLES.map(({ id, label }) => (
      <button
        key={id}
        className={`style-toggle__tab${value === id ? ' style-toggle__tab--active' : ''}`}
        onClick={() => onChange(id)}
      >
        {label}
      </button>
    ))}
  </nav>
);

export default StyleToggle;
