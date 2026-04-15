import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="px-20 py-16">
      <div className="container mx-auto">
        <h1 className="text-4xl font-black font-manrope tracking-tight">Patient Dashboard</h1>
        <p className="text-foreground/60 mt-2">Welcome. You’re signed in as a patient.</p>

        <div className="mt-10 flex gap-4">
          <Link href="/services" className="bg-primary text-white px-6 py-3 rounded-xl font-bold">
            Browse Services
          </Link>
          <Link href="/doctors" className="bg-surface-lowest px-6 py-3 rounded-xl font-bold text-foreground/70">
            Find Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}

