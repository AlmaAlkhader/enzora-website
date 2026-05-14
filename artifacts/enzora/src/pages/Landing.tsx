import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrderBody } from "@workspace/api-zod";
import { useCreateOrder } from "@workspace/api-client-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SocialIcons } from "@/components/SocialIcons";
import {
  Menu, X, Activity, Smartphone, Clock, Bell, Circle, CheckCircle2,
  Navigation, Heart, Shield, ShieldCheck, Wifi, Eye, BellRing, LineChart,
  Sparkles, ArrowRight, Package
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const Section = ({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) => (
  <motion.section
    id={id}
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.15 }}
    variants={stagger}
  >
    {children}
  </motion.section>
);

const productOptions = [
  {
    id: "bandage",
    title: "Enzora Bandage",
    price: "$4",
    subtitle: "Single bandage",
    description:
      "A color-guided wound-care bandage for simple visual monitoring at home.",
    features: [
      "Affordable single bandage",
      "Color-based visual guidance",
      "Easy for patients and caregivers",
      "No device required",
    ],
    cta: "Buy Bandage",
    highlight: false,
  },
  {
    id: "device",
    title: "Enzora Smart Device",
    price: "Contact us",
    subtitle: "Device sold separately",
    description:
      "A compact smart sensor device that reads Enzora bandage color changes and connects to the mobile app.",
    features: [
      "Sensor-based color reading",
      "WiFi connection",
      "Mobile app updates",
      "Caregiver-friendly monitoring",
      "Works with Enzora bandages",
    ],
    cta: "Order Device",
    highlight: false,
  },
  {
    id: "kit",
    title: "Complete Enzora Package",
    price: "Contact us",
    subtitle: "Device + bandage",
    description:
      "The full Enzora monitoring experience, combining the smart sensor device with Enzora bandages.",
    features: [
      "Smart sensor device",
      "Enzora bandage included",
      "App status updates",
      "Best for continuous home monitoring",
      "Recommended option",
    ],
    cta: "Get Complete Package",
    highlight: true,
  },
];

const appScreens = [
  { src: `${import.meta.env.BASE_URL}app-screen-1.jpg`, label: "Home status screen" },
  { src: `${import.meta.env.BASE_URL}app-screen-2.png`, label: "Color guide screen" },
  { src: `${import.meta.env.BASE_URL}app-screen-3.png`, label: "Healing progress & alerts" },
];

