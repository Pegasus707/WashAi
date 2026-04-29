"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Mail, Phone, Calendar, Star, X, Package, DollarSign, ExternalLink, Edit3, Save, Trash2, AlertCircle, Sparkles, Activity, Tag, Send } from "lucide-react";
import { useStore, Customer } from "@/store/useStore";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

export default function Customers() {
  const customers = useStore((state) => state.customers);
  const orders = useStore((state) => state.orders);
  const addCustomer = useStore((state) => state.addCustomer);
  const updateCustomer = useStore((state) => state.updateCustomer);
  const deleteCustomer = useStore((state) => state.deleteCustomer);
  const currency = useStore((state) => state.settings.currency);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);

  // Edit State
  const [editData, setEditData] = useState<Partial<Customer>>({});
  
  // Register State
  const [newData, setNewData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active" as const
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
      const matchesStatus = filterStatus === "All" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, filterStatus]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => o.customer === selectedCustomer.name);
  }, [selectedCustomer, orders]);

  // AI Churn Logic (Simulation)
  const churnMetrics = useMemo(() => {
    if (!selectedCustomer) return null;
    
    // Simulate AI churn logic based on customer status and orders
    const isHighRisk = selectedCustomer.status === 'Inactive' || (selectedCustomer.totalOrders > 0 && selectedCustomer.totalOrders < 3);
    const riskScore = isHighRisk ? Math.floor(Math.random() * 20) + 75 : Math.floor(Math.random() * 30) + 10;
    
    return {
      isHighRisk,
      riskScore,
      recommendation: isHighRisk ? "Send 20% Discount for Dry Cleaning" : "Maintain normal engagement",
      lastSeenDays: isHighRisk ? Math.floor(Math.random() * 30) + 21 : Math.floor(Math.random() * 10) + 2
    };
  }, [selectedCustomer]);

  const handleOpenEdit = () => {
    if (!selectedCustomer) return;
    setEditData(selectedCustomer);
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedCustomer || !editData.name) return;
    updateCustomer({ ...selectedCustomer, ...editData } as Customer);
    setSelectedCustomer({ ...selectedCustomer, ...editData } as Customer);
    setIsEditMode(false);
    toast.success("Profile Updated", { description: `${editData.name}'s information has been saved.` });
  };

  const handleDelete = () => {
    if (!selectedCustomer) return;
    deleteCustomer(selectedCustomer.id);
    toast.error("Customer Deleted", { description: `${selectedCustomer.name} has been removed from the directory.` });
    setSelectedCustomer(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newData.name || !newData.phone) {
        toast.error("Missing Information", { description: "Name and Phone are required." });
        return;
    }

    const customer: Customer = {
        id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newData.name,
        email: newData.email || "no-email@example.com",
        phone: newData.phone,
        status: newData.status,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    addCustomer(customer);
    setIsRegisterOpen(false);
    setNewData({ name: "", email: "", phone: "", status: "Active" });
    toast.success("Customer Registered", { description: `${customer.name} has been added to the directory.` });
  };

  const generateAIOffer = () => {
    setIsGeneratingOffer(true);
    toast.info("WashAI is analyzing preferences...", { duration: 2000 });
    
    setTimeout(() => {
        setIsGeneratingOffer(false);
        toast.success("Offer Dispatched!", { 
            description: `Sent personalized SMS: "We miss you! Here's 20% off your next Dry Cleaning."`,
            icon: <Send className="h-4 w-4 text-emerald-500" />
        });
        
        // Auto-update status to active as part of the simulation
        if (selectedCustomer) {
            const updated = { ...selectedCustomer, status: 'Active' as const };
            updateCustomer(updated);
            setSelectedCustomer(updated);
        }
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2">Customer Directory</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage your client base and view historical spending habits.</p>
        </div>
        <button 
          onClick={() => setIsRegisterOpen(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground px-5 py-3 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Register
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Customers</p>
            <p className="text-2xl font-black">{customers.length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">VIP Accounts</p>
            <p className="text-2xl font-black text-amber-500">{customers.filter(c => c.status === 'VIP').length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Churn Alerts</p>
            <p className="text-2xl font-black text-rose-500">{customers.filter(c => c.status === 'Inactive').length}</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-border/50">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Ticket Size</p>
            <p className="text-2xl font-black text-emerald-500">{formatCurrency(640, currency)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
            {['All', 'Active', 'Inactive', 'VIP'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer whitespace-nowrap ${
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredCustomers.map((customer, i) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
                setSelectedCustomer(customer);
                setIsEditMode(false);
            }}
            className="glass-panel p-5 md:p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer group flex flex-col shadow-sm"
          >
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs md:text-sm">
                {customer.name.charAt(0)}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                customer.status === 'VIP' ? 'bg-amber-500/10 text-amber-500' : 
                customer.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500' : 
                'bg-emerald-500/10 text-emerald-500'
              }`}>
                {customer.status === "VIP" && <Star className="h-2.5 w-2.5 fill-amber-500" />} {customer.status}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-black text-foreground group-hover:text-primary transition-colors mb-1">{customer.name}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 mb-1"><Phone className="h-3 w-3" /> {customer.phone}</p>
            </div>

            <div className="flex justify-between items-end pt-3 mt-3 md:pt-4 md:mt-4 border-t border-border/50">
              <div>
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Spent</p>
                <p className="text-xs md:text-sm font-black text-emerald-500">{formatCurrency(customer.totalSpent, currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Orders</p>
                <p className="text-xs md:text-sm font-black">{customer.totalOrders}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Register Customer Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-black mb-6">New Registration</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                  <input required value={newData.name} onChange={e => setNewData({...newData, name: e.target.value})} type="text" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                  <input required value={newData.phone} onChange={e => setNewData({...newData, phone: e.target.value})} type="tel" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="+91 98765 43210" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                  <input value={newData.email} onChange={e => setNewData({...newData, email: e.target.value})} type="email" className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 transition-opacity">
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Customer Profile Modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { if(!isDeleteConfirmOpen) setSelectedCustomer(null); }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
              
              {/* Left Side: Profile Details */}
              <div className="w-full md:w-80 bg-muted/20 p-8 border-r border-border flex flex-col relative overflow-y-auto custom-scrollbar">
                <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors md:hidden"><X className="h-5 w-5" /></button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border-2 border-primary/20">
                    {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-black">{selectedCustomer.name}</h2>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded mt-1 inline-block ${
                            selectedCustomer.status === 'VIP' ? 'bg-amber-500/10 text-amber-500' : 
                            selectedCustomer.status === 'Inactive' ? 'bg-rose-500/10 text-rose-500' : 
                            'bg-emerald-500/10 text-emerald-500'
                        }`}>
                            {selectedCustomer.status}
                        </span>
                    </div>
                </div>
                
                {isEditMode ? (
                  <div className="w-full space-y-4 mb-8">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Name</label>
                      <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Phone</label>
                      <input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account Status</label>
                      <select value={editData.status} onChange={e => setEditData({...editData, status: e.target.value as any})} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="VIP">VIP Member</option>
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => setIsEditMode(false)} className="flex-1 py-2 bg-background border border-border hover:bg-muted text-foreground text-xs font-bold rounded-lg uppercase tracking-widest cursor-pointer">Cancel</button>
                      <button onClick={handleSaveEdit} className="flex-1 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg uppercase tracking-widest flex items-center justify-center gap-1 cursor-pointer"><Save className="h-3 w-3" /> Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background p-3 rounded-xl border border-border">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background p-3 rounded-xl border border-border">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-background p-3 rounded-xl border border-border">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Joined {selectedCustomer.joinDate}</span>
                    </div>
                  </div>
                )}

                {/* AI Ghost Recovery Engine */}
                {churnMetrics && (
                    <div className={`mt-auto mb-8 p-5 rounded-2xl border ${churnMetrics.isHighRisk ? 'bg-rose-500/5 border-rose-500/20' : 'bg-primary/5 border-primary/20'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className={`h-4 w-4 ${churnMetrics.isHighRisk ? 'text-rose-500' : 'text-primary'}`} />
                            <h4 className={`text-xs font-black uppercase tracking-widest ${churnMetrics.isHighRisk ? 'text-rose-500' : 'text-primary'}`}>WashAI Analysis</h4>
                        </div>
                        
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Churn Risk</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-2xl font-black leading-none">{churnMetrics.riskScore}%</span>
                                    {churnMetrics.isHighRisk && <Activity className="h-4 w-4 text-rose-500 mb-0.5" />}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Last Order</p>
                                <span className="text-sm font-bold">{churnMetrics.lastSeenDays} Days Ago</span>
                            </div>
                        </div>

                        {churnMetrics.isHighRisk && (
                            <button 
                                onClick={generateAIOffer}
                                disabled={isGeneratingOffer}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {isGeneratingOffer ? <Sparkles className="h-3 w-3 animate-pulse" /> : <Tag className="h-3 w-3" />}
                                Generate Recovery Offer
                            </button>
                        )}
                    </div>
                )}

                <div className="w-full flex flex-col gap-2 mt-auto">
                    <button onClick={handleOpenEdit} className="w-full py-2.5 border border-border hover:bg-muted text-foreground font-bold rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Edit3 className="h-3 w-3" /> Edit Profile
                    </button>
                    <button 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="w-full py-2.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                    <Trash2 className="h-3 w-3" /> Delete
                    </button>
                </div>
              </div>

              {/* Right Side: Activity */}
              <div className="flex-1 p-8 flex flex-col bg-background relative">
                <button onClick={() => setSelectedCustomer(null)} className="hidden md:flex absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"><X className="h-5 w-5" /></button>
                
                <h3 className="text-xl font-bold mb-6">Activity & History</h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Package className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Lifetime Orders</span>
                        </div>
                        <p className="text-3xl font-black">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Total Spent</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-500">{formatCurrency(selectedCustomer.totalSpent, currency)}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recent Transactions</h4>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {customerOrders.length > 0 ? (
                          customerOrders.map(order => (
                            <div key={order.id} className="p-4 bg-background border border-border rounded-2xl flex justify-between items-center group hover:border-primary transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-muted/50 rounded-xl flex items-center justify-center text-primary">
                                        <Package className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{order.id}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{order.time} • {order.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-sm font-black">{formatCurrency(order.total, currency)}</p>
                                        <p className={`text-[10px] font-bold uppercase ${
                                            order.status === 'Delivered' ? 'text-emerald-500' :
                                            order.status === 'Ready' ? 'text-blue-500' :
                                            'text-amber-500'
                                        }`}>{order.status}</p>
                                    </div>
                                </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center h-full">
                            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <p className="text-sm font-bold text-foreground mb-1">No transaction history</p>
                            <p className="text-xs text-muted-foreground">This customer hasn't placed any orders yet.</p>
                          </div>
                        )}
                    </div>
                </div>
              </div>

              {/* Delete Confirmation Overlay */}
              <AnimatePresence>
                {isDeleteConfirmOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-background/90 backdrop-blur-md flex items-center justify-center p-8"
                    >
                        <div className="max-w-xs text-center glass-panel p-8 rounded-3xl">
                            <div className="h-16 w-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-black mb-2">Delete Customer?</h4>
                            <p className="text-sm text-muted-foreground mb-8">
                                This will permanently remove <span className="font-bold text-foreground">{selectedCustomer.name}</span>. This action cannot be undone.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={handleDelete} className="w-full py-3 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-colors cursor-pointer">Confirm Delete</button>
                                <button onClick={() => setIsDeleteConfirmOpen(false)} className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer">Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
