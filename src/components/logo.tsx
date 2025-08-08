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
      d="M16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28V22C12.6863 22 10 19.3137 10 16C10 12.6863 12.6863 10 16 10V4Z"
      fill="hsl(var(--primary))"
    />
    <path
      d="M16 4V10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22V28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4Z"
      fill="hsl(var(--accent))"
    />
  </svg>
);

export default Logo;
