import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrderBody } from "@workspace/api-zod";
import { useCreateOrder, type CreateOrderInput, ProductSelection } from "@workspace/api-client-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SocialIcons } from "@/components/SocialIcons";
import { WaveBackground } from "@/components/WaveBackground";
import {
  Menu, X, CheckCircle2, Heart, Shield, ShieldCheck,
  Sparkles, ArrowRight, Package, Smartphone, Building2, Lock, Mail
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

type ProductOption = {
  id: ProductSelection;
  title: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

const productOptions: ProductOption[] = [
  {
    id: "bandage_pack",
    title: "Enzora Bandage Pack",
    price: "$20",
    subtitle: "5 bandages — $4 per bandage",
    description: "For simple visual color-guided monitoring at home.",
    features: [
      "5 bandages per pack",
      "$4 per bandage",
      "Color-based visual guidance",
      "No device required",
    ],
    cta: "Buy Bandage Pack",
    highlight: false,
  },
  {
    id: "smart_device",
    title: "Enzora Smart Device",
    price: "Contact us for pricing",
    subtitle: "Sold separately",
    description: "Reads Enzora bandage color changes and connects to the mobile app.",
    features: [
      "Sensor-based color reading",
      "Connects to Enzora mobile app",
      "Caregiver-friendly monitoring",
      "Works with Enzora bandages",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
  {
    id: "complete_package",
    title: "Complete Enzora Package",
    price: "Contact us for pricing",
    subtitle: "Device + bandage pack",
    description: "Full Enzora monitoring experience.",
    features: [
      "Smart sensor device",
      "Bandage pack included (5 bandages)",
      "App status updates",
      "Best for continuous home monitoring",
    ],
    cta: "Get Complete Package",
    highlight: true,
  },
];

const appScreens = [
  {
    src: `${import.meta.env.BASE_URL}app-screen-normal.svg`,
    label: "Healing well",
    caption: "Real-time wound status at a glance",
  },
  {
    src: `${import.meta.env.BASE_URL}app-screen-watch.svg`,
    label: "Watch closely",
    caption: "Clear visual color reference",
  },
  {
    src: `${import.meta.env.BASE_URL}app-screen-infection.svg`,
    label: "Infection alert",
    caption: "Track changes and stay informed",
  },
];

const LOGO_SRC = `${import.meta.env.BASE_URL}enzora-logo.png`;

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSuccessRef, setOrderSuccessRef] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const orderMutation = useCreateOrder();

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(CreateOrderBody),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      countryCity: "",
      customerType: "patient",
      productSelection: ProductSelection.complete_package,
      quantity: 1,
      message: "",
    },
  });

  const selectedProduct = form.watch("productSelection");

  const onSubmit = (data: CreateOrderInput) => {
    orderMutation.mutate({ data }, {
      onSuccess: (res) => {
        setOrderSuccessRef(res.orderReference);
        form.reset();
      },
    });
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const selectProduct = (id: ProductSelection) => {
    form.setValue("productSelection", id);
    scrollTo("order");
  };

  const quantityCopy: Record<ProductSelection, { label: string; hint: string }> = {
    bandage_pack: {
      label: "Number of bandage packs",
      hint: "Each pack contains 5 bandages ($20 per pack).",
    },
    smart_device: {
      label: "Number of devices",
      hint: "How many smart devices would you like? Pricing on request.",
    },
    complete_package: {
      label: "Number of complete packages",
      hint: "Each package includes a device and a bandage pack (5 bandages). Pricing on request.",
    },
  };
  const { label: quantityLabel, hint: quantityHint } = quantityCopy[selectedProduct];

  // Floating animation gated on reduced motion
  const floatY = reduceMotion ? undefined : { y: [0, -10, 0] };
  const floatTransition = { duration: 6, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-primary/15 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-accent/15 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-300/20 blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/40 shadow-[0_1px_0_rgba(17,31,79,0.04)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-3 group"
            aria-label="Enzora home"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img src={LOGO_SRC} alt="Enzora" className="h-12 w-auto transition-transform duration-500 group-hover:scale-105" />
          </motion.button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            <button onClick={() => scrollTo("about")} className="hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors">Products</button>
            <button onClick={() => scrollTo("app")} className="hover:text-primary transition-colors">App</button>
            <button onClick={() => scrollTo("partners")} className="hover:text-primary transition-colors">Partners</button>
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
            <button onClick={() => scrollTo("about")} className="text-left font-medium p-2">About</button>
            <button onClick={() => scrollTo("products")} className="text-left font-medium p-2">Products</button>
            <button onClick={() => scrollTo("app")} className="text-left font-medium p-2">App</button>
            <button onClick={() => scrollTo("partners")} className="text-left font-medium p-2">Partners</button>
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
      <Section id="hero" className="relative pt-16 pb-28 px-6 overflow-hidden">
        <WaveBackground className="top-0" />
        {/* Soft logo watermark behind hero/about */}
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-[-80px] top-1/2 -translate-y-1/2 w-[520px] opacity-[0.04] select-none"
        />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <motion.div className="space-y-8 max-w-2xl" variants={fadeUp}>
            <motion.img
              src={LOGO_SRC}
              alt="Enzora"
              className="h-14 w-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
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
              Enzora combines a pack of color-guided wound bandages with an optional smart sensor device. The bandage pack can be used on its own for simple visual monitoring, while the device makes monitoring more consistent through sensor reading and app updates.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-7 text-base h-12 shadow-md shadow-primary/25 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30 transition-all"
                onClick={() => selectProduct("bandage_pack")}
              >
                Buy Bandage Pack
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 text-base h-12 border-2 hover:translate-y-[-2px] transition-all"
                onClick={() => selectProduct("complete_package")}
              >
                Get Complete Package
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-6 text-base h-12 hover:bg-primary/5"
                onClick={() => scrollTo("about")}
              >
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right hero composition */}
          <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-md">
            <motion.div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/10 via-indigo-200/40 to-accent/20 blur-2xl"
              animate={reduceMotion ? undefined : { opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-white via-secondary/60 to-blue-50 rounded-[2rem] p-8 flex items-center justify-center border border-white shadow-2xl">
              <img src={LOGO_SRC} alt="" aria-hidden className="absolute top-6 left-6 h-8 opacity-30" />

              {/* Phone Mockup */}
              <motion.div
                className="w-[280px] h-[580px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col"
                animate={floatY}
                transition={floatTransition}
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
                      animate={reduceMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-16 h-16 rounded-full bg-accent shadow-[0_0_30px_rgba(25,200,154,0.6)]"
                      animate={reduceMotion ? undefined : { boxShadow: [
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
                animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(25,200,154,0.9)]"
                  animate={reduceMotion ? undefined : { opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                <div>
                  <div className="text-sm font-bold text-primary">Enzora Sensor</div>
                  <div className="text-xs text-muted-foreground">Syncing...</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 3. Who We Are */}
      <Section id="about" className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 w-[400px] opacity-[0.035] select-none"
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <img src={LOGO_SRC} alt="Enzora" className="h-10 w-auto" />
            <div className="h-8 w-px bg-primary/20" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Who We Are</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-foreground tracking-tight mb-8">
            A student-founded medical technology startup, building smarter wound care.
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8 text-lg text-muted-foreground leading-relaxed">
            <motion.p variants={fadeUp}>
              Enzora is a student-founded medical technology startup from Birzeit University. We are developing a smart wound patch system that supports wound monitoring and helps users notice possible changes earlier through modern, accessible, and innovative technology.
            </motion.p>
            <motion.p variants={fadeUp}>
              Our goal is to make wound-care follow-up clearer for patients, caregivers, and healthcare providers, especially in situations where regular monitoring can be difficult.
            </motion.p>
          </div>
        </div>
      </Section>

      {/* 4 + 5. Mission & Vision */}
      <Section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="p-10 rounded-3xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
          >
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -right-10 -bottom-10 h-44 opacity-10" />
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">Our Mission</h3>
            <p className="text-white/90 text-lg leading-relaxed">
              To develop smart medical solutions that improve patient care and make wound monitoring safer, clearer, and more effective by combining healthcare, engineering, and innovation.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="p-10 rounded-3xl bg-white border border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden"
          >
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -right-10 -bottom-10 h-44 opacity-[0.05]" />
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight text-foreground">Our Vision</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              To be part of the future of smart healthcare by creating innovative solutions that make patients' lives easier, support continuous follow-up, and create a positive impact in the medical sector.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* 6. More than a traditional bandage */}
      <Section className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Product positioning</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight mt-3">More than a traditional bandage</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 text-lg text-muted-foreground leading-relaxed">
            <motion.p variants={fadeUp}>
              Traditional dressings cover a wound. Enzora is designed to support a more active wound-care experience by combining a color-guided bandage with an optional smart monitoring device.
            </motion.p>
            <motion.p variants={fadeUp}>
              The Enzora bandage helps patients and caregivers visually notice color changes. When paired with the Enzora device, the system can read these changes more consistently and send updates to the mobile app.
            </motion.p>
          </div>
        </div>
      </Section>

      {/* 7. Built for patients who need closer wound follow-up */}
      <Section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 items-center">
          <motion.div variants={fadeUp} className="lg:col-span-3 space-y-6">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Diabetic wound care</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
              Built for patients who need closer wound follow-up
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Diabetic wounds can change quickly and require careful monitoring. Enzora is designed to support patients, caregivers, and clinics by making wound follow-up easier, clearer, and less dependent on guesswork.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For diabetic clinics and healthcare providers, Enzora can support a shift from occasional visual checking toward more consistent monitoring and timely awareness.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4 italic">
              Enzora is especially valuable in situations where frequent clinical follow-up is difficult, including home recovery, elderly care, diabetic wound monitoring, and resource-limited settings.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <div className="relative aspect-square rounded-[2rem] bg-gradient-to-br from-primary/10 via-indigo-200/40 to-accent/20 p-8 border border-white shadow-xl flex items-center justify-center overflow-hidden">
              <WaveBackground variant="bold" />
              <motion.div
                className="relative z-10 w-44 h-44 rounded-full bg-white shadow-2xl border-8 border-white flex items-center justify-center"
                animate={floatY}
                transition={floatTransition}
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-emerald-400 shadow-[0_0_40px_rgba(25,200,154,0.6)]"
                  animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], boxShadow: [
                    "0 0 30px rgba(25,200,154,0.45)",
                    "0 0 55px rgba(25,200,154,0.75)",
                    "0 0 30px rgba(25,200,154,0.45)",
                  ] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 8. Product options */}
      <Section id="products" className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Choose your Enzora package</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              The bandage pack can be used on its own for simple visual monitoring. Add the smart device to make monitoring more consistent with sensor readings and app updates.
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
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    p.highlight ? "bg-white/15" : "bg-primary/10 text-primary"
                  }`}>
                    <Package className="w-6 h-6" />
                  </div>
                  <img
                    src={LOGO_SRC}
                    alt=""
                    aria-hidden
                    className={`h-6 w-auto ${p.highlight ? "brightness-0 invert opacity-80" : "opacity-70"}`}
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">{p.title}</h3>
                <div className={`text-sm mb-5 ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                  {p.subtitle}
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-3xl font-bold tracking-tight">{p.price}</span>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${p.highlight ? "text-white/85" : "text-muted-foreground"}`}>
                  {p.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
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

      {/* Order Form */}
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
                    <FormField control={form.control} name="countryCity" render={({ field }) => (
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
                            <SelectItem value="bandage_pack">Enzora Bandage Pack - 5 bandages - $20</SelectItem>
                            <SelectItem value="smart_device">Enzora Smart Device - Contact us for pricing</SelectItem>
                            <SelectItem value="complete_package">Complete Enzora Package - Device + bandage pack</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Each bandage pack includes 5 bandages.</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{quantityLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} className="h-12" {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">{quantityHint}</p>
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

      {/* 9. App preview (placeholders) */}
      <Section id="app" className="relative py-24 bg-gradient-to-b from-secondary/40 via-white to-secondary/40 border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Mobile app</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight mt-3">Designed to work with the Enzora mobile app</h2>
            <p className="text-muted-foreground mt-3 text-lg">
              A clear, calm view of bandage status, color guidance, and healing progress. Real screenshots coming soon.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {appScreens.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative ${i === 1 ? "md:translate-y-6" : ""}`}
              >
                <div className="relative w-full max-w-[260px] mx-auto">
                  <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-primary/15 to-accent/20 blur-xl opacity-70" />
                  <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-900 rounded-b-xl z-10" />
                    <img
                      src={s.src}
                      alt={`Enzora app — ${s.label}`}
                      className="w-full h-[540px] rounded-[2rem] object-cover bg-gradient-to-br from-secondary via-white to-blue-50"
                    />
                  </div>
                </div>
                <div className="text-center mt-5">
                  <div className="text-sm font-semibold text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.caption}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* 10. For clinics, hospitals, and medical distributors */}
      <Section id="partners" className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            className="rounded-[2.5rem] p-10 md:p-16 bg-gradient-to-br from-primary via-indigo-700 to-primary text-white shadow-2xl shadow-primary/25 relative overflow-hidden"
          >
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -right-16 -bottom-16 h-72 opacity-[0.07]" />
            <WaveBackground variant="bold" />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider text-white/80">B2B Partnerships</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">For clinics, hospitals, and medical distributors</h2>
              <p className="text-white/90 text-lg leading-relaxed mb-5">
                The medical consumables market is moving toward smarter, more connected solutions. Enzora combines accessible wound-care materials with smart monitoring technology, creating a product line that can support patients, caregivers, and healthcare providers.
              </p>
              <p className="text-white/90 text-lg leading-relaxed mb-5">
                If you are a clinic, hospital, or medical distributor interested in Enzora, contact us to discuss partnership and distribution opportunities.
              </p>
              <p className="text-white/85 text-base leading-relaxed mb-8 italic">
                By supporting earlier awareness and clearer follow-up, Enzora aims to reduce uncertainty and support better wound-care decisions.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full bg-white text-primary hover:bg-white/90 px-7 h-12"
                  onClick={() => scrollTo("order")}
                >
                  <Mail className="w-4 h-4 mr-2" /> Contact Enzora
                </Button>
                <a href="mailto:hello@enzora.health">
                  <Button size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 px-7 h-12">
                    hello@enzora.health
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* 11. Privacy-first */}
      <Section className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-5xl mx-auto px-6 relative grid md:grid-cols-5 gap-10 items-center">
          <motion.div variants={fadeUp} className="md:col-span-2 flex justify-center">
            <div className="relative w-44 h-44 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/15 flex items-center justify-center border border-primary/10 shadow-lg">
              <ShieldCheck className="w-20 h-20 text-primary" />
              <Lock className="absolute bottom-5 right-5 w-7 h-7 text-accent bg-white rounded-full p-1 shadow-md" />
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="md:col-span-3 space-y-5">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">Privacy-first by design</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">Your data, treated with care</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Because wound-care monitoring may involve sensitive information, Enzora is designed with privacy, transparency, consent, and responsible data handling in mind.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-2">
              {[
                "Transparent data practices",
                "Clear consent throughout",
                "Responsible storage & access",
                "GDPR-aware approach",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Section>

      {/* 12. FAQ */}
      <Section id="faq" className="py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-4 tracking-tight">Frequently asked questions</motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment.
          </motion.p>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {[
              { q: "Is Enzora a replacement for a doctor?", a: "No. Enzora is a monitoring support tool designed to help you stay aware of visual changes. It does not replace professional medical advice, diagnosis, or treatment." },
              { q: "Can I buy only the bandage pack?", a: "Yes. The Enzora bandage pack contains 5 bandages for $20 ($4 per bandage) and can be used on its own for simple visual color-based monitoring." },
              { q: "What does the smart device add?", a: "The device reads bandage color more consistently than manual checking, helps track changes over time, and sends updates to the Enzora mobile app." },
              { q: "How much do the device and complete package cost?", a: "The Enzora Smart Device and the Complete Enzora Package are available on request — please contact us for pricing." },
              { q: "Who is Enzora for?", a: "Enzora is designed for people who need closer wound follow-up, including diabetic wound care, post-surgery recovery, elderly care, and home recovery situations where frequent clinical follow-up is difficult." },
              { q: "Can caregivers use it?", a: "Yes. Caregivers can use the bandage and the app to support family members or patients during recovery." },
              { q: "How is my data handled?", a: "Because wound-care monitoring may involve sensitive information, Enzora is designed with privacy, transparency, consent, and responsible data handling in mind." },
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
                <img src={LOGO_SRC} alt="Enzora" className="h-12 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Smarter wound monitoring with a color-guided bandage and connected device — bringing clarity and calm to recovery at home.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><button onClick={() => scrollTo("about")} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollTo("products")} className="hover:text-white transition-colors">Products</button></li>
                <li><button onClick={() => scrollTo("app")} className="hover:text-white transition-colors">App</button></li>
                <li><button onClick={() => scrollTo("partners")} className="hover:text-white transition-colors">Partners</button></li>
                <li><button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">FAQ</button></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="mailto:hello@enzora.health" className="hover:text-white transition-colors">hello@enzora.health</a></li>
                <li className="text-gray-500 text-xs leading-relaxed pt-2">
                  A student-founded medical technology startup from Birzeit University.
                </li>
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
