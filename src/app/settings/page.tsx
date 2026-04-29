"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { Settings, Store, Percent, Zap, Bell, Shield, Save, Loader2, Key, Users, RefreshCw, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

// Custom Toggle Component
const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-muted border border-border'}`}
  >
    <motion.div 
      layout
      className={`bg-white h-4 w-4 rounded-full shadow-md`}
      animate={{ x: checked ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </div>
);

export default function SettingsPage() {
  const storeSettings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const [formData, setFormData] = useState(storeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    setFormData(storeSettings);
  }, [storeSettings]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      toast.success("Configuration Deployed", { description: "System settings have been successfully updated across all nodes." });
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border/50 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            System Configuration
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage operational parameters, AI behavior, and security access controls.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold tracking-wide hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "DEPLOYING..." : "SAVE CHANGES"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Navigation */}
        <div className="flex flex-col gap-2">
            {[
                { id: 'general', label: 'General Information', icon: Store },
                { id: 'financial', label: 'Financial Rules', icon: Percent },
                { id: 'ai', label: 'WashAI Engine', icon: Zap },
                { id: 'security', label: 'Security & Access', icon: Shield },
                { id: 'api', label: 'API Integrations', icon: Key },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                    }`}
                >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                </button>
            ))}
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          
          {/* General Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`glass-panel p-8 rounded-2xl border border-border flex-col gap-6 ${activeTab === 'general' ? 'flex' : 'hidden'}`}
          >
            <div className="border-b border-border/50 pb-4 mb-2">
                <h2 className="text-xl font-bold">Store Profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Basic identification and contact information.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Store className="h-3 w-3" /> Registered Entity Name
                </label>
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Bell className="h-3 w-3" /> System Admin Email
                </label>
                <input 
                  type="email" 
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Default Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Financial Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`glass-panel p-8 rounded-2xl border border-border flex-col gap-6 ${activeTab === 'financial' ? 'flex' : 'hidden'}`}
          >
            <div className="border-b border-border/50 pb-4 mb-2">
                <h2 className="text-xl font-bold">Taxation & Margins</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure global tax rates and operational fees.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Percent className="h-3 w-3" /> Base Tax Rate (%)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={formData.taxRate}
                    onChange={(e) => handleChange("taxRate", parseFloat(e.target.value) || 0)}
                    className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="absolute right-4 top-3 text-muted-foreground font-bold">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Applied to all transactions unless overridden.</p>
              </div>
            </div>
          </motion.div>

          {/* AI & Automation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`glass-panel p-8 rounded-2xl border border-primary/20 bg-primary/5 flex-col gap-6 relative overflow-hidden ${activeTab === 'ai' ? 'flex' : 'hidden'}`}
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="border-b border-primary/10 pb-4 mb-2 relative z-10">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Zap className="h-5 w-5 fill-primary/20" /> WashAI Intelligence Engine
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Enable autonomous operational features and predictive analytics.</p>
            </div>
            
            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-start justify-between gap-4 p-4 bg-background/50 border border-border rounded-xl hover:border-primary/50 transition-all">
                <div>
                  <h3 className="text-sm font-black text-foreground mb-1">Dynamic Surge Pricing</h3>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    WashAI monitors incoming order volume and automatically increases express delivery fees by up to 15% during peak operational bottlenecks.
                  </p>
                </div>
                <Toggle checked={formData.enableSmartPricing} onChange={(v) => handleChange("enableSmartPricing", v)} />
              </div>

              <div className="flex items-start justify-between gap-4 p-4 bg-background/50 border border-border rounded-xl hover:border-primary/50 transition-all">
                <div>
                  <h3 className="text-sm font-black text-foreground mb-1">Autonomous Inventory Reordering</h3>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    Allow WashAI to automatically draft and send purchase orders to registered distributors when predictive models detect low supply levels (detergents, tags).
                  </p>
                </div>
                <Toggle checked={formData.autoReorderStock} onChange={(v) => handleChange("autoReorderStock", v)} />
              </div>
            </div>
          </motion.div>

          {/* Security & Access */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`glass-panel p-8 rounded-2xl border border-border flex-col gap-6 ${activeTab === 'security' ? 'flex' : 'hidden'}`}
          >
            <div className="border-b border-border/50 pb-4 mb-2">
                <h2 className="text-xl font-bold text-foreground">Access Control & Security</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage role-based access and system integrity.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-border bg-background rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <h4 className="font-bold text-sm">Role-Based Access</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded">Enforced</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Strict separation between Admin and Driver roles is currently active.</p>
                    <button onClick={() => toast.info("Opening RBAC Matrix")} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Manage Roles &rarr;</button>
                </div>

                <div className="p-5 border border-border bg-background rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <h4 className="font-bold text-sm">Security Audit</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-background border border-border rounded">2 Days Ago</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">System integrity verified. No unauthorized login attempts detected.</p>
                    <button onClick={() => toast.success("Audit Initiated")} className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Run Scan Now &rarr;</button>
                </div>
            </div>
          </motion.div>

          {/* API Integrations */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`glass-panel p-8 rounded-2xl border border-border flex-col gap-6 ${activeTab === 'api' ? 'flex' : 'hidden'}`}
          >
            <div className="border-b border-border/50 pb-4 mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Key className="h-5 w-5" /> API & Webhooks</h2>
                <p className="text-sm text-muted-foreground mt-1">Connect WashAI to external ERPs, marketing tools, or delivery platforms.</p>
            </div>
            
            <div className="space-y-4">
                <div className="p-4 border border-border bg-background rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-sm">Production API Key</h4>
                        <p className="text-xs text-muted-foreground font-mono mt-1">pk_live_8f92j...49xk</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => toast("Copied to clipboard")} className="px-3 py-1.5 bg-muted text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-muted/80">Copy</button>
                        <button onClick={() => toast.error("Key Revoked")} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-rose-500/20">Revoke</button>
                    </div>
                </div>

                <div className="p-4 border border-border bg-background rounded-xl flex items-center justify-between opacity-50">
                    <div>
                        <h4 className="font-bold text-sm">Staging API Key</h4>
                        <p className="text-xs text-muted-foreground mt-1">No active key</p>
                    </div>
                    <button className="px-3 py-1.5 border border-border text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-muted">Generate</button>
                </div>

                <button className="w-full mt-4 py-3 border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="h-3 w-3" /> Add Webhook Endpoint
                </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
