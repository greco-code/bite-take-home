import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Button.module.scss';

type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    size?: 'default' | 'compact';
    variant?: 'primary' | 'secondary' | 'danger';
  }
>;

export function Button({
  children,
  className,
  size = 'default',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(styles.button, styles[variant], styles[size], className)}
      type={type}
    >
      {children}
    </button>
  );
}
