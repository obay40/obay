import { Container } from "@/components/ui/Container";
import { VehicleSearchCard } from "@/features/vehicle-search/components/VehicleSearchCard";

/**
 * Dünner Wrapper: die eigentliche Such-UI/-Logik lebt in
 * features/vehicle-search, damit sie nicht an diese Homepage-Sektion
 * gebunden ist (siehe docs/ARCHITECTURE.md, App-Strategie).
 */
export function SearchTeaser() {
  return (
    <section className="border-navy-100 bg-navy-50/50 border-b py-16">
      <Container>
        <VehicleSearchCard />
      </Container>
    </section>
  );
}
