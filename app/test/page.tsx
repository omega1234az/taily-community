'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      alert("Login failed: " + res.error);
    } else {
      alert("Login success!");
      // redirect หรือทำอย่างอื่น
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Login with Credentials
        </button>
      </form>

      <div className="mt-6">
        <button
          className="w-full bg-red-600 text-white py-2 rounded mb-2"
          onClick={() => signIn("google")}
        >
          Login with Google
        </button>
        <button
          className="w-full bg-blue-800 text-white py-2 rounded"
          onClick={() => signIn("facebook")}
        >
          Login with Facebook
        </button>
      </div>
    </div>
  );
}
