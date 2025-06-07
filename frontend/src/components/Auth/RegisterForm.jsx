import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GoogleButton from './GoogleButton';
import { EyeIcon } from '../Common/Icons';

const RegisterForm = ({ onSubmit, formData, handleChange, error, success }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form
      onSubmit={onSubmit}
      noValidate // Added noValidate attribute
      className="flex flex-col gap-6 items-start p-8 w-full bg-teraplus-card-bg rounded-xl shadow-3xl max-w-md"
    >
      <div className="flex flex-col gap-2 justify-center items-start w-full">
        <h1 className="w-full text-2xl md:text-3xl font-bold text-left text-teraplus-text-default">
          Buat Akun Baru
        </h1>
        <p className="w-full text-sm md:text-base text-left text-teraplus-text-default opacity-70">
          Isi detail di bawah untuk mendaftar ke TERAPLUS.
        </p>
      </div>

      {error && <p className="text-red-500 text-sm text-center w-full -mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm text-center w-full -mt-2">{success}</p>}

      {/* Google Button - More prominent */}
      <GoogleButton className="w-full py-3 text-sm md:text-base" />

      {/* OR Divider */}
      <div className="flex gap-3 justify-center items-center w-full">
        <div className="h-px bg-gray-300 flex-grow" />
        <span className="text-xs md:text-sm leading-7 text-center text-teraplus-text-default opacity-60">
          Atau Daftar dengan Email
        </span>
        <div className="h-px bg-gray-300 flex-grow" />
      </div>

      <div className="flex flex-col gap-4 items-start w-full">
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="namaLengkap"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            Nama Lengkap
          </label>
          <input
            id="namaLengkap"
            name="namaLengkap"
            type="text"
            required
            value={formData.namaLengkap}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap Anda"
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue sm:text-sm text-teraplus-text-default border border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="email"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="alamat.email@contoh.com"
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue sm:text-sm text-teraplus-text-default border border-gray-300"
          />
        </div>
        {/* Added Affiliasi Field */}
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="affiliasi"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            Affiliasi (Nama Instansi/Perusahaan/Pribadi)
          </label>
          <input
            id="affiliasi"
            name="affiliasi"
            type="text"
            required
            value={formData.affiliasi}
            onChange={handleChange}
            placeholder="Masukkan affiliasi Anda"
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue sm:text-sm text-teraplus-text-default border border-gray-300"
          />
        </div>
        {/* Added No HP Field */}
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="noHp"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            No. HP (WhatsApp Aktif)
          </label>
          <input
            id="noHp"
            name="noHp"
            type="tel"
            required
            value={formData.noHp}
            onChange={handleChange}
            placeholder="Contoh: 081234567890"
            className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teraplus-brand-blue focus:border-teraplus-brand-blue sm:text-sm text-teraplus-text-default border border-gray-300"
          />
        </div>
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="password"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            Password
          </label>
          <div className="mt-1 flex w-full rounded-md shadow-sm border border-gray-300 focus-within:border-teraplus-brand-blue focus-within:ring-1 focus-within:ring-teraplus-brand-blue">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="flex-1 block w-full rounded-none rounded-l-md border-0 px-3 py-2 placeholder-gray-400 focus:ring-0 sm:text-sm text-teraplus-text-default"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center px-3 rounded-r-md border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-start w-full">
          <label
            htmlFor="confirmPassword"
            className="w-full text-sm md:text-base font-medium leading-7 text-teraplus-text-default"
          >
            Konfirmasi Password
          </label>
          <div className="mt-1 flex w-full rounded-md shadow-sm border border-gray-300 focus-within:border-teraplus-brand-blue focus-within:ring-1 focus-within:ring-teraplus-brand-blue">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password Anda"
              className="flex-1 block w-full rounded-none rounded-l-md border-0 px-3 py-2 placeholder-gray-400 focus:ring-0 sm:text-sm text-teraplus-text-default"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="inline-flex items-center px-3 rounded-r-md border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div className="w-full text-right text-xs md:text-sm mt-1">
          <a href="/reset-password" className="text-teraplus-text-default hover:underline opacity-80">
            Lupa Password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-teraplus-accent rounded-md shadow-sm text-sm font-medium text-teraplus-accent bg-transparent hover:bg-teraplus-accent hover:text-teraplus-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teraplus-accent mt-2 transition-colors duration-150"
        >
          Daftar
        </button>
      </div>

      <div className="flex gap-1 justify-center items-center w-full mt-3">
        <p className="text-xs md:text-sm leading-7 text-center text-teraplus-text-default opacity-80">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-teraplus-text-default hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
