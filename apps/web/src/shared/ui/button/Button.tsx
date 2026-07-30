import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/lib/cn';

import styles from './Button.module.scss';

type ButtonProps = Readonly<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    size?: 'default' | 'compact';
    variant?: 'primary' | 'secondary' | 'danger';
  }
>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      size = 'default',
      type = 'button',
      variant = 'primary',
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        className={cn(styles.button, styles[variant], styles[size], className)}
        ref={ref}
        type={type}
      >
        {children}
      </button>
    );
  },
);
