import React from 'react';
import { editorTheme } from './theme.js';

export const inputBaseStyle: React.CSSProperties = {
  background: editorTheme.color.surfaceRaised,
  color: editorTheme.color.text,
  border: editorTheme.border.default,
  borderRadius: editorTheme.radius.md,
  padding: '4px 7px',
  fontFamily: editorTheme.typography.fontFamily,
  fontSize: editorTheme.typography.controlSize,
  outline: 'none',
  boxSizing: 'border-box',
};

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;
export type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput: React.FC<TextInputProps> = ({ style, type, ...props }) => (
  <input type={type ?? 'text'} {...props} style={{ ...inputBaseStyle, ...style }} />
);

export const NumberInput: React.FC<NumberInputProps> = ({ style, type, ...props }) => (
  <input type={type ?? 'number'} {...props} style={{ ...inputBaseStyle, ...style }} />
);
