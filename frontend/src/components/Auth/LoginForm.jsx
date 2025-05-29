"use client";
import React, { useState } from "react";
import { EyeIcon, SignUpArrow } from '../Common/Icons';
import GoogleButton from './GoogleButton';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="flex flex-col gap-12 items-start p-12 w-full bg-white rounded-xl max-md:p-10 max-sm:gap-8 max-sm:p-8">
      <div className="flex flex-col gap-3 justify-center items-start w-full">
        <h1 className="w-full text-5xl font-bold text-center text-neutral-800 max-md:text-4xl max-sm:text-3xl">
          Login
        </h1>
        <p className="w-full text-lg text-center text-neutral-600 max-sm:text-base">
          Please log in to access your account.
        </p>
      </div>

      <div className="flex flex-col gap-8 items-start w-full">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="flex flex-col gap-3.5 items-start w-full">
            <label htmlFor="email" className="w-full text-lg leading-7 text-neutral-800 max-sm:text-base">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your Email"
              className="box-border flex-1 gap-2.5 p-6 w-full text-lg leading-7 bg-gray-50 rounded-xl border border-gray-100 border-solid text-stone-500 max-sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-3.5 items-start w-full">
            <label htmlFor="password" className="w-full text-lg leading-7 text-neutral-800 max-sm:text-base">
              Password
            </label>
            <div className="box-border flex gap-2.5 items-center p-6 w-full bg-gray-50 rounded-xl border border-gray-100 border-solid">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your Password"
                className="flex-1 text-lg leading-7 text-stone-500 max-sm:text-base bg-transparent border-none outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="box-border flex-1 gap-2.5 px-5 py-5 w-full text-lg leading-7 text-center text-white bg-amber-500 rounded-xl max-sm:text-base"
          >
            Login
          </button>
        </div>

        <div className="flex gap-3 justify-center items-center w-full">
          <div className="h-px bg-zinc-200 w-[586.5px] max-md:w-[300px] max-sm:w-[150px]" />
          <span className="text-lg leading-7 text-center text-neutral-400 max-sm:text-base">
            OR
          </span>
          <div className="h-px bg-zinc-200 w-[586.5px] max-md:w-[300px] max-sm:w-[150px]" />
        </div>

        <GoogleButton />

        <div className="flex gap-1.5 justify-center items-center w-full">
          <p className="text-lg leading-7 text-center text-neutral-800 max-sm:text-base">
            Don't have an account? Sign Up
          </p>
          <SignUpArrow />
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
