import React from 'react';
export default function LoginPage(){
  return(
    <div className="flex h-screen justify-center items-center bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <a href="http://localhost:3000/api/auth/google" className="flex items-center px-4 py-2 border rounded-xl hover:bg-gray-100">
          <img src="/google-logo.png" alt="Google" className="w-6 h-6 mr-2" />Login with Google
        </a>
      </div>
    </div>
  );
}