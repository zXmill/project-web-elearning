import React from "react";
import { GoogleIcon } from '../Common/Icons';

// Added className prop to allow for additional styling from parent
const GoogleButton = ({ className = '' }) => { 
  // Reverted to original OAuth URL
  const googleAuthUrl = 'https://e-learning-unesa.netlify.app/.netlify/functions/auth/google/callback';

  return (
    <a
      href={googleAuthUrl} 
      className={`box-border flex gap-3 justify-center items-center p-3 md:p-4 w-full rounded-md border border-teraplus-text-default bg-teraplus-primary no-underline hover:bg-teraplus-primary-hover focus:outline-none focus:ring-2 focus:ring-teraplus-accent focus:ring-opacity-50 transition-colors ${className}`} // White bg, black border, light gray hover, teal focus
    >
      <GoogleIcon className="w-5 h-5 md:w-6 md:h-6" />
      <span className="text-sm md:text-base font-medium text-teraplus-text-default"> {/* Black text on white bg */}
        Masuk dengan Google
      </span>
    </a>
  );
};

export default GoogleButton;
