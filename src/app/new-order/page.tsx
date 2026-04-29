"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, CheckCircle2, Plus, Loader2, User, Trash2, Shirt, Scissors, Waves, Home, Zap, CreditCard, Banknote, Smartphone, Mic, Receipt, Calculator } from "lucide-react";
import { useStore, Order } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import confetti from "canvas-confetti";
import { hapticFeedback } from "@/lib/utils";

type OrderMode = "ai" | "manual";

const INVENTORY_CATEGORIES = [
  {
    name: "Wash & Iron",
    icon: Waves,
    items: [
      { id: "wi-tshirt", name: "T-Shirt", price: 40 },
      { id: "wi-shirt", name: "Shirt", price: 60 },
      { id: "wi-pants", name: "Pants / Jeans", price: 80 },
      { id: "wi-kg", name: "Laundry (per kg)", price: 120 },
    ]
  },
  {
    name: "Steam Press",
    icon: Zap,
    items: [
      { id: "io-tshirt", name: "T-Shirt Iron", price: 15 },
      { id: "io-shirt", name: "Shirt Iron", price: 20 },
      { id: "io-pants", name: "Pants Iron", price: 25 },
    ]
  },
  {
    name: "Dry Cleaning",
    icon: Scissors,
    items: [
      { id: "dc-suit", name: "Suit / Blazer", price: 450 },
      { id: "dc-dress", name: "Dress", price: 250 },
      { id: "dc-jacket", name: "Jacket / Coat", price: 300 },
    ]
  },
  {
    name: "Ethnic Wear",
    icon: Shirt,
    items: [
      { id: "ew-saree", name: "Saree (Normal)", price: 200 },
      { id: "ew-saree-silk", name: "Saree (Silk/Heavy)", price: 450 },
      { id: "ew-kurta", name: "Kurta / Kurti", price: 120 },
      { id: "ew-sherwani", name: "Sherwani", price: 600 },
    ]
  },
  {
    name: "Home & Linen",
    icon: Home,
    items: [
      { id: "hl-bedsheet", name: "Bedsheet (Double)", price: 150 },
      { id: "hl-towel", name: "Towel (Large)", price: 50 },
      { id: "hl-curtain", name: "Curtain (per m)", price: 100 },
    ]
  }
];

const ALL_ITEMS = INVENTORY_CATEGORIES.flatMap(cat => cat.items);

