"use client";
import React, { useState } from "react";
import { Link } from 'react-router-dom'; // Import Link
import { EyeIcon } from '../Common/Icons';
import GoogleButton from './GoogleButton';

const LoginForm = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(''); // Added for inline error display

  const handleSubmit = async (e) => { // Changed to async
    e.preventDefault();
    setFormError(''); // Clear previous error
    try {
      // onSubmit is expected to be an async function that handles the API call
      // and will throw an error if the API call fails.
      await onSubmit({ email, password }); 
    } catch (err) {
      // err is the error thrown by api.post in handleLocalLogin (from LoginPage)
      setFormError(err.response?.data?.message || err.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      noValidate // Added noValidate attribute
      className="flex flex-col gap-6 items-start p-8 w-full bg-teraplus-card-bg rounded-xl shadow-3xl max-w-md"
    >
      <div className="flex flex-col gap-2 justify-center items-start w-full">
        <h1 className="w-full text-2xl md:text-3xl font-bold text-left text-teraplus-text-default"> {/* Changed to text-default (black) */}
          Masuk Akun
        </h1>
        <p className="w-full text-sm md:text-base text-left text-teraplus-text-default opacity-70">
          Masuk ke akun TERAPLUS Anda untuk melanjutkan.
        </p>
      </div>

      {/* Google Button - More prominent */}
      <GoogleButton className="w-full py-3 text-sm md:text-base" /> 

      {/* OR Divider */}
      <div className="flex gap-3 justify-center items-center w-full">
        <div className="h-px bg-gray-300 flex-grow" /> {/* Changed to gray */}
        <span className="text-xs md:text-sm leading-7 text-center text-teraplus-text-default opacity-60"> {/* Changed to text-default */}
          Atau Masuk dengan Email
        </span>
        <div className="h-px bg-gray-300 flex-grow" /> {/* Changed to gray */}
      </div>

      <div className="flex flex-col gap-4 items-start w-full">
        {/* Email Input */}
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label htmlFor="email" className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"> {/* Changed to text-default */}
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tuliskan alamat email Anda"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue sm:text-sm text-teraplus-text-default" // Focus with brand-blue
            required
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label htmlFor="password" className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default">
            Password
          </label>
          <div className="mt-1 flex w-full rounded-md shadow-sm border border-gray-300 focus-within:border-teraplus-brand-blue focus-within:ring-1 focus-within:ring-teraplus-brand-blue"> {/* Focus with brand-blue */}
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tuliskan password Anda"
              className="flex-1 px-3 py-2 block w-full rounded-none rounded-l-md sm:text-sm border-0 focus:ring-0 text-teraplus-text-default placeholder-gray-400" // Standard input style
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center px-3 rounded-r-md border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100" // Standard button style
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        
        
        <div className="w-full text-right text-xs md:text-sm mt-1">
            <Link to="/request-password-reset" className="text-teraplus-text-default hover:underline opacity-80">Lupa Password?</Link> {/* Changed to text-default (black) and hover underline */}
        </div>

        {/* Error Message Display */}
        {formError && (
          <p className="text-red-500 text-sm mt-2 text-center w-full">{formError}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-teraplus-accent rounded-md shadow-sm text-sm font-medium text-teraplus-accent bg-transparent hover:bg-teraplus-accent hover:text-teraplus-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-accent mt-2 transition-colors duration-150" // Styled like Logout button
        >
          Login
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="flex gap-1 justify-center items-center w-full mt-3">
        <p className="text-xs md:text-sm leading-7 text-center text-teraplus-text-default opacity-80">
          Belum punya akun? <Link to="/register" className="font-semibold text-teraplus-text-default hover:underline">Daftar</Link> {/* Changed to text-default (black) and hover underline */}
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
