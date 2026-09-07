import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { DealerRegisterForm } from "./DealerRegisterForm";

export const metadata = { title: "Händlerregistrierung" };

export default function DealerRegisterPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-xl">
        <h1 className="text-navy-900 text-2xl font-bold">Händlerregistrierung</h1>
        <p className="text-navy-600 mt-1 text-sm">
          Für Autohäuser und gewerbliche Fahrzeuganbieter. Nach dem Absenden prüfen wir dein
          Händlerkonto, bevor es freigeschaltet wird.
        </p>

        <DealerRegisterForm />

        <p className="text-navy-600 mt-6 text-center text-sm">
          Bereits registriert?{" "}
          <Link href="/haendler/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </Container>
  );
}
