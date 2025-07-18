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
      d="M19 13.0154C19 13.0154 20 12.0154 20 10.0154C20 8.01538 18.5 7.01538 17.5 7.01538C16.5 7.01538 15.5 8.51538 15.5 8.51538"
      stroke="hsl(var(--accent))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 24.0154C12 24.0154 8 23.0154 8 19.0154C8 15.0154 12 14.0154 12 14.0154C12 14.0154 13.9348 14.0154 16 14.0154C18.0652 14.0154 20 14.0154 20 14.0154C20 14.0154 24 15.0154 24 19.0154C24 23.0154 20 24.0154 20 24.0154"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14.0154C12 12.0154 13.5 11.0154 14.5 11.0154H17.5C18.5 11.0154 20 12.0154 20 14.0154"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
