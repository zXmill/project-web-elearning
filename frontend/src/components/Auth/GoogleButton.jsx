import React from "react";
import { GoogleIcon } from '../Common/Icons';

const GoogleButton = () => {
  return (    <a
      href="http://localhost:3001/api/auth/google"
      className="box-border flex gap-3.5 justify-center items-center px-6 py-5 w-full rounded-xl border border-gray-100 border-solid bg-neutral-100 no-underline hover:bg-neutral-200"
    >
      <GoogleIcon />
      <span className="text-lg leading-7 text-neutral-800 max-sm:text-base">
        Login with Google
      </span>
    </a>
  );
};

export default GoogleButton;
