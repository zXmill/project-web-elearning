import React from "react";

const LoginHeader = () => {
  return (
    <header className="flex flex-col items-center px-8 pt-5 pb-0 mx-auto my-0 w-full max-w-[1860px]">
      <nav className="box-border flex justify-center items-center px-32 pt-5 pb-6 w-full border-b border-solid border-b-gray-100 max-md:px-12 max-md:pt-5 max-md:pb-6 max-sm:flex-col max-sm:gap-5 max-sm:p-5">
        <div className="flex gap-8 items-center max-md:gap-5 max-sm:gap-4">
          <button className="text-lg leading-7 text-neutral-800">Sign Up</button>
          <button className="gap-2 px-9 py-3.5 text-lg leading-7 text-white bg-amber-500 rounded-lg">
            Login
          </button>
        </div>
      </nav>
    </header>
  );
};

export default LoginHeader;
