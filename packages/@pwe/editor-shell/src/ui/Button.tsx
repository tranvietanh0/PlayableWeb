import React, { useState } from 'react';
import { editorTheme } from './theme.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  compact?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  compact = false,
  style,
  disabled,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);
  const palette = getButtonPalette(variant, hovered, disabled);

  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={(event) => {
        setHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHovered(false);
        onMouseLeave?.(event);
      }}
      style={{
        padding: compact ? '3px 8px' : '5px 11px',
        borderRadius: editorTheme.radius.md,
        border: variant === 'primary' ? '1px solid transparent' : editorTheme.border.default,
        background: palette.background,
        color: palette.color,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: editorTheme.typography.fontFamily,
        fontSize: editorTheme.typography.controlSize,
        lineHeight: 1.25,
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    />
  );
};

function getButtonPalette(
  variant: NonNullable<ButtonProps['variant']>,
  hovered: boolean,
  disabled?: boolean
) {
  if (variant === 'primary') {
    return {
      background: hovered && !disabled ? editorTheme.color.accentHover : editorTheme.color.accent,
      color: editorTheme.color.accentText,
    };
  }

  if (variant === 'ghost') {
    return {
      background: hovered && !disabled ? editorTheme.color.surfaceHover : 'transparent',
      color: editorTheme.color.textMuted,
    };
  }

  return {
    background: hovered && !disabled ? editorTheme.color.surfaceHover : editorTheme.color.surfaceRaised,
    color: editorTheme.color.text,
  };
}
