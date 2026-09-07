"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          acceptedTerms: formData.get("acceptedTerms") === "on",
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Registrierung fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }

      router.push("/anmelden");
    } catch {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="text-navy-700 block text-sm font-medium">
            Vorname
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            className="border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="text-navy-700 block text-sm font-medium">
            Nachname
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            className="border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="text-navy-700 block text-sm font-medium">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-navy-700 block text-sm font-medium">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          className="border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
        />
        <p className="text-navy-500 mt-1 text-xs">
          Mindestens 10 Zeichen, ein Groß-, ein Kleinbuchstabe und eine Ziffer.
        </p>
      </div>

      <label className="text-navy-600 flex items-start gap-2 text-sm">
        <input type="checkbox" name="acceptedTerms" required className="mt-0.5" />
        <span>
          Ich akzeptiere die{" "}
          <Link href="/agb" className="text-brand-600 hover:text-brand-700 font-medium">
            AGB
          </Link>{" "}
          und die{" "}
          <Link href="/datenschutz" className="text-brand-600 hover:text-brand-700 font-medium">
            Datenschutzerklärung
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-brand-500 hover:bg-brand-600 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSubmitting ? "Wird erstellt..." : "Konto erstellen"}
      </button>
    </form>
  );
}
