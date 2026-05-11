import { JoinCodeForm } from "./JoinCodeForm";
import { JoinEntryFooter } from "./JoinEntryFooter";

export default function JoinEntryPage() {
  return (
    <main className="join-shell" style={{ minHeight: "100vh", padding: "0 16px" }}>
      <JoinCodeForm />
      <JoinEntryFooter />
    </main>
  );
}
