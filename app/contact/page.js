import ContactPageClient from "./ContactPageClient";
import { getContactInboxEmail } from "@/lib/site-contact";

export default function ContactPage() {
  const companyEmail = getContactInboxEmail();
  return <ContactPageClient companyEmail={companyEmail} />;
}
