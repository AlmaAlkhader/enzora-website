import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrderBody } from "@workspace/api-zod";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Menu, X, Activity, Smartphone, Clock, Bell, Circle, CheckCircle2, Navigation, Heart, Shield, ShieldCheck } from "lucide-react";

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
      quantity: 1,
      message: ""
    }
  });

  const onSubmit = (data: any) => {
    orderMutation.mutate({ data }, {
      onSuccess: (res) => {
        setOrderSuccessRef(res.reference);
        form.reset();
      }
    });
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary tracking-tight">Enzora</div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            <button onClick={() => scrollTo('about')} className="hover:text-primary transition-colors">About</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-primary transition-colors">How It Works</button>
            <button onClick={() => scrollTo('features')} className="hover:text-primary transition-colors">Features</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-primary transition-colors">FAQ</button>
            <Button onClick={() => scrollTo('order')} className="rounded-full px-6">Order Now</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col gap-4">
            <button onClick={() => scrollTo('about')} className="text-left font-medium p-2">About</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-left font-medium p-2">How It Works</button>
            <button onClick={() => scrollTo('features')} className="text-left font-medium p-2">Features</button>
            <button onClick={() => scrollTo('faq')} className="text-left font-medium p-2">FAQ</button>
            <Button onClick={() => scrollTo('order')} className="w-full">Order Now</Button>
          </div>
        )}
      </nav>

      {/* 2. Hero */}
      <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary font-medium">
            <Activity className="w-4 h-4 mr-2" /> Smart wound monitoring
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Smarter wound monitoring from home.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enzora monitors wound bandage color changes using a compact sensor device connected to a simple mobile app, helping patients and caregivers stay more aware during recovery.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 text-base h-12" onClick={() => scrollTo('order')}>
              Order Now
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12 border-2" onClick={() => scrollTo('how-it-works')}>
              See How It Works
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-8 border-t">
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
          </div>
        </div>
        
        <div className="relative mx-auto w-full max-w-md">
          {/* Mockup composition */}
          <div className="relative w-full aspect-[4/5] bg-gradient-to-tr from-secondary to-blue-50 rounded-3xl p-8 flex items-center justify-center border shadow-xl">
            {/* Phone Mockup */}
            <div className="w-[280px] h-[580px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
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
                    <span className="text-primary font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent"></span> Connected</span>
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
                  <div className="w-24 h-24 rounded-full bg-accent/20 animate-pulse absolute"></div>
                  <div className="w-16 h-16 rounded-full bg-accent shadow-[0_0_20px_rgba(25,200,154,0.5)]"></div>
                </div>
              </div>
            </div>
            
            {/* Device Mockup */}
            <div className="absolute -bottom-6 -right-6 w-44 h-24 bg-white rounded-xl shadow-xl border border-gray-100 flex items-center p-4 gap-4 rotate-[6deg] hover:rotate-0 transition-transform duration-500 z-20">
              <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(25,200,154,0.8)] animate-pulse"></div>
              <div>
                <div className="text-sm font-bold text-primary">Enzora Sensor</div>
                <div className="text-xs text-muted-foreground">Syncing...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem */}
      <section className="py-24 bg-white border-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-foreground">Why home wound monitoring needs to be simpler</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-secondary/50 border space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Late visual changes can be missed</h3>
            </div>
            <div className="p-8 rounded-2xl bg-secondary/50 border space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Patients may feel unsure</h3>
            </div>
            <div className="p-8 rounded-2xl bg-secondary/50 border space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">Caregivers need clearer signals</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About */}
      <section id="about" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Enzora</h2>
              <p className="text-lg text-muted-foreground">We build technology that brings clarity and calm to the recovery process.</p>
            </div>
            <div className="space-y-6">
              <div className="p-8 bg-white border rounded-2xl shadow-sm">
                <div className="text-primary font-semibold mb-2">Our Mission</div>
                <p className="text-foreground leading-relaxed">To make wound monitoring easier, clearer, and more accessible for patients and caregivers.</p>
              </div>
              <div className="p-8 bg-white border rounded-2xl shadow-sm">
                <div className="text-primary font-semibold mb-2">Our Vision</div>
                <p className="text-foreground leading-relaxed">To make smart wound-care monitoring a normal part of recovery at home and in healthcare settings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16.6%] right-[16.6%] h-0.5 bg-white/20"></div>
            
            <div className="relative space-y-6 text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white text-primary rounded-full flex items-center justify-center shadow-xl text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold">Place the device</h3>
              <p className="text-white/80">Attach the Enzora device above the wound bandage after dressing.</p>
            </div>
            
            <div className="relative space-y-6 text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white text-primary rounded-full flex items-center justify-center shadow-xl text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold">Sensor monitors color</h3>
              <p className="text-white/80">The color sensor tracks visible bandage color changes that may need attention.</p>
            </div>
            
            <div className="relative space-y-6 text-center z-10">
              <div className="w-24 h-24 mx-auto bg-white text-primary rounded-full flex items-center justify-center shadow-xl text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold">Check the mobile app</h3>
              <p className="text-white/80">The app shows simple status updates and guidance so the user knows what to do next.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Features */}
      <section id="features" className="py-24 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Color-based monitoring", icon: <Circle className="w-6 h-6" />, desc: "Optical sensors detect subtle color variations." },
              { title: "Connected mobile app", icon: <Smartphone className="w-6 h-6" />, desc: "Syncs instantly for clear status displays." },
              { title: "Real-time updates", icon: <Activity className="w-6 h-6" />, desc: "Continuous 24/7 visibility into bandage status." },
              { title: "Caregiver-friendly alerts", icon: <Bell className="w-6 h-6" />, desc: "Keeps the support team informed." },
              { title: "Simple color guide", icon: <ShieldCheck className="w-6 h-6" />, desc: "Easy-to-understand visual indicators." },
              { title: "Compact reusable device", icon: <Shield className="w-6 h-6" />, desc: "Small, comfortable, and built to last." }
            ].map((f, i) => (
              <div key={i} className="p-6 border rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. App Preview */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Designed to work with the Enzora mobile app</h2>
        </div>
        
        <div className="flex justify-start md:justify-center gap-8 px-6 pb-8 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {/* Mockup 1 */}
          <div className="snap-center shrink-0 w-[260px] h-[540px] bg-white border-[6px] border-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col relative">
             <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-24 mx-auto z-10"></div>
             <div className="bg-primary pt-14 pb-8 px-4 text-white text-center">
               <div className="font-medium text-sm opacity-90 mb-1">Status</div>
               <div className="text-3xl font-bold">Normal</div>
             </div>
             <div className="flex-1 bg-gray-50 p-4 space-y-3">
               <div className="bg-white p-4 rounded-xl border text-sm">
                 <div className="text-muted-foreground mb-1 text-xs">Device Battery</div>
                 <div className="font-medium">85%</div>
               </div>
               <div className="bg-white p-4 rounded-xl border text-sm">
                 <div className="text-muted-foreground mb-1 text-xs">Last Sync</div>
                 <div className="font-medium">2 mins ago</div>
               </div>
             </div>
          </div>
          {/* Mockup 2 */}
          <div className="snap-center shrink-0 w-[260px] h-[540px] bg-white border-[6px] border-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col relative md:mt-8">
             <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-24 mx-auto z-10"></div>
             <div className="pt-14 px-4 pb-4 bg-white border-b">
               <div className="font-semibold text-lg text-center">Healing Progress</div>
             </div>
             <div className="flex-1 bg-gray-50 p-6">
               <div className="space-y-6">
                 <div className="flex gap-4 relative">
                   <div className="w-3 h-3 rounded-full bg-accent mt-1 z-10 relative"></div>
                   <div className="absolute left-[5px] top-3 bottom-[-32px] w-0.5 bg-accent"></div>
                   <div className="pb-2">
                     <div className="font-medium text-sm">Day 4: Normal</div>
                     <div className="text-xs text-muted-foreground mt-1">Color sensor green</div>
                   </div>
                 </div>
                 <div className="flex gap-4 relative">
                   <div className="w-3 h-3 rounded-full bg-accent mt-1 z-10 relative"></div>
                   <div className="absolute left-[5px] top-3 bottom-[-32px] w-0.5 bg-gray-200"></div>
                   <div className="pb-2">
                     <div className="font-medium text-sm">Day 3: Normal</div>
                     <div className="text-xs text-muted-foreground mt-1">Color sensor green</div>
                   </div>
                 </div>
                 <div className="flex gap-4 relative">
                   <div className="w-3 h-3 rounded-full bg-gray-300 mt-1 z-10 relative"></div>
                   <div className="pb-2">
                     <div className="font-medium text-sm">Day 2: Normal</div>
                     <div className="text-xs text-muted-foreground mt-1">Initial placement</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
          {/* Mockup 3 */}
          <div className="snap-center shrink-0 w-[260px] h-[540px] bg-white border-[6px] border-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col relative">
             <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-24 mx-auto z-10"></div>
             <div className="pt-14 px-4 pb-4 bg-white border-b">
               <div className="font-semibold text-lg text-center">Color Guide</div>
             </div>
             <div className="flex-1 bg-gray-50 p-4 space-y-4">
               <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                 <div className="w-4 h-4 rounded-full bg-yellow-400 mb-2"></div>
                 <div className="font-medium text-sm text-yellow-900">Normal</div>
               </div>
               <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                 <div className="w-4 h-4 rounded-full bg-green-500 mb-2"></div>
                 <div className="font-medium text-sm text-green-900">Watch</div>
               </div>
               <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                 <div className="w-4 h-4 rounded-full bg-blue-500 mb-2"></div>
                 <div className="font-medium text-sm text-blue-900">Contact Dr.</div>
               </div>
             </div>
          </div>
          {/* Mockup 4 */}
          <div className="snap-center shrink-0 w-[260px] h-[540px] bg-white border-[6px] border-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col relative md:mt-8">
             <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-24 mx-auto z-10"></div>
             <div className="pt-14 px-4 pb-4 bg-white border-b">
               <div className="font-semibold text-lg text-center">Care Tips</div>
             </div>
             <div className="flex-1 bg-gray-50 p-4 space-y-4">
               <div className="bg-white p-4 rounded-xl border text-sm space-y-2">
                 <div className="font-medium">Keep area dry</div>
                 <div className="text-muted-foreground text-xs leading-relaxed">Ensure the bandage remains dry during showers.</div>
               </div>
               <div className="bg-white p-4 rounded-xl border text-sm space-y-2">
                 <div className="font-medium">Device cleaning</div>
                 <div className="text-muted-foreground text-xs leading-relaxed">Wipe the Enzora device with a soft dry cloth before reuse.</div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 8. Color Guide */}
      <section className="py-24 bg-white border-y">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple color-based guidance</h2>
            <p className="text-muted-foreground text-lg">The app translates sensor data into simple color indicators.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-8 rounded-3xl bg-yellow-50 border border-yellow-200 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-400 mx-auto mb-6 shadow-md border-4 border-white"></div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Yellow</h3>
              <p className="text-yellow-800 font-medium">Normal monitoring</p>
            </div>
            <div className="p-8 rounded-3xl bg-green-50 border border-green-200 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500 mx-auto mb-6 shadow-md border-4 border-white"></div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Green</h3>
              <p className="text-green-800 font-medium">Watch carefully</p>
            </div>
            <div className="p-8 rounded-3xl bg-blue-50 border border-blue-200 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto mb-6 shadow-md border-4 border-white"></div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Blue</h3>
              <p className="text-blue-800 font-medium">Contact a doctor</p>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground px-6 py-4 bg-gray-50 rounded-xl">
            <strong>Note:</strong> These color indicators are supportive guidance and do not replace professional diagnosis. Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment.
          </div>
        </div>
      </section>

      {/* 9. Product */}
      <section className="py-24 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-lg border grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-8 leading-tight">Smart Infection-Monitoring Bandage Device</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">Color Sensor</span>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">WiFi Sync</span>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">App Alerts</span>
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">Reusable</span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">Device size 6 × 3 × 2 cm</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">WiFi connection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">Color sensor monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">Mobile app synchronization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">Reusable device design</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                  <span className="text-lg">Simple patient-friendly interface</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50/80 rounded-[2rem] aspect-square flex items-center justify-center p-8 border">
              <div className="w-full max-w-[280px] h-40 bg-white rounded-3xl shadow-2xl border flex items-center justify-between px-8 relative hover:scale-105 transition-transform duration-500 cursor-default">
                <div className="w-6 h-6 rounded-full bg-accent shadow-[0_0_20px_rgba(25,200,154,0.6)] animate-pulse"></div>
                <div className="space-y-2 text-right">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full ml-auto"></div>
                  <div className="w-10 h-1.5 bg-gray-200 rounded-full ml-auto"></div>
                  <div className="w-14 h-1.5 bg-gray-200 rounded-full ml-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Who It Helps */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Who It Helps</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Diabetic patients", "Post-surgery patients", "Elderly patients", "Caregivers", "Clinics and hospitals"].map((who, i) => (
              <div key={i} className="px-8 py-5 bg-secondary/50 rounded-2xl border font-medium text-lg text-center hover:bg-secondary transition-colors cursor-default">
                {who}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Order Form */}
      <section id="order" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Order Enzora</h2>
            <p className="text-primary-foreground/80 text-lg">Request your device today.</p>
          </div>
          
          <div className="bg-white text-foreground p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
            {orderSuccessRef ? (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold">Request Submitted</h3>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">Your Enzora order request was submitted successfully. Our team will contact you soon.</p>
                <div className="inline-block bg-gray-50 border px-6 py-3 rounded-xl font-mono font-medium text-base mt-4">
                  Ref: {orderSuccessRef}
                </div>
                <div className="pt-10">
                  <Button variant="outline" size="lg" className="rounded-full" onClick={() => setOrderSuccessRef(null)}>Submit another request</Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane@example.com" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 000-0000" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country / City</FormLabel>
                          <FormControl>
                            <Input placeholder="United States, NY" className="h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} className="h-12" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any additional information..." className="resize-none h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-full mt-4" disabled={orderMutation.isPending}>
                    {orderMutation.isPending ? "Submitting..." : "Submit Order Request"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">Is Enzora a replacement for a doctor?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                No. Enzora is a monitoring support tool designed to help you stay aware of visual changes. It does not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical decisions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">Who can use Enzora?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Enzora is designed for patients recovering at home, their caregivers, and clinical professionals who want an extra layer of visibility into the healing process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">How does the device connect to the app?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                The device uses a standard WiFi connection to securely sync data to your Enzora mobile app, ensuring you get continuous updates even if you're not in the same room.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">What do the colors mean?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yellow indicates normal monitoring. Green suggests you should watch the area carefully. Blue is a signal to contact a doctor. These are supportive guides to help you know when to seek professional advice.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">Can caregivers use it?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yes, caregivers can install the app and receive updates, making it easier to support family members or patients during their recovery process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">How can I order Enzora?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                You can request a device by filling out the order form on this website. Our team will follow up to confirm details and arrange shipment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7" className="border px-6 rounded-2xl bg-gray-50/50">
              <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary py-6">Is the device reusable?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                Yes, the Enzora device is designed to be reusable. It sits above the actual wound bandage, keeping it clean and ready for continued use.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 13. Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="font-bold text-3xl tracking-tight">Enzora</div>
              <p className="text-gray-400 max-w-sm text-lg leading-relaxed">
                Smarter wound monitoring from home. Bringing clarity and calm to the recovery process.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="mailto:hello@enzora.health" className="hover:text-white transition-colors">hello@enzora.health</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
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
