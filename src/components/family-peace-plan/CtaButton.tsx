'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, MouseEvent } from 'react';

interface CommonProps {
  children: ReactNode;
  /** Runs BEFORE the click passes through — for firing analytics ahead of navigation. */
  onFire?: () => void;
  size?: 'md' | 'lg';
}

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
    href: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  };

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
    href?: undefined;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  };

type Props = LinkProps | ButtonProps;

/**
 * Gold CTA used across the funnel. Renders as <a> if `href` is set (so
 * right-click / new-tab work naturally), otherwise as <button>. `onFire` runs
 * BEFORE the click callback so analytics emit even when a click navigates.
 */
export function CtaButton(props: Props) {
  const className = props.size === 'lg' ? 'fpp-cta-lg' : 'fpp-cta';

  if (props.href !== undefined) {
    const { children, onFire, size: _size, href, onClick, ...anchorRest } = props;
    return (
      <a
        {...anchorRest}
        href={href}
        className={className}
        onClick={(e) => {
          onFire?.();
          onClick?.(e);
        }}
      >
        {children}
      </a>
    );
  }

  const { children, onFire, size: _size, onClick, ...buttonRest } = props;
  return (
    <button
      {...buttonRest}
      className={className}
      onClick={(e) => {
        onFire?.();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
