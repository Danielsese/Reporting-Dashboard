import Link from "next/link";
import { cn } from "@/lib/utils";

export function ListTabs({
  basePath,
  active,
}: {
  basePath: string;
  active: "active" | "archived";
}) {
  const tabs = [
    { key: "active" as const, label: "Active", href: basePath },
    {
      key: "archived" as const,
      label: "Archived",
      href: `${basePath}?view=archived`,
    },
  ];
  return (
    <div className="mb-4 flex gap-1 border-b border-border">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            active === t.key
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:text-foreground",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
