"use client";

import { useStore, DeliveryStatus } from "@/store/useStore";
import { Truck, MapPin, Clock, CheckCircle2, AlertCircle, UserCircle, Car, Route } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LogisticsHub() {
  const deliveries = useStore((state) => state.deliveries);
  const drivers = useStore((state) => state.drivers);
  const updateDeliveryStatus = useStore((state) => state.updateDeliveryStatus);
  const assignDriver = useStore((state) => state.assignDriver);

  const [assigningDeliveryId, setAssigningDeliveryId] = useState<string | null>(null);

  const pending = deliveries.filter(d => d.status === 'Pending');
  const inTransit = deliveries.filter(d => d.status === 'In Transit');
  const completed = deliveries.filter(d => d.status === 'Delivered' || d.status === 'Failed');

  const handleAssignDriver = (driverId: string) => {
    if (assigningDeliveryId) {
      assignDriver(assigningDeliveryId, driverId);
      toast.success("Driver Assigned", { description: "Delivery moved to In Transit." });
      setAssigningDeliveryId(null);
    }
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return "Unassigned";
    return drivers.find(d => d.id === driverId)?.name || "Unknown Driver";
  };

  const DeliveryCard = ({ delivery }: { delivery: typeof deliveries[0] }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background/80 p-5 rounded-2xl border border-border/60 hover:border-primary/50 hover:shadow-md transition-all flex flex-col gap-4 group cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
              delivery.type === 'Pickup' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
            }`}>
              {delivery.type}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{delivery.orderId}</span>
          </div>
          <h4 className="font-bold text-foreground">{delivery.customerName}</h4>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl">
        <p className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 text-foreground/50" /> <span className="leading-tight">{delivery.address}</span></p>
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-foreground/50" /> <span>{delivery.timeWindow}</span></p>
      </div>

      <div className="pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${delivery.driverId ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            {delivery.driverId ? <Car className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          </div>
          <span className="text-xs font-bold text-foreground">{getDriverName(delivery.driverId)}</span>
        </div>
        
        {delivery.status === 'Pending' && (
          <button 
            onClick={() => setAssigningDeliveryId(delivery.id)}
            className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
          >
            Assign
          </button>
        )}
        {delivery.status === 'In Transit' && (
          <button 
            onClick={() => {
              updateDeliveryStatus(delivery.id, 'Delivered');
              toast.success("Delivery Completed", { description: `${delivery.id} marked as delivered.` });
            }}
            className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-600 transition-colors"
          >
            Complete
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-8 w-full pb-12">
      <div className="flex justify-between items-end border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Route className="h-7 w-7 text-primary" />
            Logistics & Routing
          </h1>
          <p className="text-muted-foreground text-sm">
            Fleet management and real-time delivery tracking.
          </p>
        </div>
      </div>

      {/* Modern Fleet Overview */}
      <div className="glass-panel p-4 md:p-6 rounded-3xl flex flex-col lg:flex-row gap-6 md:gap-8 items-center border-border/30">
        <div className="flex flex-col items-center justify-center px-4 lg:px-8 lg:border-r border-border/50 w-full lg:w-auto">
          <p className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 md:mb-2">Active Fleet</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl md:text-5xl font-black text-primary">{drivers.filter(d => d.status === 'Online').length}</h3>
            <span className="text-lg md:text-xl text-muted-foreground font-bold">/ {drivers.length}</span>
          </div>
        </div>
        
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {drivers.map(driver => (
            <div key={driver.id} className="p-3 md:p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all flex flex-col gap-2 md:gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${driver.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <UserCircle className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <span className="font-bold text-xs md:text-sm block">{driver.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${driver.status === 'Online' ? 'bg-emerald-500' : driver.status === 'On Break' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
                      <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-wider">{driver.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-full min-h-[500px] mt-4">
        {/* Pending Column */}
        <div className="flex flex-col gap-4 md:gap-5 bg-muted/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-border/30">
          <div className="flex justify-between items-center mb-1 md:mb-2 px-1">
            <h3 className="font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
            </h3>
            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2.5 py-1 rounded-full">{pending.length}</span>
          </div>
          <div className="flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 custom-scrollbar">
            {pending.map(d => <DeliveryCard key={d.id} delivery={d} />)}
            {pending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 md:py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                    <AlertCircle className="h-6 w-6 md:h-8 md:w-8 mb-2 md:mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending runs</p>
                </div>
            )}
          </div>
        </div>

        {/* In Transit Column */}
        <div className="flex flex-col gap-4 md:gap-5 bg-primary/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-primary/10">
          <div className="flex justify-between items-center mb-1 md:mb-2 px-1">
            <h3 className="font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" /> In Transit
            </h3>
            <span className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-full">{inTransit.length}</span>
          </div>
          <div className="flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 custom-scrollbar">
            {inTransit.map(d => <DeliveryCard key={d.id} delivery={d} />)}
            {inTransit.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 md:py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                    <Truck className="h-6 w-6 md:h-8 md:w-8 mb-2 md:mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Fleet is idle</p>
                </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col gap-4 md:gap-5 bg-muted/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-border/30">
          <div className="flex justify-between items-center mb-1 md:mb-2 px-1">
            <h3 className="font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
            </h3>
            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-full">{completed.length}</span>
          </div>
          <div className="flex flex-col gap-3 md:gap-4 overflow-y-auto pb-4 custom-scrollbar">
            {completed.map(d => <DeliveryCard key={d.id} delivery={d} />)}
            {completed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 md:py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                    <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 mb-2 md:mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No runs finished</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <AnimatePresence>
        {assigningDeliveryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setAssigningDeliveryId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 rounded-[2rem] shadow-2xl border border-primary/20"
            >
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" /> Assign Driver
              </h2>
              <p className="text-sm text-muted-foreground mb-8">Select an available driver for this route.</p>
              
              <div className="flex flex-col gap-3 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {drivers.map(driver => (
                  <button
                    key={driver.id}
                    onClick={() => handleAssignDriver(driver.id)}
                    disabled={driver.status === 'Offline'}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all group ${
                      driver.status === 'Offline' 
                        ? 'opacity-50 cursor-not-allowed border-border/50 bg-muted/20' 
                        : 'border-border hover:border-primary cursor-pointer bg-background hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${driver.status === 'Online' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            <UserCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{driver.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{driver.activeDeliveries} active loads</p>
                        </div>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${driver.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : driver.status === 'On Break' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setAssigningDeliveryId(null)}
                className="w-full px-4 py-4 bg-muted text-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancel Assignment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
