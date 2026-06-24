import { AppShell } from "@/components/app-shell";

// All authenticated pages read live data — never prerender/cache them.
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
