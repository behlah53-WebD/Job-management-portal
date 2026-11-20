'use client';

import React from 'react';
import styles from './Card.module.css';

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'normal', // 'none' | 'small' | 'normal' | 'large'
  as: Component = 'div',
  ...props
}) {
  return (
    <Component
      className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${
        styles[`padding-${padding}`]
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
