import { useState, type FormEvent } from "react";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";
type Errors = Partial<Record<"name" | "email" | "password", string>>;

function validate(
  mode: Mode,
  name: string,
  email: string,
  password: string
): Errors {
  const errors: Errors = {};
  if (mode === "register" && name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (mode === "register" ? password.length < 8 : password.length === 0) {
    errors.password =
      mode === "register"
        ? "Password must be at least 8 characters"
        : "Password is required";
  }
  return errors;
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { login, register } = useAuth();

  const isPending = login.isPending || register.isPending;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(mode, name, email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (mode === "login") login.mutate({ email, password });
    else register.mutate({ name: name.trim(), email, password });
  }

  function switchMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between px-6 py-4">
        <Wordmark />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {mode === "login" ? "Welcome back" : "Create your notebook"}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === "login"
              ? "Log in to continue your conversations."
              : "Upload documents and chat with them."}
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-6 flex flex-col gap-4"
          >
            {mode === "register" && (
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                autoComplete="name"
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            <Button type="submit" loading={isPending} className="mt-1">
              {mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-muted">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={switchMode}
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
