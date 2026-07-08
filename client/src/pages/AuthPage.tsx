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
  if (mode === "register" && name.trim().length < 2)
    errors.name = "Name must be at least 2 characters";
  if (!/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Enter a valid email address";
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
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-8">
        <Wordmark />
        <ThemeToggle />
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="type-display text-[clamp(2rem,4.5vw,3rem)] leading-tight text-ink">
            Chat with your <span className="text-accent">documents</span>.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Upload a PDF, a web page, or plain text. VectorMind reads it and
            answers your questions — using only what's actually in your
            document.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
          <h2 className="type-display text-xl text-ink">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {mode === "login" ? "Log in to continue." : "Free to get started."}
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
              className="font-medium text-accent hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
