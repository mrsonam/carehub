import { requireAdminUser } from "@/lib/auth-server";
import FeeScheduleForm from "@/app/components/admin/FeeScheduleForm";

export const dynamic = "force-dynamic";

export default async function AdminFeeSettingsPage() {
  await requireAdminUser("/admin/settings/fees");

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/45">
          Billing
        </p>
        <h1 className="mt-2 text-3xl font-extrabold font-manrope tracking-tight">
          Appointment fees
        </h1>
        <p className="text-foreground/55 mt-1.5 text-sm max-w-2xl">
          Configure upfront fees by appointment length. Changes apply to new patient
          bookings immediately.
        </p>
      </div>

      <FeeScheduleForm />
    </div>
  );
}
