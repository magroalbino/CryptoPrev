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
      d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
      fill="hsl(var(--primary))"
    />
    <path
      d="M16 16V28C22.6274 28 28 22.6274 28 16H16Z"
      fill="hsl(var(--background))"
    />
    <path
      d="M16 16H4C4 9.37258 9.37258 4 16 4V16Z"
      fill="hsl(var(--accent))"
    />
  </svg>
);

export default Logo;
