import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOrder, useListProducts, useListPaymentMethods, ProductSelection, type Product, type PaymentMethodPublic } from "@workspace/api-client-react";
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
  Sparkles, ArrowRight, Package, Building2, Lock, Mail, Languages
} from "lucide-react";

const PALESTINIAN_CITIES = [
  "Ramallah", "Al-Bireh", "Jerusalem", "Nablus", "Hebron",
  "Bethlehem", "Jenin", "Tulkarm", "Qalqilya", "Salfit",
  "Jericho", "Tubas", "Gaza", "Khan Younis", "Rafah", "Other",
];

const PHONE_REGEX = /^(\+970[\s\-]?\d[\d\s\-]{6,14}|0\d{9,10})$/;

const orderFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(PHONE_REGEX, "Enter a valid Palestinian phone number, e.g. +970 59 000 0000 or 0590000000"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  customCity: z.string().optional(),
  customerType: z.enum(["patient", "caregiver", "clinic", "hospital", "research", "other"]),
  productSelection: z.enum(["bandage_pack", "smart_device", "complete_package"]),
  quantity: z.number().int().min(1),
  message: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "cash_on_pickup", "bank_transfer", "mobile_wallet", "contact_us"], {
    required_error: "Please select a payment method",
  }),
}).refine(
  (data) => data.city !== "Other" || (data.customCity && data.customCity.trim().length > 0),
  { message: "Please enter your city", path: ["customCity"] },
);

type OrderFormValues = z.infer<typeof orderFormSchema>;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
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

