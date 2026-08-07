"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("admin-credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <main
      style={{ background: "#1A1A2E" }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Kens.lk</h1>
          <p className="mt-1 text-sm" style={{ color: "#8B8FA8" }}>
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{ background: "#16213E", border: "1px solid #0F3460" }}
        >
          <h2 className="text-xl font-semibold text-white mb-6">Sign in</h2>

          {error && (
            <div
              className="mb-4 rounded-lg px-4 py-3 text-sm"
              style={{ background: "#3B0000", color: "#FF6B6B", border: "1px solid #7B0000" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#B0B4C8" }}
              >
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#534AB7] transition"
                style={{
                  background: "#0D1B2A",
                  border: "1px solid #1E3A5F",
                }}
                placeholder="admin@kens.lk"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#B0B4C8" }}
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#534AB7] transition"
                style={{
                  background: "#0D1B2A",
                  border: "1px solid #1E3A5F",
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "#534AB7" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
