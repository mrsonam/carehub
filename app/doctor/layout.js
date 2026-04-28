import { DashboardRoleLayout } from "../components/dashboard/DashboardRoleLayout";

export const dynamic = "force-dynamic";

export default function DoctorLayout({ children }) {
  return <DashboardRoleLayout>{children}</DashboardRoleLayout>;
}
