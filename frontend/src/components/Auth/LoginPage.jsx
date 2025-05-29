import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginHeader from '../Auth/LoginHeader';
import LoginForm from '../Auth/LoginForm';

export default function LoginPage() {
  const isAuthenticated = !!localStorage.getItem('token');
  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return (
    <main className="w-full min-h-screen bg-neutral-100">
      <LoginHeader />
      <section className="flex gap-24 items-center pt-16 mx-auto my-0 w-full h-[898px] max-w-[1323px] max-md:px-5 max-md:py-10 max-md:max-w-[800px] max-sm:p-5">
        <LoginForm />
      </section>
    </main>
  );
}