import { DashboardRoleLayout } from "../../components/dashboard/DashboardRoleLayout";

export const dynamic = "force-dynamic";

export default async function DashboardSetupLayout({ children }) {
  return <DashboardRoleLayout>{children}</DashboardRoleLayout>;
}
