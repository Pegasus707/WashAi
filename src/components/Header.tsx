"use client";

import { Search, Sparkles, Bell, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useStore();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes("sarah") || q.includes("emma") || q.includes("michael")) {
        toast.success(`Found matching customer: ${searchQuery}`, { description: "Redirecting..." });
        router.push("/customers");
      } else if (q.startsWith("ord-")) {
        toast.success(`Found order: ${searchQuery}`, { description: "Redirecting..." });
        router.push("/orders");
      } else {
        toast.info(`Search: "${searchQuery}"`, { description: "No direct matches found." });
      }
      setSearchQuery("");
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/60 px-4 md:px-6 backdrop-blur-xl z-30 sticky top-0">
      <button 
        onClick={toggleSidebar}
        className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="flex flex-1 items-center gap-4">
        {/* Standard Search */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search orders, customers, or invoices..."
            className="h-10 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => toast("Notifications", { description: "You have 3 unread updates about pending orders." })}
          className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>
        <button 
          onClick={() => toast("User Profile", { description: "Opening user settings panel..." })}
          className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors"
        >
          <User className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
