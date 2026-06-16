"use client";

import { useState } from "react";
import { Shield, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useSupabase } from "@/providers/SupabaseProvider";

type AuthMode = "signin" | "signup";

export function AuthScreen() {
  const { signIn, signUp } = useSupabase();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        const result = await signUp(email.trim(), password);
        if (result.needsEmailConfirmation) {
          setMessage("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setMessage(null);
  };

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-cosmic-bg p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-cosmic-violet/20">
          <Shield className="size-8 text-cosmic-violet-light" />
        </div>
        <h1 className="text-2xl font-semibold text-cosmic-text">Crypt Dialer</h1>
        <p className="text-sm text-cosmic-muted">Sign in to access your secure dialer</p>
      </div>

      <Card className="w-full max-w-sm">
        <h2 className="text-lg font-semibold text-cosmic-text mb-1">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h2>
        <p className="text-sm text-cosmic-muted mb-4">
          {mode === "signin" ? "Use your email and password" : "Register with email and password"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail className="absolute left-3 top-[34px] size-4 text-cosmic-muted" />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-[34px] size-4 text-cosmic-muted" />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="pl-10"
              minLength={6}
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-cosmic-red/30 bg-cosmic-red/10 px-3 py-2 text-sm text-cosmic-red">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-cosmic-green/30 bg-cosmic-green/10 px-3 py-2 text-sm text-cosmic-green">
              {message}
            </div>
          ) : null}

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-4 w-full text-center text-sm text-cosmic-violet-light hover:underline transition-colors duration-200"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </Card>
    </div>
  );
}
