import { useMemo, useEffect, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductSelection, CustomerType, PaymentMethodKey } from "@workspace/api-zod";
import type { Product, CreateOrderInput, OrderConfirmation, PaymentMethodPublic } from "@workspace/api-zod";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SocialIcons } from "@/components/SocialIcons";
import { WaveBackground } from "@/components/WaveBackground";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  Menu, X, CheckCircle2, Heart, Shield, ShieldCheck,
  Sparkles, ArrowRight, ArrowLeft, Package, Building2, Lock, Mail, MapPin
} from "lucide-react";

const PALESTINIAN_CITIES = [
  "Ramallah", "Al-Bireh", "Jerusalem", "Nablus", "Hebron",
  "Bethlehem", "Jenin", "Tulkarm", "Qalqilya", "Salfit",
  "Jericho", "Tubas", "Gaza", "Khan Younis", "Rafah", "Other",
] as const;

type CityKey = typeof PALESTINIAN_CITIES[number];

const PHONE_REGEX = /^(\+970[\s\-]?\d[\d\s\-]{6,14}|0\d{9,10})$/;

const PRODUCT_ORDER: Array<typeof ProductSelection[keyof typeof ProductSelection]> = [
  ProductSelection.bandage_pack,
  ProductSelection.smart_device,
  ProductSelection.complete_package,
];


