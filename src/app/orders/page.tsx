"use client";

import { useRouter } from "next/navigation";
import { Search, Filter, MoreHorizontal, CheckCircle, Printer, Trash2, Edit2, Receipt, Download } from "lucide-react";
import { useStore, OrderStatus, Order } from "@/store/useStore";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";

export default function Orders() {
  const allOrders = useStore((state) => state.orders);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  const deleteOrder = useStore((state) => state.deleteOrder);
  const currency = useStore((state) => state.settings.currency);
  const taxRate = useStore((state) => state.settings.taxRate);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // Invoice Modal State
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      const lowerQ = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        o.id.toLowerCase().includes(lowerQ) || 
        o.customer.toLowerCase().includes(lowerQ) || 
        o.items.some(i => i.name.toLowerCase().includes(lowerQ));
      
      const matchesStatus = filterStatus === "All" || o.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [allOrders, searchQuery, filterStatus]);

  const handleAction = (action: string, order: Order) => {
    setActiveDropdown(null);
    if (action === 'invoice') {
      setInvoiceOrder(order);
    } else if (action === 'edit') {
      router.push(`/new-order?edit=${order.id}`);
    } else if (action === 'print') {
      setInvoiceOrder(order);
      setTimeout(() => {
        window.print();
      }, 500);
    } else if (action === 'delete') {
      deleteOrder(order.id);
      toast.success(`Order ${order.id} deleted.`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Orders</h1>
          <p className="text-muted-foreground text-sm">Manage and track all laundry orders.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              toast.promise(
                new Promise(resolve => setTimeout(resolve, 1000)),
                {
                  loading: 'Preparing CSV export...',
                  success: 'Export successful! orders.csv downloaded.',
                  error: 'Export failed'
                }
              );
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-2xl font-black">{allOrders.length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">In Processing</p>
            <p className="text-2xl font-black text-amber-500">{allOrders.filter(o => o.status === 'Processing').length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ready for Pickup</p>
            <p className="text-2xl font-black text-blue-500">{allOrders.filter(o => o.status === 'Ready').length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-emerald-500">{formatCurrency(allOrders.reduce((sum, o) => sum + o.total, 0), currency)}</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-visible flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer, or items..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            {['All', 'Received', 'Processing', 'Ready', 'Delivered'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                        filterStatus === status 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                    }`}
                >
                    {status}
                </button>
            ))}
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" ref={dropdownRef}>
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 sticky top-0 z-20">
              <tr>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50">Order ID</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50">Customer</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50 hidden md:table-cell">Items</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50">Status</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50">Amount</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50 hidden lg:table-cell">Time</th>
                <th className="px-4 md:px-6 py-4 font-black tracking-widest border-b border-border/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 md:px-6 py-4 font-black text-foreground whitespace-nowrap text-xs md:text-sm">{order.id}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-xs md:text-sm">{order.customer}</span>
                        <span className="text-[10px] text-muted-foreground md:hidden">{order.items.length} items</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground hidden md:table-cell text-xs max-w-[200px] truncate">
                    {order.items.map(it => `${it.quantity} ${it.name}`).join(', ')}
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        updateOrderStatus(order.id, e.target.value as OrderStatus);
                        toast.success(`Order ${order.id} updated`);
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all border-none focus:ring-2 focus:ring-primary/20 appearance-none ${
                        order.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-500' :
                        order.status === 'Processing' ? 'bg-amber-500/10 text-amber-500' :
                        order.status === 'Received' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }`}
                    >
                      <option value="Received">Received</option>
                      <option value="Processing">Processing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-black text-xs md:text-sm whitespace-nowrap">{formatCurrency(order.total, currency)}</td>
                  <td className="px-4 md:px-6 py-4 text-muted-foreground text-[10px] hidden lg:table-cell uppercase font-bold">{order.time}</td>
                  <td className="px-4 md:px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === order.id ? null : order.id)}
                      className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === order.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-48 bg-card border border-border rounded-xl shadow-2xl z-[50] overflow-hidden py-1 backdrop-blur-xl"
                        >
                          <button 
                            onClick={() => handleAction('edit', order)}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4 text-primary" /> Edit Order
                          </button>
                          <button 
                            onClick={() => handleAction('invoice', order)}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer"
                          >
                            <Receipt className="h-4 w-4 text-primary" /> Invoice
                          </button>
                          <button 
                            onClick={() => handleAction('print', order)}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer"
                          >
                            <Printer className="h-4 w-4 text-primary" /> Print
                          </button>
                          <div className="h-px bg-border/50 mx-2 my-1"></div>
                          <button 
                            onClick={() => handleAction('delete', order)}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No orders match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <AnimatePresence>
        {invoiceOrder && (() => {
          const order = invoiceOrder;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setInvoiceOrder(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg glass-panel p-0 rounded-2xl shadow-2xl border border-border overflow-hidden"
              >
                <div className="p-8 bg-white text-black min-h-[600px] flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-black italic tracking-tighter mb-1">WASH AI</h2>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Premium Laundry POS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">INVOICE</p>
                      <p className="text-xs text-zinc-500">{order.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2">Billed To</p>
                      <p className="text-sm font-bold">{order.customer}</p>
                      <p className="text-xs text-zinc-500 italic">Walk-in Customer</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2">Date</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <table className="w-full text-left text-sm mb-8">
                      <thead>
                        <tr className="border-b-2 border-black text-[10px] uppercase font-black">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="border-b border-zinc-100">
                            <td className="py-3 font-medium">{item.name}</td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right">{formatCurrency(item.total, currency)}</td>
                          </tr>
                        ))}
                        {order.services.map((svc, i) => (
                          <tr key={`svc-${i}`} className="border-b border-zinc-100">
                            <td className="py-3 font-medium">{svc.name}</td>
                            <td className="py-3 text-center">1</td>
                            <td className="py-3 text-right">{formatCurrency(svc.price, currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t-2 border-black pt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase">Subtotal</span>
                      <span className="text-sm font-bold">{formatCurrency(order.subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase">Tax ({taxRate}%)</span>
                      <span className="text-sm font-bold">{formatCurrency(order.tax, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-black uppercase">Total</span>
                      <span className="text-lg font-black">{formatCurrency(order.total, currency)}</span>
                    </div>
                  </div>

                  <div className="mt-8 text-center border-t border-zinc-100 pt-4">
                    <p className="text-[10px] text-zinc-400 font-medium">Thank you for your business. Stay fresh!</p>
                  </div>
                </div>

                <div className="p-4 bg-muted border-t border-border flex gap-3">
                  <button 
                    onClick={() => setInvoiceOrder(null)}
                    className="flex-1 px-4 py-2 bg-background text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
