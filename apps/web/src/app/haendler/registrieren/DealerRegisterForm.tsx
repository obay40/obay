"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES,
  DEALER_VERIFICATION_DOCUMENT_MAX_SIZE_BYTES,
} from "@autoklick24/validation";

const inputClass =
  "border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm";
const labelClass = "text-navy-700 block text-sm font-medium";

export function DealerRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const document = formData.get("verificationDocument");
    if (!(document instanceof File) || document.size === 0) {
      setError("Bitte einen Gewerbenachweis hochladen.");
      return;
    }
    if (document.size > DEALER_VERIFICATION_DOCUMENT_MAX_SIZE_BYTES) {
      setError("Die Datei ist zu groß (maximal 10 MB).");
      return;
    }
    if (
      !DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES.includes(
        document.type as (typeof DEALER_VERIFICATION_DOCUMENT_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      setError("Ungültiges Dateiformat. Erlaubt sind PDF, JPG und PNG.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/dealers/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Registrierung fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }

      router.push("/haendler/registrierung-erfolg");
    } catch {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <fieldset className="space-y-4">
        <legend className="text-navy-900 text-sm font-semibold">Unternehmen</legend>
        <div>
          <label htmlFor="companyName" className={labelClass}>
            Firmenname / Autohaus
          </label>
          <input id="companyName" name="companyName" required className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="contactFirstName" className={labelClass}>
              Ansprechpartner Vorname
            </label>
            <input id="contactFirstName" name="contactFirstName" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="contactLastName" className={labelClass}>
              Ansprechpartner Nachname
            </label>
            <input id="contactLastName" name="contactLastName" required className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="contactEmail" className={labelClass}>
            Geschäftliche E-Mail-Adresse
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className={labelClass}>
            Telefonnummer
          </label>
          <input id="contactPhone" name="contactPhone" required className={inputClass} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-900 text-sm font-semibold">Adresse</legend>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label htmlFor="street" className={labelClass}>
              Straße
            </label>
            <input id="street" name="street" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="houseNumber" className={labelClass}>
              Hausnummer
            </label>
            <input id="houseNumber" name="houseNumber" required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="postalCode" className={labelClass}>
              PLZ
            </label>
            <input
              id="postalCode"
              name="postalCode"
              required
              pattern="\d{5}"
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="city" className={labelClass}>
              Ort
            </label>
            <input id="city" name="city" required className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>
            Land
          </label>
          <select id="country" name="country" defaultValue="DE" className={inputClass}>
            <option value="DE">Deutschland</option>
            <option value="AT">Österreich</option>
            <option value="CH">Schweiz</option>
          </select>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-900 text-sm font-semibold">Optionale Angaben</legend>
        <div>
          <label htmlFor="website" className={labelClass}>
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://…"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="vatId" className={labelClass}>
              USt-IdNr.
            </label>
            <input id="vatId" name="vatId" className={inputClass} />
          </div>
          <div>
            <label htmlFor="commercialRegisterNumber" className={labelClass}>
              Handelsregisternummer
            </label>
            <input id="commercialRegisterNumber" name="commercialRegisterNumber" className={inputClass} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-navy-900 text-sm font-semibold">Gewerbenachweis</legend>
        <p className="text-navy-600 text-sm">
          Bitte laden Sie einen Nachweis Ihrer gewerblichen Tätigkeit hoch, z. B. einen
          Gewerbeschein.
        </p>
        <div>
          <label htmlFor="verificationDocument" className={labelClass}>
            Gewerbeschein / Gewerbenachweis hochladen
          </label>
          <input
            id="verificationDocument"
            name="verificationDocument"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="border-navy-200 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
          />
          <p className="text-navy-500 mt-1 text-xs">
            Erlaubt: PDF, JPG, PNG. Maximal 10 MB.
          </p>
        </div>
        <p className="text-navy-500 text-xs">
          Der Nachweis wird ausschließlich zur Überprüfung Ihres Händlerkontos verwendet.
        </p>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-navy-900 text-sm font-semibold">Zugangsdaten</legend>
        <div>
          <label htmlFor="password" className={labelClass}>
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={10}
            className={inputClass}
          />
          <p className="text-navy-500 mt-1 text-xs">
            Mindestens 10 Zeichen, ein Groß-, ein Kleinbuchstabe und eine Ziffer.
          </p>
        </div>
      </fieldset>

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
        {isSubmitting ? "Wird gesendet…" : "Registrierung absenden"}
      </button>
    </form>
  );
}