function useListProducts() {
  return useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<Product[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useListPaymentMethods() {
  return useQuery<PaymentMethodPublic[]>({
    queryKey: ["/api/payment-methods"],
    queryFn: async () => {
      const res = await fetch("/api/payment-methods");
      if (!res.ok) throw new Error("Failed to fetch payment methods");
      return res.json() as Promise<PaymentMethodPublic[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useSubmitOrder() {
  return useMutation<OrderConfirmation, Error, { data: CreateOrderInput }>({
    mutationFn: async ({ data }) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<OrderConfirmation>;
    },
  });
}

type OrderFormValues = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  customCity?: string;
  customerType: typeof CustomerType[keyof typeof CustomerType];
  productSelection: typeof ProductSelection[keyof typeof ProductSelection];
  quantity: number;
  message?: string;
  paymentMethod: PaymentMethodKey;
};

type OrderSuccessData = {
  orderReference: string;
  amountDue: number | null;
  currency: string;
  paymentMethod: PaymentMethodKey | null;
};

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

const appScreensSrcs = [
  `${import.meta.env.BASE_URL}app-screen-normal.svg`,
  `${import.meta.env.BASE_URL}app-screen-watch.svg`,
  `${import.meta.env.BASE_URL}app-screen-infection.svg`,
];

const LOGO_SRC = `${import.meta.env.BASE_URL}enzora-logo.png`;

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex items-center gap-0.5 text-sm font-semibold select-none">
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-2 py-1 rounded transition-colors",
          language === "en"
            ? "text-primary"
            : "text-foreground/50 hover:text-foreground/80"
        )}
        aria-pressed={language === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-foreground/25 select-none">|</span>
      <button
        onClick={() => setLanguage("ar")}
        className={cn(
          "px-2 py-1 rounded transition-colors",
          language === "ar"
            ? "text-primary"
            : "text-foreground/50 hover:text-foreground/80"
        )}
        aria-pressed={language === "ar"}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
    </div>
  );
}

export default function Landing() {
  const { t, language, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);
  const reduceMotion = useReducedMotion();

  const orderMutation = useSubmitOrder();
  const { data: liveProducts } = useListProducts();
  const { data: paymentMethods = [], isLoading: isPaymentMethodsLoading } = useListPaymentMethods();

  const productDisplayTexts = useMemo(() => {
    const map: Partial<Record<typeof ProductSelection[keyof typeof ProductSelection], string>> = {};
    for (const p of liveProducts ?? []) {
      map[p.productKey] = p.displayText;
    }
    return map;
  }, [liveProducts]);

  const orderFormSchema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().min(1, t.order.validation.fullNameRequired),
          email: z.string().email(t.order.validation.invalidEmail),
          phone: z.string().regex(PHONE_REGEX, t.order.validation.invalidPhone),
          country: z.string().min(1, t.order.validation.countryRequired),
          city: z.string().min(1, t.order.validation.cityRequired),
          customCity: z.string().optional(),
          customerType: z.enum(["patient", "caregiver", "clinic", "hospital", "research", "other"]),
          productSelection: z.enum(["bandage_pack", "smart_device", "complete_package"]),
          quantity: z.number().int().min(1),
          message: z.string().optional(),
          paymentMethod: z.enum(["cash_on_delivery", "cash_on_pickup", "bank_transfer", "mobile_wallet", "contact_us"], {
            required_error: t.order.validation.paymentMethodRequired,
          }),
        })
        .refine(
          (data) => data.city !== "Other" || (data.customCity && data.customCity.trim().length > 0),
          { message: t.order.validation.customCityRequired, path: ["customCity"] }
        ),
    [language]
  );

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "Palestine",
      city: "Ramallah",
      customCity: "",
      customerType: CustomerType.patient,
      productSelection: ProductSelection.bandage_pack,
      quantity: 1,
      message: "",
      paymentMethod: PaymentMethodKey.cash_on_delivery,
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [language]);

  const selectedProduct = form.watch("productSelection");
  const selectedCity = form.watch("city");

  const onSubmit = (data: OrderFormValues) => {
    const actualCity = data.city === "Other" ? (data.customCity ?? "") : data.city;
    const payload: CreateOrderInput = {
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
      language,
    };
    orderMutation.mutate(
      { data: payload },
      {
        onSuccess: (res) => {
          setOrderSuccess({
            orderReference: res.orderReference,
            amountDue: res.amountDue ?? null,
            currency: res.currency ?? "USD",
            paymentMethod: res.paymentMethod ?? null,
          });
          form.reset();
        },
      }
    );
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const selectProduct = (id: typeof ProductSelection[keyof typeof ProductSelection]) => {
    form.setValue("productSelection", id);
    scrollTo("order");
  };

  const contactPricing = t.products.contactPricing;

  const quantityLabel = t.order.quantity[selectedProduct as keyof typeof t.order.quantity] ?? t.order.quantity.complete_package;
  const quantityHint = (t.order.quantityHint[selectedProduct as keyof typeof t.order.quantityHint] ?? t.order.quantityHint.complete_package)(
    productDisplayTexts[selectedProduct] ?? contactPricing
  );

  const floatY = reduceMotion ? undefined : { y: [0, -10, 0] };
  const floatTransition = { duration: 6, repeat: Infinity, ease: "easeInOut" as const };

  const ArrowDir = dir === "rtl" ? ArrowLeft : ArrowRight;

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

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/80">
            <button onClick={() => scrollTo("about")} className="hover:text-primary transition-colors">{t.nav.about}</button>
            <button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors">{t.nav.products}</button>
            <button onClick={() => scrollTo("app")} className="hover:text-primary transition-colors">{t.nav.app}</button>
            <button onClick={() => scrollTo("partners")} className="hover:text-primary transition-colors">{t.nav.partners}</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-primary transition-colors">{t.nav.faq}</button>
            <Link href="/track-order" className="hover:text-primary transition-colors">{t.nav.trackOrder}</Link>
            <LanguageToggle />
            <Button onClick={() => scrollTo("order")} className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              {t.nav.orderNow}
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col gap-3">
            <button onClick={() => scrollTo("about")} className="text-start font-medium p-2">{t.nav.about}</button>
            <button onClick={() => scrollTo("products")} className="text-start font-medium p-2">{t.nav.products}</button>
            <button onClick={() => scrollTo("app")} className="text-start font-medium p-2">{t.nav.app}</button>
            <button onClick={() => scrollTo("partners")} className="text-start font-medium p-2">{t.nav.partners}</button>
            <button onClick={() => scrollTo("faq")} className="text-start font-medium p-2">{t.nav.faq}</button>
            <Link href="/track-order" className="text-start font-medium p-2 hover:text-primary transition-colors">{t.nav.trackOrder}</Link>
            <Button onClick={() => scrollTo("order")} className="w-full">{t.nav.orderNow}</Button>
            <div className="pt-2">
              <LanguageToggle />
            </div>
            <div className="pt-3 mt-1 border-t border-primary/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-2">{t.nav.followEnzora}</p>
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
        <img
          src={LOGO_SRC}
          alt=""
          aria-hidden
          className="pointer-events-none absolute end-[-80px] top-1/2 -translate-y-1/2 w-[520px] opacity-[0.04] select-none"
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
              <Sparkles className="w-4 h-4 me-2" /> {t.hero.badge}
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.05] tracking-tight">
              {t.hero.headline1}{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
                {t.hero.headlineHighlight}
              </span>{" "}
              {t.hero.headline2}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
              {t.hero.subtext}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full px-7 text-base h-12 shadow-md shadow-primary/25 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/30 transition-all"
                onClick={() => selectProduct(ProductSelection.bandage_pack)}
              >
                {t.hero.buyBandage}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-7 text-base h-12 border-2 hover:translate-y-[-2px] transition-all"
                onClick={() => selectProduct(ProductSelection.complete_package)}
              >
                {t.hero.getPackage}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full px-6 text-base h-12 hover:bg-primary/5"
                onClick={() => scrollTo("about")}
              >
                {t.hero.learnMore} <ArrowDir className="w-4 h-4 ms-1" />
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
          className="pointer-events-none absolute -start-24 bottom-0 w-[400px] opacity-[0.035] select-none"
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
            <img src={LOGO_SRC} alt="Enzora" className="h-10 w-auto" />
            <div className="h-8 w-px bg-primary/20" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.about.sectionLabel}</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-foreground tracking-tight mb-8">
            {t.about.headline}
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8 text-lg text-muted-foreground leading-relaxed">
            <motion.p variants={fadeUp}>{t.about.para1}</motion.p>
            <motion.p variants={fadeUp}>{t.about.para2}</motion.p>
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
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -end-10 -bottom-10 h-44 opacity-10" />
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-5">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight">{t.mission.title}</h3>
            <p className="text-white/90 text-lg leading-relaxed">{t.mission.body}</p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="p-10 rounded-3xl bg-white border border-primary/10 shadow-xl shadow-primary/5 relative overflow-hidden"
          >
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -end-10 -bottom-10 h-44 opacity-[0.05]" />
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold mb-4 tracking-tight text-foreground">{t.vision.title}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{t.vision.body}</p>
          </motion.div>
        </div>
      </Section>

      {/* 6. More than a traditional bandage */}
      <Section className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.bandage.sectionLabel}</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight mt-3">{t.bandage.title}</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 text-lg text-muted-foreground leading-relaxed">
            <motion.p variants={fadeUp}>{t.bandage.para1}</motion.p>
            <motion.p variants={fadeUp}>{t.bandage.para2}</motion.p>
          </div>
        </div>
      </Section>

      {/* 7. Built for patients */}
      <Section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 items-center">
          <motion.div variants={fadeUp} className="lg:col-span-3 space-y-6">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.device.sectionLabel}</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">{t.device.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t.device.para1}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{t.device.para2}</p>
            <p className="text-base text-muted-foreground leading-relaxed border-s-2 border-primary/30 ps-4 italic">
              {t.device.quote}
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
            <h2 className="text-4xl font-bold text-foreground tracking-tight">{t.products.title}</h2>
            <p className="text-muted-foreground mt-4 text-lg">{t.products.subtitle}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {PRODUCT_ORDER.map((productKey) => {
              const meta = t.products.meta[productKey as keyof typeof t.products.meta];
              if (!meta) return null;
              return (
                <motion.div
                  key={productKey}
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
                    <div className="absolute -top-3 end-6 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {t.products.recommended}
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
                  <h3 className="text-2xl font-bold mb-1">{meta.name}</h3>
                  <div className={`text-sm mb-5 ${meta.highlight ? "text-white/70" : "text-muted-foreground"}`}>
                    {meta.subtitle}
                  </div>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-3xl font-bold tracking-tight">
                      {productDisplayTexts[productKey] ?? t.products.contactPricing}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 ${meta.highlight ? "text-white/85" : "text-muted-foreground"}`}>
                    {meta.description}
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
                    onClick={() => selectProduct(productKey)}
                  >
                    {meta.cta}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Order Form */}
      <Section id="order" className="py-24 bg-gradient-to-br from-primary via-indigo-700 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)]" />
        <img src={LOGO_SRC} alt="" aria-hidden className="absolute end-6 top-6 h-10 opacity-20" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 tracking-tight">{t.order.title}</h2>
            <p className="text-primary-foreground/85 text-lg">{t.order.subtitle}</p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs uppercase tracking-wider text-primary-foreground/70">{t.order.connectLabel}</p>
              <SocialIcons variant="onDark" size="sm" className="justify-center" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white text-foreground p-8 md:p-12 rounded-[2rem] shadow-2xl">
            {orderSuccess !== null ? (
              <div className="text-center py-12 space-y-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h3 className="text-3xl font-bold">{t.order.successTitle}</h3>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  {orderSuccess.amountDue != null
                    ? t.order.successBodyWithAmount(
                        orderSuccess.orderReference,
                        `${orderSuccess.currency} ${Number(orderSuccess.amountDue).toFixed(2)}`,
                      )
                    : t.order.successBodyNoAmount(orderSuccess.orderReference)}
                </p>
                <div className="inline-block bg-gray-50 border px-6 py-3 rounded-xl font-mono font-medium text-base mt-2">
                  {t.order.successRef} {orderSuccess.orderReference}
                </div>
                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href={`/track-order?ref=${orderSuccess.orderReference}`}>
                    <Button size="lg" className="rounded-full px-7 w-full sm:w-auto">
                      {t.order.successTrackBtn}
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-full" onClick={() => setOrderSuccess(null)}>
                    {t.order.submitAnother}
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.fullName}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.order.fullNamePlaceholder}
                            className="h-12"
                            dir="auto"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.email}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t.order.emailPlaceholder}
                            className="h-12"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.phone}</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t.order.phonePlaceholder}
                            className="h-12"
                            dir="ltr"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.country}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t.order.selectCountry} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Palestine">{t.order.countries.Palestine}</SelectItem>
                            <SelectItem value="Other">{t.order.countries.Other}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.city}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t.order.selectCity} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PALESTINIAN_CITIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {t.cities[c as CityKey] ?? c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {selectedCity === "Other" && (
                      <FormField control={form.control} name="customCity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.order.customCity}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.order.customCityPlaceholder}
                              className="h-12"
                              dir="auto"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="productSelection" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.order.product}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder={t.order.selectProduct} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRODUCT_ORDER.map((productKey) => {
                              const meta = t.products.meta[productKey as keyof typeof t.products.meta];
                              return (
                                <SelectItem key={productKey} value={productKey}>
                                  {meta ? `${meta.name} — ${meta.subtitle}` : productKey}
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
                          <Input
                            type="number"
                            min={1}
                            className="h-12"
                            dir="ltr"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">{quantityHint}</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="customerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.order.customerType}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder={t.order.selectType} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="patient">{t.order.customerTypes.patient}</SelectItem>
                          <SelectItem value="caregiver">{t.order.customerTypes.caregiver}</SelectItem>
                          <SelectItem value="clinic">{t.order.customerTypes.clinic}</SelectItem>
                          <SelectItem value="hospital">{t.order.customerTypes.hospital}</SelectItem>
                          <SelectItem value="research">{t.order.customerTypes.research}</SelectItem>
                          <SelectItem value="other">{t.order.customerTypes.other}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.order.message}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t.order.messagePlaceholder}
                          className="resize-none h-32"
                          dir="auto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">{t.order.paymentMethod}</FormLabel>
                        {isPaymentMethodsLoading ? (
                          <div className="grid gap-3 mt-2">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="h-16 rounded-xl border bg-gray-50 animate-pulse" />
                            ))}
                          </div>
                        ) : paymentMethods.length === 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">{t.order.paymentMethodsUnavailable}</p>
                        ) : (
                          <div className="grid gap-3 mt-2">
                            {paymentMethods.map((method) => {
                              const isSelected = field.value === method.methodKey;
                              const name = language === "ar" ? method.nameAr : method.nameEn;
                              const instructions = language === "ar" ? method.instructionsAr : method.instructionsEn;
                              return (
                                <button
                                  key={method.methodKey}
                                  type="button"
                                  onClick={() => field.onChange(method.methodKey)}
                                  className={cn(
                                    "w-full text-start rounded-xl border-2 p-4 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-gray-200 bg-white hover:border-primary/40",
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isSelected ? "border-primary" : "border-gray-300",
                                      )}
                                    >
                                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                                        {name}
                                      </div>
                                      {isSelected && instructions && (
                                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{instructions}</div>
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

                  <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-full mt-2 shadow-lg shadow-primary/20" disabled={orderMutation.isPending}>
                    {orderMutation.isPending ? t.order.submitting : t.order.submit}
                  </Button>
                </form>
              </Form>
            )}
          </motion.div>
        </div>
      </Section>

      {/* 9. App preview */}
      <Section id="app" className="relative py-24 bg-gradient-to-b from-secondary/40 via-white to-secondary/40 border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.app.sectionLabel}</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight mt-3">{t.app.title}</h2>
            <p className="text-muted-foreground mt-3 text-lg">{t.app.subtitle}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.app.screens.map((s, i) => (
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
                      src={appScreensSrcs[i]}
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

      {/* 10. Partners */}
      <Section id="partners" className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            className="rounded-[2.5rem] p-10 md:p-16 bg-gradient-to-br from-primary via-indigo-700 to-primary text-white shadow-2xl shadow-primary/25 relative overflow-hidden"
          >
            <img src={LOGO_SRC} alt="" aria-hidden className="absolute -end-16 -bottom-16 h-72 opacity-[0.07]" />
            <WaveBackground variant="bold" />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider text-white/80">{t.partners.sectionLabel}</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">{t.partners.title}</h2>
              <p className="text-white/90 text-lg leading-relaxed mb-5">{t.partners.para1}</p>
              <p className="text-white/90 text-lg leading-relaxed mb-5">{t.partners.para2}</p>
              <p className="text-white/85 text-base leading-relaxed mb-8 italic">{t.partners.quote}</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full bg-white text-primary hover:bg-white/90 px-7 h-12"
                  onClick={() => scrollTo("order")}
                >
                  <Mail className="w-4 h-4 me-2" /> {t.partners.contactBtn}
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

      {/* 11. Privacy */}
      <Section className="relative py-24 bg-white border-y border-primary/10 overflow-hidden">
        <WaveBackground variant="soft" />
        <div className="max-w-5xl mx-auto px-6 relative grid md:grid-cols-5 gap-10 items-center">
          <motion.div variants={fadeUp} className="md:col-span-2 flex justify-center">
            <div className="relative w-44 h-44 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/15 flex items-center justify-center border border-primary/10 shadow-lg">
              <ShieldCheck className="w-20 h-20 text-primary" />
              <Lock className="absolute bottom-5 end-5 w-7 h-7 text-accent bg-white rounded-full p-1 shadow-md" />
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="md:col-span-3 space-y-5">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t.privacy.sectionLabel}</span>
            <h2 className="text-4xl font-bold text-foreground tracking-tight">{t.privacy.title}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t.privacy.body}</p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-2">
              {t.privacy.items.map((item) => (
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
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-4 tracking-tight">{t.faq.title}</motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-center text-sm text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            {t.faq.disclaimer}
          </motion.p>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {t.faq.items.map((f, i) => (
              <motion.div key={i} variants={fadeUp}>
                <AccordionItem value={`item-${i}`} className="border border-primary/10 px-6 rounded-2xl bg-white shadow-sm">
                  <AccordionTrigger className="text-start font-medium text-lg hover:no-underline hover:text-primary py-5">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">{f.a}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* 13. Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-800 relative overflow-hidden">
        <img src={LOGO_SRC} alt="" aria-hidden className="absolute -end-16 -bottom-16 h-72 opacity-[0.04]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img src={LOGO_SRC} alt="Enzora" className="h-12 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">{t.footer.quickLinks}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><button onClick={() => scrollTo("about")} className="hover:text-white transition-colors">{t.nav.about}</button></li>
                <li><button onClick={() => scrollTo("products")} className="hover:text-white transition-colors">{t.nav.products}</button></li>
                <li><button onClick={() => scrollTo("app")} className="hover:text-white transition-colors">{t.nav.app}</button></li>
                <li><button onClick={() => scrollTo("partners")} className="hover:text-white transition-colors">{t.nav.partners}</button></li>
                <li><button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">{t.nav.faq}</button></li>
                <li><Link href="/track-order" className="hover:text-white transition-colors">{t.footer.trackOrder}</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">{t.footer.adminLogin}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">{t.footer.contact}</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="mailto:hello@enzora.health" className="hover:text-white transition-colors">hello@enzora.health</a></li>
                <li className="text-gray-500 text-xs leading-relaxed pt-2">{t.footer.studentStartup}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-base mb-4">{t.footer.followEnzora}</h4>
              <SocialIcons variant="onDark" size="md" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm text-center md:text-start max-w-3xl leading-relaxed">
              {t.footer.legalDisclaimer}
            </p>
            <p className="text-gray-500 text-sm whitespace-nowrap">
              &copy; {new Date().getFullYear()} {t.footer.allRightsReserved}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
