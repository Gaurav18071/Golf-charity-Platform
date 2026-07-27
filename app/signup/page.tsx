"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const {  error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Check your email.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Create Account
      </h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 mb-4 w-64"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 mb-4 w-64"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-green-700 text-white px-6 py-2 rounded"
      >
        Sign Up
      </button>

    </div>
  );
}