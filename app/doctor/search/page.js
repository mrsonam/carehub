import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readSearchQuery } from "@/lib/dashboard-search";
import { searchDoctorResults } from "@/lib/dashboard-search-data";
import { DashboardSearchResults } from "@/app/components/dashboard/DashboardSearchResults";

export const dynamic = "force-dynamic";

export default async function DoctorSearchPage({ searchParams }) {
  const sp = await Promise.resolve(searchParams);
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;
  if (!session) redirect("/login?next=/doctor/search");
  if (session.role !== "DOCTOR") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true },
  });
  if (!user) redirect("/login?next=/doctor/search");

  const query = readSearchQuery(sp?.q);
  const results = await searchDoctorResults(query, user);

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold font-manrope tracking-tight">Search</h1>
        <p className="text-sm text-foreground/55 mt-1">
          Find patients and appointments on your schedule.
        </p>
      </div>
      <DashboardSearchResults query={query} {...results} />
    </div>
  );
}
