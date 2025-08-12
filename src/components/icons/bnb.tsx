import * as React from 'react';

const BnbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#F0B90B" />
    <path d="M6 12L8.25 9.75L12 6L15.75 9.75L18 12L15.75 14.25L12 18L8.25 14.25L6 12Z" fill="white" />
    <path d="M12 13.5L13.5 12L12 10.5V13.5Z" fill="white" />
    <path d="M10.5 12L12 10.5L13.5 12L12 13.5L10.5 12Z" fill="white" />
    <path d="M12 15.75L14.25 13.5L15.75 12L14.25 10.5L12 8.25V15.75Z" fill="white" />
  </svg>
);

export default BnbIcon;
