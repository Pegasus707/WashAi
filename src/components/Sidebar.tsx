"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  Users,
  LineChart,
  Settings,
  Droplets,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "New Order", href: "/new-order", icon: PlusCircle },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Logistics", href: "/logistics", icon: Truck },
  { name: "Insights", href: "/insights", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/50 glass-panel">
      <div className="flex h-16 shrink-0 items-center px-6 gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Droplets className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">WashAI</span>
      </div>
      
      <div className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto p-4">
        <Link
          href="/settings"
          className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
