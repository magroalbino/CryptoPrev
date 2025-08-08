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
      d="M16.1263 7.99988C15.2464 7.99988 14.5263 8.71998 14.5263 9.59988V15.9999C14.5263 16.8798 15.2464 17.5999 16.1263 17.5999H22.5263C23.4062 17.5999 24.1263 16.8798 24.1263 15.9999C24.1263 11.5816 20.5447 7.99988 16.1263 7.99988Z"
      fill="hsl(var(--background))"
    />
    <path
      d="M16,17.6a6.4,6.4 0 0 1-6.4,6.4H8v-6.4a8,8 0 0 1 8-8V17.6Z"
      fill="hsl(var(--accent))"
    />
  </svg>
);

export default Logo;
