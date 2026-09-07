import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Registrieren" };

export default function RegisterPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-navy-900 text-2xl font-bold">Konto erstellen</h1>
        <p className="text-navy-600 mt-1 text-sm">
          Registriere dich, um dein Fahrzeug zu verkaufen, zu vermitteln oder zu inserieren.
        </p>

        <RegisterForm />

        <p className="text-navy-600 mt-6 text-center text-sm">
          Bereits registriert?{" "}
          <Link href="/anmelden" className="text-brand-600 hover:text-brand-700 font-medium">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </Container>
  );
}
