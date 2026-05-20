import Link from "next/link";
import { Activity, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | CareHub",
  description:
    "How CareHub Clinic collects, uses, and protects your personal information when you use our website and services.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-surface pt-20 pb-24 sm:pb-32 px-4 sm:px-8 lg:px-20">
      <div className="container mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6">
          <Shield size={14} aria-hidden />
          Legal
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-manrope text-foreground tracking-tight mb-4">
          Privacy policy
        </h1>
        <p className="text-sm text-foreground/50 mb-10">
          Last updated: {new Date().toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-6 text-[15px] text-foreground/75 leading-relaxed">
          <p>
            CareHub Clinic (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy describes how we handle
            personal information when you use our website, booking tools, and related services (together, the
            &quot;Services&quot;). It is intended as a general summary for patients and visitors. For specific clinical
            records practices, your care team can provide additional information required in your region.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">Information we collect</h2>
            <p>We may collect information such as:</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>Account details you provide when registering or signing in (for example, name and email).</li>
            <li>
              Appointment and scheduling information you submit through the Services, including messages you
              choose to send to the clinic.
            </li>
            <li>
              Technical data from your device and browser (for example, IP address, general location, and
              cookies) to operate and secure the Services.
            </li>
            <li>
              Optional profile information you add to your account (for example, a profile photo or contact
              preferences), where that feature is available.
            </li>
          </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">How we use information</h2>
            <p>We use personal information to:</p>
            <ul className="list-disc pl-5 space-y-2">
            <li>Provide, maintain, and improve the Services (including scheduling and notifications).</li>
            <li>Authenticate users and protect accounts from misuse.</li>
            <li>Communicate with you about appointments, billing where applicable, and service updates.</li>
            <li>Meet legal, regulatory, or professional obligations that apply to our clinic.</li>
          </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">Sharing</h2>
            <p>
            We do not sell your personal information. We may share information with service providers who help us
            run the Services (for example, hosting, email, or payment processors), subject to appropriate
            safeguards. We may also disclose information if required by law or to protect the rights and safety of
            our patients, staff, and the public.
          </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">Retention and security</h2>
            <p>
            We retain information only as long as needed for the purposes above and as required by law or
            clinical record-keeping rules. We use reasonable technical and organisational measures to protect
            personal information; no method of transmission over the internet is completely secure.
          </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">Your choices</h2>
            <p>
            Where applicable, you may access or update certain account information through the Services, or
            contact the clinic for assistance. You may also have rights under local privacy laws (for example, to
            request access or correction).
          </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold font-manrope text-foreground pt-4">Contact</h2>
            <p>
            Questions about this policy can be sent to{" "}
            <a
              href="mailto:privacy@carehubclinic.com"
              className="text-primary font-semibold underline-offset-2 hover:underline"
            >
              privacy@carehubclinic.com
            </a>{" "}
            or to the clinic address shown on our{" "}
            <Link href="/contact" className="text-primary font-semibold underline-offset-2 hover:underline">
              Contact
            </Link>{" "}
            page.
          </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/[0.08]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Activity size={16} aria-hidden />
            </span>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
