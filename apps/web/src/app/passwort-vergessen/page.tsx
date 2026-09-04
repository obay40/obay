import { PagePlaceholder } from "@/components/ui/PagePlaceholder";

export const metadata = { title: "Passwort vergessen" };

export default function ForgotPasswordPage() {
  return (
    <PagePlaceholder
      title="Passwort vergessen"
      description="Der Passwort-Reset per E-Mail entsteht in einer späteren Phase."
      phase="Phase 8"
    />
  );
}
