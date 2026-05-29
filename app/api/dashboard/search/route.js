import { getSessionUserOrErrorResponse } from "@/lib/auth-server";
import { readSearchQuery } from "@/lib/dashboard-search";
import { searchDashboardResults } from "@/lib/dashboard-search-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = await getSessionUserOrErrorResponse();
  if (auth.response) return auth.response;

  const q = readSearchQuery(new URL(request.url).searchParams.get("q"));
  if (q.length < 2) {
    return Response.json({ ok: true, results: [] });
  }

  const results = await searchDashboardResults(auth.user.role, q, auth.user);
  return Response.json({ ok: true, results });
}
