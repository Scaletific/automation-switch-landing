import type { Metadata } from "next";
import AuditWizard from "./AuditWizard";

export const metadata: Metadata = {
  title: "Workflow Automation Audit — Free Tool | Automation Switch",
  description:
    "Score your workflows across five dimensions and get a ranked build order. Know exactly what to automate first, what to leave alone, and what to fix before you build.",
  openGraph: {
    title: "Workflow Automation Audit — Free Tool",
    description:
      "Score your workflows across five dimensions. Get a ranked build order in under 10 minutes.",
    url: "https://automationswitch.com/tools/audit",
    siteName: "Automation Switch",
    type: "website",
  },
};

export default function AuditPage() {
  return <AuditWizard />;
}
