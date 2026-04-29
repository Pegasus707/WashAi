"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Activity, Users, Clock, ArrowUpRight, Loader2, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/currency";

export default function Insights() {
  const orders = useStore(state => state.orders);
  const currency = useStore(state => state.settings.currency);
  const [isExporting, setIsExporting] = useState(false);

  // Computed insights based on global state
  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return orders.reduce((sum, o) => sum + o.total, 0) / orders.length;
  }, [orders]);

  const handleExport = () => {
    setIsExporting(true);
    
    // Professional multi-stage export simulation
    setTimeout(() => {
      toast.info("Aggregating POS data...", { duration: 1500 });
      setTimeout(() => {
        toast.info("Analyzing machine load patterns...", { duration: 1500 });
        setTimeout(() => {
          toast.success("Intelligence Report Generated", { 
            description: "Printing Intelligence Report...",
            icon: <FileText className="h-4 w-4 text-emerald-500" />
          });
          setIsExporting(false);
          
          // Actually trigger native browser print
          setTimeout(() => {
            window.print();
          }, 500);
          
        }, 1500);
      }, 1500);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Executive Insights</h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            High-level overview of your business performance.
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full sm:w-auto bg-primary text-primary-foreground px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Report
        </button>
      </div>

      {/* Top Level Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { title: "Customer LTV", value: formatCurrency(18450, currency), sub: "+12% vs last month", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Avg Order Value", value: formatCurrency(avgOrderValue, currency), sub: "Optimized via WashAI", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { title: "Predicted Churn", value: "2.4%", sub: "Healthy (industry avg: 5%)", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="bg-background border border-border p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <div className={`p-2.5 md:p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                <metric.icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{metric.title}</p>
              <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">{metric.value}</h3>
              <p className="text-[10px] md:text-xs font-bold text-emerald-500">{metric.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Operations Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-background border border-border p-8 rounded-[2rem] shadow-sm">
        <h3 className="font-bold text-lg mb-8 flex items-center gap-3 uppercase tracking-widest text-muted-foreground">
          <Clock className="h-5 w-5" /> Peak Operational Hours
        </h3>
        
        <div className="space-y-8 max-w-3xl">
          {[
            { time: "Morning Rush (08:00 AM - 10:00 AM)", load: 85, color: "bg-primary" },
            { time: "Mid-day Lull (12:00 PM - 02:00 PM)", load: 40, color: "bg-emerald-500" },
            { time: "Evening Pickup (04:00 PM - 07:00 PM)", load: 95, color: "bg-rose-500" },
          ].map((slot, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <p className="font-bold text-foreground">{slot.time}</p>
                <span className={`text-sm font-black ${slot.color.replace('bg-', 'text-')}`}>{slot.load}% Capacity</span>
              </div>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${slot.load}%` }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 + (i * 0.1) }}
                  className={`h-full rounded-full ${slot.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
