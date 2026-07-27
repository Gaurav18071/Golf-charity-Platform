"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const {  error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful!");
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">

      <h1 className="text-3xl font-bold mb-6">
        Login
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
        onClick={handleLogin}
        className="bg-green-700 text-white px-6 py-2 rounded"
      >
        Login
      </button>

    </div>
  );
}