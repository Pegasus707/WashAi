"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, Clock, TrendingUp, Sparkles, ArrowUpRight, CheckCircle2, Plus, Users, Receipt } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useStore } from "@/store/useStore";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { Skeleton } from "@/components/ui/Skeleton";

const chartDataSets = {
  "This Week": [
    { name: "Mon", revenue: 32000, items: 45 },
    { name: "Tue", revenue: 24000, items: 30 },
    { name: "Wed", revenue: 44000, items: 55 },
    { name: "Thu", revenue: 36000, items: 48 },
    { name: "Fri", revenue: 56000, items: 85 },
    { name: "Sat", revenue: 68000, items: 110 },
    { name: "Sun", revenue: 72000, items: 125 },
  ],
  "Last Week": [
    { name: "Mon", revenue: 28000, items: 40 },
    { name: "Tue", revenue: 26000, items: 35 },
    { name: "Wed", revenue: 40000, items: 50 },
    { name: "Thu", revenue: 38000, items: 45 },
    { name: "Fri", revenue: 52000, items: 80 },
    { name: "Sat", revenue: 60000, items: 95 },
    { name: "Sun", revenue: 64000, items: 105 },
  ],
  "Last Month": [
    { name: "Week 1", revenue: 180000, items: 250 },
    { name: "Week 2", revenue: 220000, items: 310 },
    { name: "Week 3", revenue: 210000, items: 290 },
    { name: "Week 4", revenue: 260000, items: 360 },
  ],
  "This Year": [
    { name: "Jan", revenue: 750000, items: 1100 },
    { name: "Feb", revenue: 820000, items: 1250 },
    { name: "Mar", revenue: 900000, items: 1350 },
    { name: "Apr", revenue: 880000, items: 1300 },
    { name: "May", revenue: 950000, items: 1450 },
    { name: "Jun", revenue: 1100000, items: 1600 },
    { name: "Jul", revenue: 1050000, items: 1550 },
    { name: "Aug", revenue: 1150000, items: 1700 },
    { name: "Sep", revenue: 1000000, items: 1500 },
    { name: "Oct", revenue: 1200000, items: 1800 },
    { name: "Nov", revenue: 1350000, items: 2000 },
    { name: "Dec", revenue: 1500000, items: 2200 },
  ],
};

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6 w-full pb-8">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-24 w-full rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const orders = useStore((state) => state.orders);
  const customers = useStore((state) => state.customers);
  const currency = useStore((state) => state.settings.currency);
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState("This Week");
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    // Artificial delay to show skeleton (optional, but good for demo)
    const timeout = setTimeout(() => setMounted(true), 1500);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === 'Received' || o.status === 'Processing').length, [orders]);
  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const activeCustomersCount = useMemo(() => customers.filter(c => c.status !== 'Inactive').length, [customers]);
  const currentChartData = useMemo(() => chartDataSets[timeFilter as keyof typeof chartDataSets] || chartDataSets["This Week"], [timeFilter]);

  const revenueGoal = 250000;
  const goalProgress = Math.min(100, (totalRevenue / revenueGoal) * 100);

  if (!mounted) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
          <p className="text-xl md:text-2xl font-black font-mono tracking-tighter text-primary">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
              {currentTime.toLocaleDateString([], { weekday: 'short' })}
            </p>
            <p className="text-[10px] font-bold text-foreground leading-none mt-1">
              {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                  loading: 'Compiling financial data...',
                  success: 'End of day report has been generated and sent to your email.',
                  error: 'Error generating report',
                }
              );
            }}
            className="bg-muted text-foreground border border-border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors cursor-pointer"
          >
            Export EOD
          </button>
          <Link 
            href="/new-order"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> New Order
          </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { title: "Store Earnings", value: formatCurrency(totalRevenue + 142000, currency), icon: DollarSign, trend: "+12.5%", isUp: true },
          { title: "Active Orders", value: orders.length.toString(), icon: Package, trend: "+5.2%", isUp: true },
          { title: "Pending Wash", value: pendingOrdersCount.toString(), icon: Clock, trend: "-2.1%", isUp: false },
          { title: "Active Clients", value: activeCustomersCount.toString(), icon: Users, trend: "+8.0%", isUp: true },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-4 md:p-5 rounded-xl md:rounded-2xl flex flex-col justify-between border border-border/50"
          >
            <div className="flex justify-between items-start mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg text-primary">
                <kpi.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className={`flex items-center text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${kpi.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-[10px] md:text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">{kpi.title}</p>
              <h3 className="text-lg md:text-2xl lg:text-3xl font-black tracking-tighter">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goal Progress Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-border/50">
          <div className="flex justify-between items-end mb-4">
              <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Monthly Revenue Goal</p>
                  <h4 className="text-xl font-black">{formatCurrency(totalRevenue, currency)} <span className="text-muted-foreground font-medium text-sm">/ {formatCurrency(revenueGoal, currency)}</span></h4>
              </div>
              <p className="text-sm font-black text-primary">{goalProgress.toFixed(1)}%</p>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary"
              />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          <div className="glass-panel p-4 md:p-6 rounded-xl flex flex-col flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="font-semibold text-lg">Revenue Overview</h3>
              <select 
                className="w-full sm:w-auto bg-background border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  toast(`View updated to ${e.target.value}`);
                }}
              >
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
            <div className="flex-1 min-h-[250px] md:min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                    dx={-10} 
                    tickFormatter={(value) => `${currency === 'USD' ? '$' : '₹'}${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
             <div className="p-4 md:p-6 rounded-2xl bg-muted/20 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => router.push('/orders')}>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Items Processed</p>
                  <p className="text-2xl md:text-3xl font-black">423</p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Receipt className="h-5 w-5 md:h-6 md:w-6" />
                </div>
             </div>
             <div className="p-4 md:p-6 rounded-2xl bg-muted/20 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-colors" onClick={() => router.push('/insights')}>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg Order Value</p>
                  <p className="text-2xl md:text-3xl font-black">{formatCurrency(totalRevenue / (orders.length || 1), currency)}</p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                </div>
             </div>
          </div>
        </motion.div>

        {/* AI Insights & Recent */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          {/* Dashboard Summary / Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-xl border border-border bg-muted/20"
          >
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Operations Center</h3>
            <div className="space-y-3">
               <button 
                  onClick={() => router.push('/new-order')}
                  className="w-full flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary transition-all group"
               >
                  <span className="text-sm font-bold">Launch New Order</span>
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
               </button>
               <button 
                  onClick={() => router.push('/customers')}
                  className="w-full flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary transition-all group"
               >
                  <span className="text-sm font-bold">Register Customer</span>
                  <Users className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
               </button>
               <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Systems Nominal</span>
               </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 rounded-2xl flex-1 flex flex-col min-h-[300px]"
          >
            <div className="flex justify-between items-center mb-5 border-b border-border/50 pb-4">
              <h3 className="font-semibold">Recent Orders</h3>
              <button 
                onClick={() => router.push('/orders')}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-4 flex-1">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center group cursor-pointer" onClick={() => router.push('/orders')}>
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                      order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' :
                      order.status === 'Delivered' ? 'bg-muted text-muted-foreground' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{order.customer}</p>
                      <p className="text-xs text-muted-foreground truncate w-32">{order.items.map(i => `${i.quantity} ${i.name}`).join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">{formatCurrency(order.total, currency)}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{order.status}</p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-4">No recent orders found.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
