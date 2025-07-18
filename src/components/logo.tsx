import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      rx="4"
      stroke="hsl(var(--primary))"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="16"
      cy="16"
      r="6"
      stroke="hsl(var(--primary))"
      strokeWidth={2.5}
    />
    <path
      d="M16 16L20.2426 11.7574"
      stroke="hsl(var(--accent))"
      strokeWidth={2.5}
      strokeLinecap="round"
    />
    <circle cx="23" cy="9" r="2" fill="hsl(var(--accent))" />
  </svg>
);

export default Logo;