const LOGO_SRC = `${import.meta.env.BASE_URL}enzora-logo.png`;

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSuccessRef, setOrderSuccessRef] = useState<string | null>(null);

  const orderMutation = useCreateOrder();

  const form = useForm({
    resolver: zodResolver(CreateOrderBody),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      customerType: "patient" as any,
      productSelection: "kit" as any,
      quantity: 1,
      message: "",
    },
  });

  const selectedProduct = form.watch("productSelection");

  const onSubmit = (data: any) => {
    orderMutation.mutate({ data }, {
      onSuccess: (res) => {
        setOrderSuccessRef(res.reference);
        form.reset();
      },
    });
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const selectProduct = (id: string) => {
    form.setValue("productSelection", id as any);
    scrollTo("order");
  };

  const productPriceHint = selectedProduct === "bandage"
    ? "$4 per bandage. Final total will be confirmed by our team."
    : "Our team will contact you with pricing and availability.";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-accent/15 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-300/20 blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_0_rgba(17,31,79,0.04)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-3 group" aria-label="Enzora home">
            <img src={LOGO_SRC} alt="Enzora" className="h-12 w-auto transition-transform duration-500 group-hover:scale-105" />
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            <button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors">Products</button>
            <button onClick={() => scrollTo("how-it-works")} className="hover:text-primary transition-colors">How It Works</button>
            <button onClick={() => scrollTo("why-device")} className="hover:text-primary transition-colors">Why Device</button>
            <button onClick={() => scrollTo("app")} className="hover:text-primary transition-colors">App</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-primary transition-colors">FAQ</button>
            <Button onClick={() => scrollTo("order")} className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              Order Now
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col gap-3">
            <button onClick={() => scrollTo("products")} className="text-left font-medium p-2">Products</button>
            <button onClick={() => scrollTo("how-it-works")} className="text-left font-medium p-2">How It Works</button>
            <button onClick={() => scrollTo("why-device")} className="text-left font-medium p-2">Why Device</button>
            <button onClick={() => scrollTo("app")} className="text-left font-medium p-2">App</button>
            <button onClick={() => scrollTo("faq")} className="text-left font-medium p-2">FAQ</button>
            <Button onClick={() => scrollTo("order")} className="w-full">Order Now</Button>
            <div className="pt-3 mt-1 border-t border-primary/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-2">Follow Enzora</p>
              <div className="px-2">
                <SocialIcons variant="onLight" size="md" />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero */}
      <Section id="hero" className="pt-16 pb-28 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div className="space-y-8 max-w-2xl" variants={fadeUp}>
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Smart wound monitoring
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.05] tracking-tight">
            Smarter wound monitoring with a{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
              color-guided bandage
            </span>{" "}
            and connected device.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
            Enzora combines a color-guided wound bandage with an optional smart sensor device. The bandage supports simple visual monitoring, while the device reads color changes and sends updates to the mobile app for clearer home wound-care awareness.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full px-7 text-base h-12 shadow-md shadow-primary/25 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30 transition-all"
              onClick={() => selectProduct("bandage")}
            >
              Buy Bandage
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 text-base h-12 border-2 hover:translate-y-[-2px] transition-all"
              onClick={() => selectProduct("device")}
            >
              Order Device
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full px-6 text-base h-12 hover:bg-primary/5"
              onClick={() => scrollTo("how-it-works")}
            >
              See How It Works <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-6 pt-8 border-t border-primary/10">
            <div>
              <div className="font-semibold text-foreground">Compact Device</div>
              <div className="text-sm text-muted-foreground">6 × 3 × 2 cm</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Wireless Sync</div>
              <div className="text-sm text-muted-foreground">WiFi</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Continuous Insight</div>
              <div className="text-sm text-muted-foreground">24/7</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right hero composition */}
        <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-md">
          <motion.div
            className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/10 via-indigo-200/40 to-accent/20 blur-2xl"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-white via-secondary/60 to-blue-50 rounded-[2rem] p-8 flex items-center justify-center border border-white shadow-2xl">
            {/* Watermark logo */}
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute top-6 left-6 h-8 opacity-30" />

            {/* Phone Mockup */}
            <motion.div
              className="w-[280px] h-[580px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-2xl w-32 mx-auto z-10"></div>
              <div className="bg-primary px-6 pt-16 pb-8 text-white relative">
                <div className="text-sm opacity-80 mb-1">Status</div>
                <div className="text-2xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-accent" /> Normal
                </div>
              </div>
              <div className="flex-1 bg-gray-50 p-6 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Device</span>
                    <span className="text-primary font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent"></span> Connected
                    </span>
                  </div>
                  <div className="w-full h-px bg-gray-100"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Wound Status</span>
                    <span className="font-medium text-foreground">Normal</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Last reading</span>
                    <span className="font-medium text-foreground">Just updated</span>
                  </div>
                </div>
                <div className="mx-auto w-32 h-32 rounded-full border-4 border-accent/20 flex items-center justify-center relative mt-8">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-accent/20 absolute"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-16 h-16 rounded-full bg-accent shadow-[0_0_30px_rgba(25,200,154,0.6)]"
                    animate={{ boxShadow: [
                      "0 0 20px rgba(25,200,154,0.4)",
                      "0 0 40px rgba(25,200,154,0.7)",
                      "0 0 20px rgba(25,200,154,0.4)",
                    ] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Device Mockup */}
            <motion.div
              className="absolute -bottom-6 -right-4 w-48 h-24 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center p-4 gap-4 z-20"
              initial={{ rotate: 8 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(25,200,154,0.9)]"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <div>
                <div className="text-sm font-bold text-primary">Enzora Sensor</div>
                <div className="text-xs text-muted-foreground">Syncing...</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* 3. Product Options */}
      <Section id="products" className="py-24 bg-white border-y border-primary/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Choose your Enzora package</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Bandages alone for simple visual monitoring, or add the smart device for app-connected awareness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {productOptions.map((p) => (
              <motion.div
                key={p.id}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
                className={`relative rounded-3xl p-8 border flex flex-col ${
                  p.highlight
                    ? "bg-gradient-to-br from-primary to-indigo-700 text-white border-primary shadow-2xl shadow-primary/25 md:scale-[1.03]"
                    : "bg-white text-foreground border-primary/10 shadow-lg hover:shadow-xl"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 right-6 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Recommended
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  p.highlight ? "bg-white/15" : "bg-primary/10 text-primary"
                }`}>
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{p.title}</h3>
                <div className={`text-sm mb-5 ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                  {p.subtitle}
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${p.highlight ? "text-white/85" : "text-muted-foreground"}`}>
                  {p.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${p.highlight ? "text-accent" : "text-accent"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  variant={p.highlight ? "secondary" : "default"}
                  className={`rounded-full w-full h-12 ${p.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
                  onClick={() => selectProduct(p.id)}
                >
                  {p.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4. Problem */}
      <Section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Why home wound monitoring needs to be simpler</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Late visual changes can be missed", desc: "Subtle color shifts are easy to overlook between dressing changes." },
              { icon: Heart, title: "Patients may feel unsure", desc: "Knowing what 'normal' looks like at home can be stressful during recovery." },
              { icon: Navigation, title: "Caregivers need clearer signals", desc: "Family and clinicians benefit from consistent, shared status updates." },
            ].map((c, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="p-8 rounded-2xl bg-white border border-primary/10 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <c.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. How It Works — two paths */}
      <Section id="how-it-works" className="py-24 bg-white border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">How Enzora works</h2>
            <p className="text-muted-foreground mt-3">Two ways to monitor — choose what fits your needs.</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Path A */}
            <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="p-8 rounded-3xl border border-primary/10 bg-gradient-to-br from-secondary/40 to-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">A</div>
                <h3 className="text-xl font-semibold">Bandage only</h3>
              </div>
              <ol className="space-y-5">
                {[
                  "Apply the Enzora bandage to the wound area.",
                  "Watch the bandage color indicator over time.",
                  "Seek medical advice if concerning changes appear.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-primary/20 text-primary flex items-center justify-center font-semibold shrink-0">{i + 1}</div>
                    <div className="pt-1 text-foreground/85">{step}</div>
                  </li>
                ))}
              </ol>
            </motion.div>
            {/* Path B */}
            <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="p-8 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary to-indigo-700 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center font-bold">B</div>
                <h3 className="text-xl font-semibold">Bandage + Smart Device</h3>
              </div>
              <ol className="space-y-5 relative">
                {[
                  "Apply the Enzora bandage to the wound area.",
                  "Place the smart device above the bandage.",
                  "The device reads bandage color changes consistently.",
                  "The mobile app shows status updates and alerts.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-semibold shrink-0">{i + 1}</div>
                    <div className="pt-1 text-white/95">{step}</div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* 6. Why the Device Helps */}
      <Section id="why-device" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Why add the Enzora device?</h2>
            <p className="text-muted-foreground mt-3">
              The device makes the monitoring process smarter and easier — supporting early awareness without replacing professional medical advice.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: "More consistent readings", desc: "Sensor-based color reading is less variable than manual checking." },
              { icon: BellRing, title: "Easier for caregivers", desc: "Family members can stay informed without being next to the patient." },
              { icon: Smartphone, title: "App-based status updates", desc: "Clear status views and notifications in the Enzora mobile app." },
              { icon: LineChart, title: "Better tracking over time", desc: "Color trends are recorded and viewable across the recovery period." },
              { icon: Shield, title: "Less uncertainty during recovery", desc: "Reduces guesswork and supports knowing when to seek advice." },
              { icon: Wifi, title: "Quiet, connected monitoring", desc: "WiFi sync keeps updates flowing without extra effort." },
            ].map((c, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="p-6 rounded-2xl bg-white border border-primary/10 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 7. App Preview */}
      <Section id="app" className="py-24 bg-gradient-to-b from-secondary/40 via-white to-secondary/40 border-y border-primary/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Designed to work with the Enzora mobile app</h2>
            <p className="text-muted-foreground mt-3">A clear, calm view of bandage status, color guidance, and healing progress.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {appScreens.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className={`relative ${i === 1 ? "md:translate-y-6" : ""}`}
              >
                <div className="relative w-full max-w-[260px] mx-auto">
                  <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 to-accent/20 blur-xl opacity-70" />
                  <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-900 rounded-b-xl z-10" />
                    <img
                      src={s.src}
                      alt={s.label}
                      loading="lazy"
                      className="w-full h-[540px] object-cover rounded-[2rem] bg-white"
                    />
                  </div>
                </div>
                <div className="text-center mt-5 text-sm font-medium text-foreground/80">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 8. Color Guide */}
      <Section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Simple color-based guidance</h2>
            <p className="text-muted-foreground text-lg">The bandage and app translate color changes into simple visual indicators.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { color: "bg-yellow-400", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-900", title: "Yellow", label: "Normal monitoring" },
              { color: "bg-green-500", bg: "bg-green-50", border: "border-green-200", text: "text-green-900", title: "Green", label: "Watch carefully" },
              { color: "bg-blue-600", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", title: "Blue", label: "Contact a doctor" },
            ].map((c, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className={`p-8 rounded-3xl ${c.bg} border ${c.border} text-center`}>
                <motion.div
                  className={`w-20 h-20 rounded-full ${c.color} mx-auto mb-6 shadow-md border-4 border-white`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <h3 className={`text-2xl font-bold ${c.text} mb-1`}>{c.title}</h3>
                <p className={`${c.text} font-medium opacity-90`}>{c.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="text-center text-sm text-muted-foreground px-6 py-4 bg-white border border-primary/10 rounded-xl shadow-sm">
            <strong>Note:</strong> These color indicators are supportive guidance and do not replace professional diagnosis.
            Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment.
          </motion.div>
        </div>
      </Section>

      {/* 9. Product Showcase */}
      <Section className="py-24 bg-white border-y border-primary/10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-secondary/40 to-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-primary/10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight tracking-tight">Smart wound-monitoring device</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Color Sensor", "WiFi Sync", "App Alerts", "Reusable"].map((t) => (
                  <span key={t} className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">{t}</span>
                ))}
              </div>
              <ul className="space-y-3">
                {[
                  "Device size 6 × 3 × 2 cm",
                  "WiFi connection",
                  "Color sensor monitoring",
                  "Mobile app synchronization",
                  "Reusable device design",
                  "Simple patient-friendly interface",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative bg-gray-50/80 rounded-[2rem] aspect-square flex items-center justify-center p-8 border border-primary/10 overflow-hidden">
              <img src={LOGO_SRC} alt="" aria-hidden className="absolute top-6 right-6 h-8 opacity-25" />
              <motion.div
                className="w-full max-w-[280px] h-40 bg-white rounded-3xl shadow-2xl border flex items-center justify-between px-8 relative"
                whileHover={{ scale: 1.05 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-6 h-6 rounded-full bg-accent shadow-[0_0_20px_rgba(25,200,154,0.7)]"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <div className="space-y-2 text-right">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full ml-auto" />
                  <div className="w-10 h-1.5 bg-gray-200 rounded-full ml-auto" />
                  <div className="w-14 h-1.5 bg-gray-200 rounded-full ml-auto" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 10. Who It Helps */}
      <Section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12 tracking-tight">Who it helps</motion.h2>
          <motion.div variants={stagger} className="flex flex-wrap justify-center gap-3">
            {["Diabetic patients", "Post-surgery patients", "Elderly patients", "Caregivers", "Clinics and hospitals"].map((who) => (
              <motion.div
                key={who}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                className="px-7 py-4 bg-white rounded-2xl border border-primary/10 font-medium text-base text-foreground/90 shadow-sm"
              >
                {who}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* 11. Order Form */}
      <Section id="order" className="py-24 bg-gradient-to-br from-primary via-indigo-700 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)]" />
        <img src={LOGO_SRC} alt="" aria-hidden className="absolute right-6 top-6 h-10 opacity-20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">Order Enzora</h2>
            <p className="text-primary-foreground/85 text-lg">Choose your package and our team will follow up shortly.</p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Connect with us</p>
              <SocialIcons variant="onDark" size="sm" className="justify-center" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white text-foreground p-8 md:p-12 rounded-[2rem] shadow-2xl">
            {orderSuccessRef ? (
              <div className="text-center py-12 space-y-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h3 className="text-3xl font-bold">Request Submitted</h3>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Your Enzora order request was submitted successfully. Our team will contact you soon.
                </p>
                <div className="inline-block bg-gray-50 border px-6 py-3 rounded-xl font-mono font-medium text-base mt-2">
                  Ref: {orderSuccessRef}
                </div>
                <div className="pt-6">
                  <Button variant="outline" size="lg" className="rounded-full" onClick={() => setOrderSuccessRef(null)}>
                    Submit another request
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl><Input placeholder="Jane Doe" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="jane@example.com" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl><Input type="tel" placeholder="+1 (555) 000-0000" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country / City</FormLabel>
                        <FormControl><Input placeholder="United States, NY" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="productSelection" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bandage">Enzora Bandage — $4</SelectItem>
                            <SelectItem value="device">Enzora Smart Device — Contact us for pricing</SelectItem>
                            <SelectItem value="kit">Complete Enzora Kit — Device + bandage</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{productPriceHint}</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} className="h-12" {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">Bandages are sold individually at $4 each.</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="customerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="caregiver">Caregiver</SelectItem>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="research">Research institution</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional information..." className="resize-none h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-full mt-2 shadow-lg shadow-primary/20" disabled={orderMutation.isPending}>
                    {orderMutation.isPending ? "Submitting..." : "Submit Order Request"}
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>
        </div>
      </Section>

      {/* 12. FAQ */}
      <Section id="faq" className="py-24 bg-white border-t border-primary/10">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12 tracking-tight">Frequently asked questions</motion.h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "Is Enzora a replacement for a doctor?", a: "No. Enzora is a monitoring support tool designed to help you stay aware of visual changes. It does not replace professional medical advice, diagnosis, or treatment." },
              { q: "Can I buy only the bandage?", a: "Yes. The Enzora bandage is $4 each and can be used on its own for simple visual color-based monitoring." },
              { q: "What does the smart device add?", a: "The device reads bandage color more consistently than manual checking, tracks changes, and sends updates to the Enzora mobile app." },
              { q: "How does the device connect to the app?", a: "The device uses a standard WiFi connection to securely sync data to your Enzora mobile app." },
              { q: "What do the colors mean?", a: "Yellow indicates normal monitoring. Green suggests you should watch the area carefully. Blue is a signal to contact a doctor. These are supportive guides only." },
              { q: "Can caregivers use it?", a: "Yes. Caregivers can install the app and receive updates, making it easier to support family members or patients during recovery." },
              { q: "Is the device reusable?", a: "Yes. The Enzora device is designed to be reusable. It sits above the wound bandage, keeping the bandage clean and ready for continued use." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <AccordionItem value={`item-${i}`} className="border border-primary/10 px-6 rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-5">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">{f.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* 13. Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
        <img src={LOGO_SRC} alt="" aria-hidden className="absolute -right-16 -bottom-16 h-72 opacity-[0.04]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src={LOGO_SRC} alt="Enzora" className="h-10 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Smarter wound monitoring with a color-guided bandage and connected device — bringing clarity and calm to recovery at home.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><button onClick={() => scrollTo("products")} className="hover:text-white transition-colors">Products</button></li>
                <li><button onClick={() => scrollTo("how-it-works")} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollTo("app")} className="hover:text-white transition-colors">App</button></li>
                <li><button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">FAQ</button></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="mailto:hello@enzora.health" className="hover:text-white transition-colors">hello@enzora.health</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Follow Enzora</h4>
              <SocialIcons variant="onDark" size="md" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm text-center md:text-left max-w-3xl leading-relaxed">
              Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider.
            </p>
            <p className="text-gray-500 text-sm whitespace-nowrap">
              &copy; {new Date().getFullYear()} Enzora.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
