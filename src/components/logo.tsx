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
    <path
      d="M4 28V20C4 17.7909 5.79086 16 8 16H16V24C16 26.2091 14.2091 28 12 28H4Z"
      fill="hsl(var(--primary))"
    />
    <path
      d="M16 16V8C16 5.79086 17.7909 4 20 4H28V12C28 14.2091 26.2091 16 24 16H16Z"
      fill="hsl(var(--accent))"
    />
  </svg>
);

export default Logo;