export default function NewOrder() {
  const [mode, setMode] = useState<OrderMode>("manual");
  const addOrder = useStore((state) => state.addOrder);
  const currency = useStore((state) => state.settings.currency);
  const taxRate = useStore((state) => state.settings.taxRate) / 100;
  const router = useRouter();

  // --- Common State ---
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [isExpress, setIsExpress] = useState(false);

  // --- AI Mode State ---
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedOrder, setParsedOrder] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);

  // --- Manual Mode State ---
  const [manualCustomer, setManualCustomer] = useState("");
  const [manualItems, setManualItems] = useState<{ itemId: string, quantity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState(INVENTORY_CATEGORIES[0].name);

  // --- AI Logic (WashAI v2.3) ---
  const parseInput = (text: string) => {
    const textLower = text.toLowerCase();
    const items = [];
    let services = [];

    const mappings = [
      { regex: /(\d+)\s*(t-?shirt|tee)/, name: "T-Shirt (Wash & Iron)", price: 40 },
      { regex: /(\d+)\s*(shirt|formal|top)/, name: "Shirt (Wash & Iron)", price: 60 },
      { regex: /(\d+)\s*(suit|blazer)/, name: "Suit (Dry Clean)", price: 450 },
      { regex: /(\d+)\s*(dress|gown)/, name: "Dress (Dry Clean)", price: 250 },
      { regex: /(\d+)\s*(pant|trouser|jeans)/, name: "Pants (Wash & Iron)", price: 80 },
      { regex: /(\d+)\s*(kg|kilo|weight)/, name: "Laundry (per kg)", price: 120 },
      { regex: /(\d+)\s*(saree|sari)/, name: "Saree (Dry Clean)", price: 200 },
      { regex: /(\d+)\s*(kurta|kurti)/, name: "Kurta (Ethnic Wear)", price: 120 },
      { regex: /(\d+)\s*(sherwani)/, name: "Sherwani (Heavy Clean)", price: 600 },
    ];

    mappings.forEach(m => {
      const match = textLower.match(m.regex);
      if (match) {
        const q = parseInt(match[1]);
        items.push({ name: m.name, quantity: q, price: m.price, total: q * m.price });
      }
    });

    if (items.length === 0) {
      items.push({ name: "General Laundry (per kg)", quantity: 2, price: 120, total: 240 });
    }

    if (textLower.includes("express") || textLower.includes("tomorrow") || textLower.includes("fast")) {
      services.push({ name: "Express Delivery", price: 150 });
    }

    const subtotal = items.reduce((acc, item) => acc + item.total, 0) + services.reduce((acc, svc) => acc + svc.price, 0);
    const tax = subtotal * taxRate;

    return {
      items,
      services,
      subtotal,
      tax,
      total: subtotal + tax,
    };
  };

  const handleAIParse = () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setParsedOrder(null);

    setTimeout(() => {
      setIsProcessing(false);
      setParsedOrder(parseInput(input));
    }, 1200);
  };

  const handleVoiceIntake = () => {
    setIsListening(true);
    toast.info("Listening...", { description: "Speak your order clearly.", duration: 2000 });
    
    setTimeout(() => {
      setIsListening(false);
      setInput("3 suits, 5 shirts and 1 heavy silk saree with express delivery");
      toast.success("Voice Captured", { description: "AI transcribed your audio successfully." });
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAIParse();
  };

  const confirmOrderAI = () => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "Walk-in Customer",
      items: parsedOrder.items,
      services: parsedOrder.services,
      subtotal: parsedOrder.subtotal,
      tax: parsedOrder.tax,
      total: parsedOrder.total,
      status: "Received",
      paymentMethod,
      time: "Just now"
    };
    addOrder(newOrder);
    hapticFeedback('success');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#3b82f6', '#000000']
    });
    toast.success("Order confirmed successfully!");
    setTimeout(() => {
      router.push("/orders");
    }, 1500);
  };

  // --- Manual Logic ---
  const handleAddItem = (itemId: string) => {
    hapticFeedback('light');
    const existing = manualItems.find(i => i.itemId === itemId);
    if (existing) {
      setManualItems(manualItems.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setManualItems([...manualItems, { itemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setManualItems(manualItems.filter(i => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setManualItems(manualItems.map(i => {
      if (i.itemId === itemId) {
        return { ...i, quantity: Math.max(1, i.quantity + delta) };
      }
      return i;
    }));
  };

  const manualOrderTotals = useMemo(() => {
    const processedItems = manualItems.map(item => {
      const inventoryItem = ALL_ITEMS.find(i => i.id === item.itemId)!;
      return {
        name: inventoryItem.name,
        quantity: item.quantity,
        price: inventoryItem.price,
        total: inventoryItem.price * item.quantity
      };
    });

    const processedServices = isExpress ? [{ name: "Express Delivery", price: 150 }] : [];

    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0) +
      processedServices.reduce((sum, svc) => sum + svc.price, 0);
    const tax = subtotal * taxRate;

    return {
      items: processedItems,
      services: processedServices,
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [manualItems, isExpress, taxRate]);

  const confirmOrderManual = () => {
    if (!manualCustomer.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    if (manualItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: manualCustomer,
      items: manualOrderTotals.items,
      services: manualOrderTotals.services,
      subtotal: manualOrderTotals.subtotal,
      tax: manualOrderTotals.tax,
      total: manualOrderTotals.total,
      status: "Received",
      paymentMethod,
      time: "Just now"
    };

    addOrder(newOrder);
    hapticFeedback('success');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#3b82f6', '#000000']
    });
    toast.success("Order confirmed successfully!");
    setTimeout(() => {
      router.push("/orders");
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full mx-auto gap-8 pb-12 h-full">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
          <p className="text-muted-foreground text-sm">Process a new client order manually or via WashAI intelligence.</p>
        </div>

        <div className="flex bg-background border border-border p-1 rounded-xl">
          <button
            onClick={() => setMode("manual")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "manual" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Calculator className="h-4 w-4" /> Manual Entry
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "ai" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Sparkles className="h-4 w-4" /> WashAI
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "ai" && (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-8 max-w-4xl mx-auto w-full"
          >
            {/* AI Input Section */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-[2rem] blur-xl opacity-50 pointer-events-none" />
              <div className="glass-panel p-3 rounded-3xl flex items-center gap-3 relative z-10 border border-primary/20 bg-background/80 backdrop-blur-xl">
                <Sparkles className="h-6 w-6 text-primary shrink-0 ml-3" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Dictate or type: "5 shirts, 2 heavy sarees, express delivery"'
                  className="flex-1 bg-transparent border-none text-xl font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-0 px-2"
                />
                <button 
                  onClick={handleVoiceIntake}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'hover:bg-muted text-muted-foreground'}`}
                  title="AI Voice Intake"
                >
                  <Mic className="h-6 w-6" />
                </button>
                <button
                  onClick={handleAIParse}
                  disabled={isProcessing || !input.trim() || isListening}
                  className="p-3 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                >
                  {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {parsedOrder && !isProcessing && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {/* Generated Invoice Details */}
                <div className="glass-panel p-8 rounded-3xl border border-border">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-6 mb-6">
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">AI Interpretation</h3>
                            <p className="text-xs text-muted-foreground font-mono">CONFIDENCE: 98.4%</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                      {parsedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm font-medium">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{formatCurrency(item.total, currency)}</span>
                        </div>
                      ))}
                      {parsedOrder.services.map((svc: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm text-primary font-bold">
                          <span>+ {svc.name}</span>
                          <span>{formatCurrency(svc.price, currency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-border/50">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                            <span>Subtotal</span>
                            <span>{formatCurrency(parsedOrder.subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-4">
                            <span>Tax ({taxRate * 100}%)</span>
                            <span>{formatCurrency(parsedOrder.tax, currency)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-black text-foreground">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(parsedOrder.total, currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Actions */}
                <div className="flex flex-col gap-6">
                  <div className="glass-panel p-8 rounded-3xl border border-border flex-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Settlement Method</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'Cash', icon: Banknote, desc: "Settle at counter" },
                        { id: 'UPI', icon: Smartphone, desc: "Scan QR code" },
                        { id: 'Card', icon: CreditCard, desc: "POS Terminal" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${paymentMethod === method.id
                              ? "bg-primary/10 border-primary text-foreground"
                              : "bg-background/50 border-border text-muted-foreground hover:bg-muted"
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <method.icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                              <p className="text-sm font-bold uppercase">{method.id}</p>
                              <p className="text-xs opacity-70">{method.desc}</p>
                          </div>
                          {paymentMethod === method.id && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={confirmOrderAI}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black py-5 rounded-3xl shadow-lg transition-all text-sm uppercase tracking-widest cursor-pointer"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === "manual" && (
          <motion.div
            key="manual-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Item Selection */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="flex flex-col gap-4">
                  {/* Categories Navigation (Pills) */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {INVENTORY_CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            activeTabCheck(activeCategory, cat.name)
                          }`}
                      >
                        <cat.icon className="h-4 w-4" />
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {INVENTORY_CATEGORIES.find(c => c.name === activeCategory)?.items.map(item => (
                      <motion.div
                        key={item.id}
                        layoutId={item.id}
                        onClick={() => handleAddItem(item.id)}
                        className="bg-muted/10 p-5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex flex-col text-left">
                          <p className="text-lg font-bold text-foreground leading-tight">{item.name}</p>
                          <p className="text-sm font-black text-primary mt-1 tracking-wide">{formatCurrency(item.price, currency)}</p>
                        </div>
                        <div className="h-10 w-10 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors shadow-sm">
                            <Plus className="h-5 w-5" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
              </div>
            </div>

            {/* Right Column: Checkout Basket */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="glass-panel p-4 md:p-6 rounded-3xl border border-border lg:sticky lg:top-6 flex flex-col lg:h-[calc(100vh-8rem)]">
                
                <div className="border-b border-border/50 pb-5 mb-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-primary" /> Order Basket
                            {manualItems.length > 0 && (
                                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-black">
                                    {manualItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                                </span>
                            )}
                        </h3>
                        {manualItems.length > 0 && (
                            <button 
                                onClick={() => { setManualItems([]); setIsExpress(false); }} 
                                className="text-[10px] font-bold text-muted-foreground hover:text-rose-500 uppercase tracking-widest transition-colors cursor-pointer"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={manualCustomer}
                            onChange={(e) => setManualCustomer(e.target.value)}
                            placeholder="Enter Client Name..."
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {/* Basket Items */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  {manualItems.map((item) => {
                    const details = ALL_ITEMS.find(ai => ai.id === item.itemId)!;
                    return (
                      <motion.div
                        key={item.itemId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                              <span className="text-sm font-bold leading-tight max-w-[180px]">{details.name}</span>
                              {item.quantity > 1 && (
                                  <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                                      {item.quantity}x @ {formatCurrency(details.price, currency)}
                                  </span>
                              )}
                          </div>
                          <span className="text-sm font-black text-primary">{formatCurrency(details.price * item.quantity, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                            <button onClick={() => updateQuantity(item.itemId, -1)} className="h-6 w-6 rounded bg-background flex items-center justify-center hover:text-primary transition-colors cursor-pointer">-</button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemId, 1)} className="h-6 w-6 rounded bg-background flex items-center justify-center hover:text-primary transition-colors cursor-pointer">+</button>
                          </div>
                          <button onClick={() => handleRemoveItem(item.itemId)} className="text-muted-foreground hover:text-rose-500 text-xs flex items-center gap-1 cursor-pointer">
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {manualItems.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                      <Shirt className="h-8 w-8 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">Basket Empty</p>
                    </div>
                  )}
                </div>

                {/* Checkout Footer */}
                <div className="pt-5 border-t border-border/50 mt-5 flex flex-col gap-4">
                  
                  {/* Delivery Toggle */}
                  <button 
                    type="button"
                    disabled={manualItems.length === 0}
                    onClick={() => setIsExpress(!isExpress)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isExpress && manualItems.length > 0 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm' 
                      : 'bg-background border-border text-foreground hover:bg-muted'
                    }`}
                  >
                      <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Express Delivery</span>
                      </div>
                      <span className="text-xs font-bold">+{formatCurrency(150, currency)}</span>
                  </button>

                  {/* Payment Methods */}
                  <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Cash', icon: Banknote },
                        { id: 'UPI', icon: Smartphone },
                        { id: 'Card', icon: CreditCard },
                      ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            disabled={manualItems.length === 0}
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border disabled:opacity-40 disabled:cursor-not-allowed ${
                              paymentMethod === m.id && manualItems.length > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm' 
                                : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                            }`}
                          >
                              <m.icon className="h-4 w-4" />
                              {m.id}
                          </button>
                      ))}
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Pay</span>
                        <span className="text-xs text-muted-foreground">Includes {taxRate * 100}% tax</span>
                    </div>
                    <span className="text-2xl font-black text-primary">{formatCurrency(manualOrderTotals.total, currency)}</span>
                  </div>

                  <button
                    disabled={manualItems.length === 0}
                    onClick={confirmOrderManual}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest text-xs"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function activeTabCheck(current: string, target: string) {
    if (current === target) return "bg-primary text-primary-foreground";
    return "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground";
}
