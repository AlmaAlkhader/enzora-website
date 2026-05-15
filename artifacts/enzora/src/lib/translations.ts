export type Language = "en" | "ar";

export type Translations = typeof en;

const en = {
  nav: {
    about: "About",
    products: "Products",
    app: "App",
    partners: "Partners",
    faq: "FAQ",
    orderNow: "Order Now",
    followEnzora: "Follow Enzora",
  },
  hero: {
    badge: "Smart wound monitoring",
    headline1: "Smarter wound monitoring with a",
    headlineHighlight: "color-guided bandage",
    headline2: "and connected device.",
    subtext:
      "Enzora combines a pack of color-guided wound bandages with an optional smart sensor device. The bandage pack can be used on its own for simple visual monitoring, while the device makes monitoring more consistent through sensor reading and app updates.",
    buyBandage: "Buy Bandage Pack",
    getPackage: "Get Complete Package",
    learnMore: "Learn More",
  },
  about: {
    sectionLabel: "Who We Are",
    headline: "A student-founded medical technology startup, building smarter wound care.",
    para1:
      "Enzora is a student-founded medical technology startup from Birzeit University. We are developing a smart wound patch system that supports wound monitoring and helps users notice possible changes earlier through modern, accessible, and innovative technology.",
    para2:
      "Our goal is to make wound-care follow-up clearer for patients, caregivers, and healthcare providers, especially in situations where regular monitoring can be difficult.",
  },
  mission: {
    title: "Our Mission",
    body: "To develop smart medical solutions that improve patient care and make wound monitoring safer, clearer, and more effective by combining healthcare, engineering, and innovation.",
  },
  vision: {
    title: "Our Vision",
    body: "To be part of the future of smart healthcare by creating innovative solutions that make patients' lives easier, support continuous follow-up, and create a positive impact in the medical sector.",
  },
  bandage: {
    sectionLabel: "Product positioning",
    title: "More than a traditional bandage",
    para1:
      "Traditional dressings cover a wound. Enzora is designed to support a more active wound-care experience by combining a color-guided bandage with an optional smart monitoring device.",
    para2:
      "The Enzora bandage helps patients and caregivers visually notice color changes. When paired with the Enzora device, the system can read these changes more consistently and send updates to the mobile app.",
  },
  device: {
    sectionLabel: "Diabetic wound care",
    title: "Built for patients who need closer wound follow-up",
    para1:
      "Diabetic wounds can change quickly and require careful monitoring. Enzora is designed to support patients, caregivers, and clinics by making wound follow-up easier, clearer, and less dependent on guesswork.",
    para2:
      "For diabetic clinics and healthcare providers, Enzora can support a shift from occasional visual checking toward more consistent monitoring and timely awareness.",
    quote:
      "Enzora is especially valuable in situations where frequent clinical follow-up is difficult, including home recovery, elderly care, diabetic wound monitoring, and resource-limited settings.",
  },
  products: {
    title: "Choose your Enzora package",
    subtitle:
      "The bandage pack can be used on its own for simple visual monitoring. Add the smart device to make monitoring more consistent with sensor readings and app updates.",
    contactPricing: "Contact us for pricing",
    recommended: "Recommended",
    meta: {
      bandage_pack: {
        name: "Enzora Bandage Pack",
        description: "For simple visual color-guided monitoring at home.",
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
        name: "Enzora Smart Device",
        description: "Reads Enzora bandage color changes and connects to the mobile app.",
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
        name: "Complete Enzora Package",
        description: "The complete Enzora monitoring system: smart device and bandage pack.",
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
    },
  },
  order: {
    title: "Order Enzora",
    subtitle: "Choose your package and our team will follow up shortly.",
    connectLabel: "Connect with us",
    fullName: "Full name",
    fullNamePlaceholder: "e.g. Ahmad Al-Khalidi",
    email: "Email",
    emailPlaceholder: "e.g. ahmad@example.com",
    phone: "Phone number",
    phonePlaceholder: "+970 59 000 0000",
    country: "Country",
    selectCountry: "Select country",
    city: "City",
    selectCity: "Select city",
    customCity: "Enter your city",
    customCityPlaceholder: "Your city",
    product: "Product",
    selectProduct: "Select product",
    customerType: "Customer type",
    selectType: "Select type",
    message: "Message (optional)",
    messagePlaceholder: "Any questions or additional details about your order...",
    submit: "Submit Order Request",
    submitting: "Submitting...",
    successTitle: "Request Submitted",
    successBody:
      "Your Enzora order request was submitted successfully. Our team will contact you soon.",
    successBodyWithAmount: (ref: string, total: string) =>
      `Your order ${ref} has been submitted. Your estimated total is ${total}. Our team will contact you shortly to confirm payment details.`,
    successBodyNoAmount: (ref: string) =>
      `Your order ${ref} has been submitted. Our team will contact you soon to confirm pricing and arrange payment.`,
    successRef: "Ref:",
    submitAnother: "Submit another request",
    paymentMethod: "Payment Method",
    paymentMethodsUnavailable: "Payment methods are not available right now.",
    validation: {
      fullNameRequired: "Full name is required",
      invalidEmail: "Invalid email address",
      invalidPhone:
        "Enter a valid Palestinian phone number, e.g. +970 59 000 0000 or 0590000000",
      countryRequired: "Country is required",
      cityRequired: "City is required",
      customCityRequired: "Please enter your city",
      paymentMethodRequired: "Please select a payment method",
    },
    quantity: {
      bandage_pack: "Number of bandage packs",
      smart_device: "Number of devices",
      complete_package: "Number of complete packages",
    },
    quantityHint: {
      bandage_pack: (dt: string) =>
        `Each pack contains 5 bandages (${dt} per pack). Equivalent local payment options can be discussed after submission.`,
      smart_device: (dt: string) => `How many smart devices would you like? Price: ${dt}.`,
      complete_package: (dt: string) =>
        `Each package includes a device and a bandage pack (5 bandages). Price: ${dt}.`,
    },
    customerTypes: {
      patient: "Patient",
      caregiver: "Caregiver",
      clinic: "Clinic",
      hospital: "Hospital",
      research: "Research institution",
      other: "Other",
    },
    countries: {
      Palestine: "Palestine",
      Other: "Other",
    },
  },
  app: {
    sectionLabel: "Mobile app",
    title: "Designed to work with the Enzora mobile app",
    subtitle:
      "A clear, calm view of bandage status, color guidance, and healing progress. Real screenshots coming soon.",
    screens: [
      { label: "Healing well", caption: "Real-time wound status at a glance" },
      { label: "Watch closely", caption: "Clear visual color reference" },
      { label: "Infection alert", caption: "Track changes and stay informed" },
    ],
  },
  partners: {
    sectionLabel: "B2B Partnerships",
    title: "For clinics, hospitals, and medical distributors",
    para1:
      "The medical consumables market is moving toward smarter, more connected solutions. Enzora combines accessible wound-care materials with smart monitoring technology, creating a product line that can support patients, caregivers, and healthcare providers.",
    para2:
      "If you are a clinic, hospital, or medical distributor interested in Enzora, contact us to discuss partnership and distribution opportunities.",
    quote:
      "By supporting earlier awareness and clearer follow-up, Enzora aims to reduce uncertainty and support better wound-care decisions.",
    contactBtn: "Contact Enzora",
  },
  privacy: {
    sectionLabel: "Privacy-first by design",
    title: "Your data, treated with care",
    body: "Because wound-care monitoring may involve sensitive information, Enzora is designed with privacy, transparency, consent, and responsible data handling in mind.",
    items: [
      "Transparent data practices",
      "Clear consent throughout",
      "Responsible storage & access",
      "GDPR-aware approach",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    disclaimer:
      "Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment.",
    items: [
      {
        q: "Is Enzora a replacement for a doctor?",
        a: "No. Enzora is a monitoring support tool designed to help you stay aware of visual changes. It does not replace professional medical advice, diagnosis, or treatment.",
      },
      {
        q: "Can I buy only the bandage pack?",
        a: "Yes. The Enzora bandage pack contains 5 bandages for $20 ($4 per bandage) and can be used on its own for simple visual color-based monitoring.",
      },
      {
        q: "What does the smart device add?",
        a: "The device reads bandage color more consistently than manual checking, helps track changes over time, and sends updates to the Enzora mobile app.",
      },
      {
        q: "How much do the device and complete package cost?",
        a: "The Enzora Smart Device and the Complete Enzora Package are available on request — please contact us for pricing.",
      },
      {
        q: "Who is Enzora for?",
        a: "Enzora is designed for people who need closer wound follow-up, including diabetic wound care, post-surgery recovery, elderly care, and home recovery situations where frequent clinical follow-up is difficult.",
      },
      {
        q: "Can caregivers use it?",
        a: "Yes. Caregivers can use the bandage and the app to support family members or patients during recovery.",
      },
      {
        q: "How is my data handled?",
        a: "Because wound-care monitoring may involve sensitive information, Enzora is designed with privacy, transparency, consent, and responsible data handling in mind.",
      },
    ],
  },
  footer: {
    tagline:
      "Smarter wound monitoring with a color-guided bandage and connected device — bringing clarity and calm to recovery at home.",
    quickLinks: "Quick Links",
    contact: "Contact",
    followEnzora: "Follow Enzora",
    studentStartup: "A student-founded medical technology startup from Birzeit University.",
    adminLogin: "Admin Login",
    allRightsReserved: "Enzora.",
    legalDisclaimer:
      "Enzora is a monitoring support tool and does not replace professional medical advice, diagnosis, or treatment. Always consult your healthcare provider.",
  },
  cities: {
    Ramallah: "Ramallah",
    "Al-Bireh": "Al-Bireh",
    Jerusalem: "Jerusalem",
    Nablus: "Nablus",
    Hebron: "Hebron",
    Bethlehem: "Bethlehem",
    Jenin: "Jenin",
    Tulkarm: "Tulkarm",
    Qalqilya: "Qalqilya",
    Salfit: "Salfit",
    Jericho: "Jericho",
    Tubas: "Tubas",
    Gaza: "Gaza",
    "Khan Younis": "Khan Younis",
    Rafah: "Rafah",
    Other: "Other",
  },
};

const ar: Translations = {
  nav: {
    about: "حولنا",
    products: "المنتجات",
    app: "التطبيق",
    partners: "الشراكات",
    faq: "الأسئلة الشائعة",
    orderNow: "اطلب الآن",
    followEnzora: "تابع إنزورا",
  },
  hero: {
    badge: "مراقبة ذكية للجروح",
    headline1: "مراقبة أذكى للجروح مع",
    headlineHighlight: "ضمادة موجَّهة بالألوان",
    headline2: "وجهاز متصل.",
    subtext:
      "تجمع إنزورا بين حزمة ضمادات جروح موجَّهة بالألوان وجهاز استشعار ذكي اختياري. يمكن استخدام حزمة الضمادات بمفردها للمراقبة البصرية البسيطة، بينما يجعل الجهاز المراقبة أكثر اتساقًا من خلال قراءة الاستشعار وتحديثات التطبيق.",
    buyBandage: "اشترِ حزمة الضمادات",
    getPackage: "احصل على الحزمة الكاملة",
    learnMore: "اعرف المزيد",
  },
  about: {
    sectionLabel: "من نحن",
    headline: "شركة ناشئة في مجال التكنولوجيا الطبية أسسها طلاب، تبني رعاية أذكى للجروح.",
    para1:
      "إنزورا شركة ناشئة في مجال التكنولوجيا الطبية أسسها طلاب من جامعة بيرزيت. نطوّر نظام رقعة ذكية للجروح يدعم مراقبة الجروح ويساعد المستخدمين على ملاحظة التغييرات المحتملة في وقت مبكر من خلال تقنيات حديثة وسهلة الاستخدام ومبتكرة.",
    para2:
      "هدفنا هو جعل متابعة رعاية الجروح أوضح للمرضى ومقدمي الرعاية والمهنيين الصحيين، لا سيما في الحالات التي قد تكون فيها المراقبة المنتظمة صعبة.",
  },
  mission: {
    title: "مهمتنا",
    body: "تطوير حلول طبية ذكية ترفع جودة رعاية المريض وتجعل مراقبة الجروح أكثر أمانًا ووضوحًا وفاعلية من خلال الجمع بين الرعاية الصحية والهندسة والابتكار.",
  },
  vision: {
    title: "رؤيتنا",
    body: "أن نكون جزءًا من مستقبل الرعاية الصحية الذكية من خلال ابتكار حلول تُيسّر حياة المرضى وتدعم المتابعة المستمرة وتُحدث تأثيرًا إيجابيًا في القطاع الطبي.",
  },
  bandage: {
    sectionLabel: "تموضع المنتج",
    title: "أكثر من مجرد ضمادة تقليدية",
    para1:
      "تُغطّي الضمادات التقليدية الجرح فحسب. صُمِّمت إنزورا لتدعم تجربة أكثر فاعلية في رعاية الجروح من خلال الجمع بين ضمادة موجَّهة بالألوان وجهاز مراقبة ذكي اختياري.",
    para2:
      "تساعد ضمادة إنزورا المرضى ومقدمي الرعاية على ملاحظة تغيرات الألوان بصريًا. وعند إقرانها بجهاز إنزورا، يستطيع النظام قراءة هذه التغيرات بشكل أكثر اتساقًا وإرسال تحديثات إلى تطبيق الهاتف.",
  },
  device: {
    sectionLabel: "رعاية جروح السكري",
    title: "مصمَّم للمرضى الذين يحتاجون إلى متابعة أوثق للجروح",
    para1:
      "يمكن أن تتغير جروح السكري بسرعة وتستلزم مراقبة دقيقة. صُمِّمت إنزورا لدعم المرضى ومقدمي الرعاية والعيادات من خلال تسهيل متابعة الجروح وجعلها أوضح وأقل اعتمادًا على التخمين.",
    para2:
      "بالنسبة لعيادات السكري ومقدمي الرعاية الصحية، يمكن لإنزورا دعم التحول من الفحص البصري العرضي نحو مراقبة أكثر اتساقًا وإدراك في الوقت المناسب.",
    quote:
      "إنزورا ذات قيمة خاصة في الحالات التي يصعب فيها إجراء متابعة سريرية متكررة، بما يشمل التعافي المنزلي ورعاية المسنين ومراقبة جروح السكري والبيئات محدودة الموارد.",
  },
  products: {
    title: "اختر حزمة إنزورا الخاصة بك",
    subtitle:
      "يمكن استخدام حزمة الضمادات بمفردها للمراقبة البصرية البسيطة. أضف الجهاز الذكي لجعل المراقبة أكثر اتساقًا مع قراءات الاستشعار وتحديثات التطبيق.",
    contactPricing: "تواصل معنا للاستفسار عن السعر",
    recommended: "موصى به",
    meta: {
      bandage_pack: {
        name: "حزمة ضمادات إنزورا",
        description: "للمراقبة البصرية البسيطة الموجَّهة بالألوان في المنزل.",
        subtitle: "٥ ضمادات في الحزمة",
        features: [
          "٥ ضمادات في الحزمة",
          "إرشاد بصري قائم على الألوان",
          "لا يحتاج إلى جهاز",
        ],
        cta: "اشترِ حزمة الضمادات",
        highlight: false,
      },
      smart_device: {
        name: "جهاز إنزورا الذكي",
        description: "يقرأ تغيرات ألوان ضمادة إنزورا ويتصل بتطبيق الهاتف.",
        subtitle: "يُباع بشكل منفصل",
        features: [
          "قراءة اللون بالاستشعار",
          "يتصل بتطبيق إنزورا للهاتف",
          "مناسب لمقدمي الرعاية",
          "يعمل مع ضمادات إنزورا",
        ],
        cta: "تواصل مع المبيعات",
        highlight: false,
      },
      complete_package: {
        name: "حزمة إنزورا الكاملة",
        description: "نظام مراقبة إنزورا الكامل: الجهاز الذكي وحزمة الضمادات.",
        subtitle: "الجهاز + حزمة الضمادات",
        features: [
          "جهاز استشعار ذكي",
          "حزمة ضمادات مرفقة (٥ ضمادات)",
          "تحديثات الحالة عبر التطبيق",
          "الأفضل للمراقبة المستمرة في المنزل",
        ],
        cta: "احصل على الحزمة الكاملة",
        highlight: true,
      },
    },
  },
  order: {
    title: "اطلب إنزورا",
    subtitle: "اختر حزمتك وسيتابع معك فريقنا قريبًا.",
    connectLabel: "تواصل معنا",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "مثال: أحمد الخالدي",
    email: "البريد الإلكتروني",
    emailPlaceholder: "مثال: ahmad@example.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "+970 59 000 0000",
    country: "الدولة",
    selectCountry: "اختر الدولة",
    city: "المدينة",
    selectCity: "اختر المدينة",
    customCity: "أدخل مدينتك",
    customCityPlaceholder: "مدينتك",
    product: "المنتج",
    selectProduct: "اختر المنتج",
    customerType: "نوع العميل",
    selectType: "اختر النوع",
    message: "رسالة (اختياري)",
    messagePlaceholder: "أي أسئلة أو تفاصيل إضافية حول طلبك...",
    submit: "إرسال طلب الشراء",
    submitting: "جارٍ الإرسال...",
    successTitle: "تم إرسال الطلب",
    successBody:
      "تم إرسال طلب إنزورا الخاص بك بنجاح. سيتواصل معك فريقنا قريبًا.",
    successBodyWithAmount: (ref: string, total: string) =>
      `تم تقديم طلبك ${ref} بنجاح. المبلغ الإجمالي المقدّر هو ${total}. سيتواصل معك فريقنا قريباً لتأكيد تفاصيل الدفع.`,
    successBodyNoAmount: (ref: string) =>
      `تم تقديم طلبك ${ref} بنجاح. سيتواصل معك فريقنا قريباً لتأكيد التسعير وترتيب الدفع.`,
    successRef: "المرجع:",
    submitAnother: "إرسال طلب آخر",
    paymentMethod: "طريقة الدفع",
    paymentMethodsUnavailable: "طرق الدفع غير متاحة حالياً.",
    validation: {
      fullNameRequired: "الاسم الكامل مطلوب",
      invalidEmail: "عنوان البريد الإلكتروني غير صالح",
      invalidPhone:
        "أدخل رقم هاتف فلسطيني صالحًا، مثال: +970 59 000 0000 أو 0590000000",
      countryRequired: "الدولة مطلوبة",
      cityRequired: "المدينة مطلوبة",
      customCityRequired: "يرجى إدخال مدينتك",
      paymentMethodRequired: "يرجى اختيار طريقة الدفع",
    },
    quantity: {
      bandage_pack: "عدد حزم الضمادات",
      smart_device: "عدد الأجهزة",
      complete_package: "عدد الحزم الكاملة",
    },
    quantityHint: {
      bandage_pack: (dt: string) =>
        `تحتوي كل حزمة على ٥ ضمادات (${dt} للحزمة). يمكن مناقشة خيارات الدفع المحلية المعادلة بعد الإرسال.`,
      smart_device: (dt: string) => `كم جهازًا ذكيًا تريد؟ السعر: ${dt}.`,
      complete_package: (dt: string) =>
        `تتضمن كل حزمة جهازًا وحزمة ضمادات (٥ ضمادات). السعر: ${dt}.`,
    },
    customerTypes: {
      patient: "مريض",
      caregiver: "مقدم رعاية",
      clinic: "عيادة",
      hospital: "مستشفى",
      research: "مؤسسة بحثية",
      other: "أخرى",
    },
    countries: {
      Palestine: "فلسطين",
      Other: "أخرى",
    },
  },
  app: {
    sectionLabel: "تطبيق الهاتف",
    title: "مصمَّم للعمل مع تطبيق إنزورا للهاتف",
    subtitle:
      "عرض واضح وهادئ لحالة الضمادة وإرشادات الألوان ومستوى التعافي. لقطات حقيقية قريبًا.",
    screens: [
      { label: "التعافي جيد", caption: "حالة الجرح لحظيًا في لمحة" },
      { label: "مراقبة دقيقة", caption: "مرجع بصري واضح للألوان" },
      { label: "تنبيه عدوى", caption: "تابع التغيرات وابقَ على اطلاع" },
    ],
  },
  partners: {
    sectionLabel: "شراكات الأعمال",
    title: "للعيادات والمستشفيات والموزعين الطبيين",
    para1:
      "يتجه سوق المستهلكات الطبية نحو حلول أكثر ذكاءً وترابطًا. تجمع إنزورا بين مواد رعاية الجروح الميسورة وتقنية المراقبة الذكية، مما يخلق خطًا من المنتجات يدعم المرضى ومقدمي الرعاية والمهنيين الصحيين.",
    para2:
      "إذا كنت عيادة أو مستشفى أو موزعًا طبيًا مهتمًا بإنزورا، تواصل معنا لمناقشة فرص الشراكة والتوزيع.",
    quote:
      "من خلال دعم الوعي المبكر والمتابعة الأوضح، تهدف إنزورا إلى تقليل الغموض ودعم قرارات رعاية الجروح الأفضل.",
    contactBtn: "تواصل مع إنزورا",
  },
  privacy: {
    sectionLabel: "الخصوصية في صميم التصميم",
    title: "بياناتك، بعناية فائقة",
    body: "نظرًا لأن مراقبة رعاية الجروح قد تتضمن معلومات حساسة، صُمِّمت إنزورا مع مراعاة الخصوصية والشفافية والموافقة والتعامل المسؤول مع البيانات.",
    items: [
      "ممارسات شفافة للبيانات",
      "موافقة واضحة في كل خطوة",
      "تخزين ووصول مسؤول",
      "نهج متوافق مع اللائحة الأوروبية",
    ],
  },
  faq: {
    title: "الأسئلة الشائعة",
    disclaimer:
      "إنزورا أداة دعم للمراقبة ولا تحل محل المشورة الطبية المتخصصة أو التشخيص أو العلاج.",
    items: [
      {
        q: "هل إنزورا بديل عن الطبيب؟",
        a: "لا. إنزورا أداة دعم للمراقبة مصممة لمساعدتك على متابعة التغيرات البصرية. هي لا تحل محل المشورة الطبية المتخصصة أو التشخيص أو العلاج.",
      },
      {
        q: "هل يمكنني شراء حزمة الضمادات فقط؟",
        a: "نعم. تحتوي حزمة ضمادات إنزورا على ٥ ضمادات بسعر ٢٠ دولارًا (٤ دولارات للضمادة) ويمكن استخدامها بمفردها للمراقبة البصرية البسيطة القائمة على الألوان.",
      },
      {
        q: "ماذا يضيف الجهاز الذكي؟",
        a: "يقرأ الجهاز لون الضمادة بشكل أكثر اتساقًا من الفحص اليدوي، ويساعد على تتبع التغيرات بمرور الوقت، ويرسل تحديثات إلى تطبيق إنزورا للهاتف.",
      },
      {
        q: "كم يكلف الجهاز والحزمة الكاملة؟",
        a: "الجهاز الذكي من إنزورا والحزمة الكاملة متاحان عند الطلب — يرجى التواصل معنا للاستفسار عن الأسعار.",
      },
      {
        q: "لمن تناسب إنزورا؟",
        a: "صُمِّمت إنزورا للأشخاص الذين يحتاجون إلى متابعة أوثق للجروح، بما يشمل رعاية جروح السكري والتعافي بعد الجراحة ورعاية المسنين وحالات التعافي المنزلي حيث تكون المتابعة السريرية المتكررة صعبة.",
      },
      {
        q: "هل يمكن لمقدمي الرعاية استخدامها؟",
        a: "نعم. يمكن لمقدمي الرعاية استخدام الضمادة والتطبيق لدعم أفراد الأسرة أو المرضى خلال فترة التعافي.",
      },
      {
        q: "كيف يتم التعامل مع بياناتي؟",
        a: "نظرًا لأن مراقبة رعاية الجروح قد تتضمن معلومات حساسة، صُمِّمت إنزورا مع مراعاة الخصوصية والشفافية والموافقة والتعامل المسؤول مع البيانات.",
      },
    ],
  },
  footer: {
    tagline:
      "مراقبة أذكى للجروح مع ضمادة موجَّهة بالألوان وجهاز متصل — لإضفاء الوضوح والطمأنينة على التعافي في المنزل.",
    quickLinks: "روابط سريعة",
    contact: "التواصل",
    followEnzora: "تابع إنزورا",
    studentStartup: "شركة ناشئة في مجال التكنولوجيا الطبية أسسها طلاب من جامعة بيرزيت.",
    adminLogin: "تسجيل دخول المشرف",
    allRightsReserved: "إنزورا.",
    legalDisclaimer:
      "إنزورا أداة دعم للمراقبة ولا تحل محل المشورة الطبية المتخصصة أو التشخيص أو العلاج. استشر دائمًا مقدم الرعاية الصحية الخاص بك.",
  },
  cities: {
    Ramallah: "رام الله",
    "Al-Bireh": "البيرة",
    Jerusalem: "القدس",
    Nablus: "نابلس",
    Hebron: "الخليل",
    Bethlehem: "بيت لحم",
    Jenin: "جنين",
    Tulkarm: "طولكرم",
    Qalqilya: "قلقيلية",
    Salfit: "سلفيت",
    Jericho: "أريحا",
    Tubas: "طوباس",
    Gaza: "غزة",
    "Khan Younis": "خان يونس",
    Rafah: "رفح",
    Other: "أخرى",
  },
};

export const translations: Record<Language, Translations> = { en, ar };