type ProductStaticMeta = {
  subtitle: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

const PRODUCT_STATIC_META: Record<string, ProductStaticMeta> = {
  bandage_pack: {
    subtitle: "5 bandages per pack",
    features: [
      "5 bandages per pack",
      "Color-based visual guidance",
      "No device required",
    ],
    cta: "Buy Bandage Pack",
    highlight: false,
  },
  smart_device: {
    subtitle: "Sold separately",
    features: [
      "Sensor-based color reading",
      "Connects to Enzora mobile app",
      "Caregiver-friendly monitoring",
      "Works with Enzora bandages",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
  complete_package: {
    subtitle: "Device + bandage pack",
    features: [
      "Smart sensor device",
      "Bandage pack included (5 bandages)",
      "App status updates",
      "Best for continuous home monitoring",
    ],
    cta: "Get Complete Package",
    highlight: true,
  },
};

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

type OrderSuccessData = {
  orderReference: string;
  amountDue: number | null;
  currency: string;
  paymentMethod: string | null;
};

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");
  const isAr = lang === "ar";
  const reduceMotion = useReducedMotion();

  const orderMutation = useCreateOrder();
  const { data: liveProducts = [], isLoading: isProductsLoading } = useListProducts();
  const { data: paymentMethods = [], isLoading: isPaymentMethodsLoading } = useListPaymentMethods();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "Palestine",
      city: "Ramallah",
      customCity: "",
      customerType: "patient",
      productSelection: ProductSelection.bandage_pack,
      quantity: 1,
      message: "",
    },
  });

  const selectedProduct = form.watch("productSelection");
  const selectedCity = form.watch("city");
  const selectedPaymentMethod = form.watch("paymentMethod");

  const selectedProductData = liveProducts.find((p) => p.productKey === selectedProduct);
  const hasPrice = selectedProductData?.price != null;
  const unitPrice = selectedProductData?.price ?? null;
  const productCurrency = selectedProductData?.currency ?? "USD";
  const quantity = form.watch("quantity") || 1;
  const estimatedTotal = hasPrice && unitPrice != null ? unitPrice * quantity : null;

  const onSubmit = (data: OrderFormValues) => {
    const actualCity = data.city === "Other" ? (data.customCity ?? "") : data.city;
    orderMutation.mutate({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        city: actualCity,
        customerType: data.customerType,
        productSelection: data.productSelection,
        quantity: data.quantity,
        message: data.message,
        paymentMethod: data.paymentMethod,
      },
    }, {
      onSuccess: (res) => {
        setOrderSuccess({
          orderReference: res.orderReference,
          amountDue: res.amountDue ?? null,
          currency: res.currency ?? "USD",
          paymentMethod: res.paymentMethod ?? null,
        });
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

  const getProductDisplayText = (key: ProductSelection): string => {
    const p = liveProducts.find((p) => p.productKey === key);
    return p?.displayText ?? "Contact us for pricing";
  };

  const quantityCopyLabels: Record<ProductSelection, string> = {
    bandage_pack: "Number of bandage packs",
    smart_device: "Number of devices",
    complete_package: "Number of complete packages",
  };

  const quantityCopyHints: Record<ProductSelection, (displayText: string) => string> = {
    bandage_pack: (dt) => `Each pack contains 5 bandages (${dt} per pack). Equivalent local payment options can be discussed after submission.`,
    smart_device: (dt) => `How many smart devices would you like? Price: ${dt}.`,
    complete_package: (dt) => `Each package includes a device and a bandage pack (5 bandages). Price: ${dt}.`,
  };

  const quantityLabel = quantityCopyLabels[selectedProduct];
  const quantityHint = quantityCopyHints[selectedProduct](getProductDisplayText(selectedProduct));

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
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary/80 hover:text-primary transition-colors border border-primary/20 rounded-full px-3 py-1.5"
              aria-label="Toggle language"
            >
              <Languages className="w-3.5 h-3.5" />
              {isAr ? "EN" : "عربي"}
            </button>
            <Button onClick={() => scrollTo("order")} className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              {isAr ? "اطلب الآن" : "Order Now"}
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
        <div className="max-w-7xl mx-auto relative">
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
            {isProductsLoading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="rounded-3xl p-8 border bg-white animate-pulse h-64 shadow-lg" />
              ))
            ) : (
              (liveProducts.length > 0 ? liveProducts : [
                { productKey: "bandage_pack" as ProductSelection, name: "Enzora Bandage Pack", description: "For simple visual color-guided monitoring at home.", price: null, currency: "USD", priceLabel: null, displayText: "Contact us for pricing" },
                { productKey: "smart_device" as ProductSelection, name: "Enzora Smart Device", description: "Reads Enzora bandage color changes and connects to the mobile app.", price: null, currency: "USD", priceLabel: null, displayText: "Contact us for pricing" },
                { productKey: "complete_package" as ProductSelection, name: "Complete Enzora Package", description: "Full Enzora monitoring experience.", price: null, currency: "USD", priceLabel: null, displayText: "Contact us for pricing" },
              ] as Product[]).map((p) => {
                const meta = PRODUCT_STATIC_META[p.productKey] ?? { subtitle: "", features: [], cta: "Order Now", highlight: false };
                return (
                  <motion.div
                    key={p.productKey}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                    className={`relative rounded-3xl p-8 border flex flex-col ${
                      meta.highlight
                        ? "bg-gradient-to-br from-primary to-indigo-700 text-white border-primary shadow-2xl shadow-primary/25 md:scale-[1.03]"
                        : "bg-white text-foreground border-primary/10 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {meta.highlight && (
                      <div className="absolute -top-3 right-6 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        Recommended
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        meta.highlight ? "bg-white/15" : "bg-primary/10 text-primary"
                      }`}>
                        <Package className="w-6 h-6" />
                      </div>
                      <img
                        src={LOGO_SRC}
                        alt=""
                        aria-hidden
                        className={`h-6 w-auto ${meta.highlight ? "brightness-0 invert opacity-80" : "opacity-70"}`}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
                    <div className={`text-sm mb-5 ${meta.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                      {meta.subtitle}
                    </div>
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="text-3xl font-bold tracking-tight">{p.displayText}</span>
                    </div>
                    <p className={`text-sm leading-relaxed mb-6 ${meta.highlight ? "text-white/85" : "text-muted-foreground"}`}>
                      {p.description}
                    </p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="lg"
                      variant={meta.highlight ? "secondary" : "default"}
                      className={`rounded-full w-full h-12 ${meta.highlight ? "bg-white text-primary hover:bg-white/90" : ""}`}
                      onClick={() => selectProduct(p.productKey)}
                    >
                      {meta.cta}
                    </Button>
                  </motion.div>
                );
              })
            )}
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

          <motion.div variants={fadeUp} className={`bg-white text-foreground p-8 md:p-12 rounded-[2rem] shadow-2xl ${isAr ? "text-right" : ""}`} dir={isAr ? "rtl" : "ltr"}>
            {orderSuccess ? (
              <div className="text-center py-12 space-y-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                {isAr ? (
                  <>
                    <h3 className="text-3xl font-bold">تم إرسال الطلب</h3>
                    {orderSuccess.amountDue != null ? (
                      <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        تم تقديم طلبك <strong className="font-mono">{orderSuccess.orderReference}</strong> بنجاح. المبلغ الإجمالي المقدّر هو <strong>{orderSuccess.currency} {Number(orderSuccess.amountDue).toFixed(2)}</strong>. سيتواصل معك فريقنا قريباً لتأكيد تفاصيل الدفع.
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        تم تقديم طلبك <strong className="font-mono">{orderSuccess.orderReference}</strong> بنجاح. سيتواصل معك فريقنا قريباً لتأكيد التسعير وترتيب الدفع.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold">Request Submitted</h3>
                    {orderSuccess.amountDue != null ? (
                      <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        Your order <strong className="font-mono">{orderSuccess.orderReference}</strong> has been submitted. Your estimated total is <strong>{orderSuccess.currency} {Number(orderSuccess.amountDue).toFixed(2)}</strong>. Our team will contact you shortly to confirm payment details.
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        Your order <strong className="font-mono">{orderSuccess.orderReference}</strong> has been submitted. Our team will contact you soon to confirm pricing and arrange payment.
                      </p>
                    )}
                  </>
                )}
                <div className="pt-6">
                  <Button variant="outline" size="lg" className="rounded-full" onClick={() => setOrderSuccess(null)}>
                    {isAr ? "إرسال طلب آخر" : "Submit another request"}
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
                        <FormControl><Input placeholder="e.g. Ahmad Al-Khalidi" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="e.g. ahmad@example.com" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl><Input type="tel" placeholder="+970 59 000 0000" className="h-12" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Palestine">Palestine</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PALESTINIAN_CITIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {selectedCity === "Other" && (
                      <FormField control={form.control} name="customCity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter your city</FormLabel>
                          <FormControl><Input placeholder="Your city" className="h-12" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
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
                            {(liveProducts.length > 0
                              ? liveProducts
                              : [
                                  { productKey: "bandage_pack" as ProductSelection, name: "Enzora Bandage Pack", displayText: "Contact us for pricing", description: "", price: null, currency: "USD", priceLabel: null },
                                  { productKey: "smart_device" as ProductSelection, name: "Enzora Smart Device", displayText: "Contact us for pricing", description: "", price: null, currency: "USD", priceLabel: null },
                                  { productKey: "complete_package" as ProductSelection, name: "Complete Enzora Package", displayText: "Contact us for pricing", description: "", price: null, currency: "USD", priceLabel: null },
                                ] as Product[]
                            ).map((p) => {
                              const meta = PRODUCT_STATIC_META[p.productKey];
                              const label = meta?.subtitle
                                ? `${p.name} - ${meta.subtitle} - ${p.displayText}`
                                : `${p.name} - ${p.displayText}`;
                              return (
                                <SelectItem key={p.productKey} value={p.productKey}>
                                  {label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>{isAr ? "رسالة (اختياري)" : "Message (optional)"}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={isAr ? "أي أسئلة أو تفاصيل إضافية..." : "Any questions or additional details about your order..."} className="resize-none h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Payment Method Section */}
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          {isAr ? "طريقة الدفع" : "Payment Method"}
                        </FormLabel>
                        {isPaymentMethodsLoading ? (
                          <div className="grid gap-3 mt-2">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="h-16 rounded-xl border bg-gray-50 animate-pulse" />
                            ))}
                          </div>
                        ) : paymentMethods.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            {isAr ? "طرق الدفع غير متاحة حالياً." : "Payment methods are not available right now."}
                          </p>
                        ) : (
                          <div className="grid gap-3 mt-2">
                            {paymentMethods.map((method) => {
                              const isSelected = field.value === method.methodKey;
                              const name = isAr ? method.nameAr : method.nameEn;
                              const instructions = isAr ? method.instructionsAr : method.instructionsEn;
                              return (
                                <button
                                  key={method.methodKey}
                                  type="button"
                                  onClick={() => field.onChange(method.methodKey)}
                                  className={`w-full text-left rounded-xl border-2 p-4 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-primary/40"
                                  }`}
                                  dir={isAr ? "rtl" : "ltr"}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      isSelected ? "border-primary" : "border-gray-300"
                                    }`}>
                                      {isSelected && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                        {name}
                                      </div>
                                      {isSelected && (
                                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                          {instructions}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {fieldState.error && (
                          <p className="text-sm font-medium text-destructive mt-1">{fieldState.error.message}</p>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Price Summary */}
                  <div className={`rounded-xl border p-4 ${hasPrice ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-200"}`}>
                    <div className="text-sm font-semibold mb-2 text-foreground">
                      {isAr ? "ملخص الطلب" : "Order Summary"}
                    </div>
                    {hasPrice && unitPrice != null ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{isAr ? "سعر الوحدة" : "Unit price"}</span>
                          <span className="font-medium">{productCurrency} {unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{isAr ? "الكمية" : "Quantity"}</span>
                          <span className="font-medium">{quantity}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-primary/15 font-semibold">
                          <span>{isAr ? "الإجمالي المقدّر" : "Estimated total"}</span>
                          <span className="text-primary">{productCurrency} {(estimatedTotal ?? 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isAr
                          ? "سيتم تأكيد التسعير من قبل فريق Enzora."
                          : "Pricing will be confirmed by the Enzora team."}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-full mt-2 shadow-lg shadow-primary/20" disabled={orderMutation.isPending}>
                    {orderMutation.isPending
                      ? (isAr ? "جارٍ الإرسال..." : "Submitting...")
                      : (isAr ? "إرسال طلب الشراء" : "Submit Order Request")}
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
