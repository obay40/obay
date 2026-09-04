import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@autoklick24/auth";
import { Container } from "@/components/ui/Container";

export const metadata = { title: "Händlerlogin" };

/**
 * Eigener Login für Autohäuser/gewerbliche Anbieter (siehe Aufgabenstellung
 * "HÄNDLERLOGIN") - bewusst NICHT dasselbe Formular wie /anmelden, auch
 * wenn beide denselben Credentials-Provider nutzen: Rolle (DEALER) wird
 * beim Anmelden serverseitig geprüft, nicht hier im Formular.
 */
async function dealerLoginAction(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/haendler/konto",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/haendler/login?error=1");
    }
    throw error;
  }
}

export default async function DealerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-navy-900 text-2xl font-bold">Händlerlogin</h1>
        <p className="text-navy-600 mt-1 text-sm">
          Für Autohäuser und gewerbliche Fahrzeuganbieter.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            E-Mail oder Passwort ist falsch.
          </p>
        )}

        <form action={dealerLoginAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-navy-700 block text-sm font-medium">
              E-Mail-Adresse
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
              autoComplete="current-password"
              className="border-navy-200 focus:border-brand-500 mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 w-full rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Als Händler anmelden
          </button>
        </form>

        <p className="text-navy-600 mt-6 text-center text-sm">
          Noch kein Händlerkonto?{" "}
          <Link
            href="/haendler/registrieren"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            Jetzt registrieren
          </Link>
        </p>
        <p className="text-navy-500 mt-2 text-center text-sm">
          <Link href="/passwort-vergessen" className="hover:text-brand-600 font-medium">
            Passwort vergessen?
          </Link>
        </p>
      </div>
    </Container>
  );
}
