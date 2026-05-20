import { DashboardRoleLayout } from "../components/dashboard/DashboardRoleLayout";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  return <DashboardRoleLayout>{children}</DashboardRoleLayout>;
}
