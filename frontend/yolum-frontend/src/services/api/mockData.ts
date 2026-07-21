import type {
  BlogPost,
  FaqItem,
  Game,
  MentorSession,
  Notification,
  PricingPlan,
  Review,
  Transaction,
} from "@/types"

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Başlanğıc",
    priceMonthly: 0,
    description: "IT sahəsinə giriş üçün sadə və başlanğıc plan",
    ctaLabel: "Başla",
    features: [
      { label: "Ayda 30 sorğu", description: "AI vasitəsilə suallar verərək sahələri araşdır" },
      { label: "1 pulsuz canlı online dərsə giriş (coming soon)", description: "Canlı dərslərlə ilkin bilik əldə et" },
      { label: "Sənə uyğun sahə üzrə roadmap", description: "Maraqlarına uyğun öyrənmə istiqaməti təqdim olunur" },
      { label: "Sənə uyğun roadmap (50%)", description: "Qismən fərdiləşdirilmiş öyrənmə planı" },
    ],
  },
  {
    id: "standard",
    name: "Standart",
    priceMonthly: 15,
    description: "Daha çox dəstək və istiqamətlə öyrən",
    ctaLabel: "Daxil ol",
    highlighted: true,
    features: [
      { label: "Ayda 200 sorğu", description: "Daha aktiv istifadə və daha geniş araşdırma imkanı" },
      { label: "2 pulsuz canlı online dərsə giriş", description: "Müxtəlif mövzular üzrə əlavə bilik qazan" },
      { label: "Mentorlarla 15 dəqiqəlik görüş", description: "Qısa və effektiv mentor dəstəyi əldə et" },
      { label: "Sənə uyğun roadmap (70%)", description: "Qismən fərdiləşdirilmiş öyrənmə planı" },
      { label: "Portfolio və inkişafın izlənməsi", description: "İnkişafını və gördüyün işləri rahat izləyə bil" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceMonthly: 25,
    description: "Tam fərdiləşdirilmiş və maksimum inkişaf planı",
    ctaLabel: "Başla",
    features: [
      { label: "Ayda 500 sorğu", description: "Geniş istifadə imkanı ilə limitsizə yaxın təcrübə" },
      { label: "3 pulsuz canlı online dərsə giriş", description: "Daha çox praktiki və canlı öyrənmə imkanı" },
      { label: "Mentorlarla 30 dəqiqəlik görüş", description: "Daha dərin və detallı mentor dəstəyi" },
      { label: "Full roadmap (100%)", description: "Tam fərdiləşdirilmiş, addım-addım öyrənmə planı" },
      { label: "Portfolio və inkişafın izlənməsi", description: "Tam nəzarət və inkişaf analizləri" },
    ],
  },
]

export const faqItems: FaqItem[] = [
  {
    question: "Hansı IT sahəsinin mənə uyğun olduğundan əmin deyiləm?",
    answer:
      "Aira adlı AI köməkçimiz sənə bir neçə sual verərək maraqlarını, bacarıq səviyyəni və məqsədlərini müəyyən edir, sonra bunlara uyğun 2-3 IT sahəsi təklif edir və hər biri üçün fərdi roadmap hazırlayır.",
  },
  {
    question: "Mentor sessiyaları necə keçirilir?",
    answer:
      "Sessiyaları planına uyğun olaraq 10 dəqiqədən 2 saata qədər seçə bilərsən. Görüşlər Google Meet üzərindən onlayn keçirilir.",
  },
  {
    question: "Roadmap-ı sonradan dəyişə bilərəmmi?",
    answer:
      "Bəli. İstənilən vaxt Yol xəritəni dəyiş bölməsindən yeni sahə seçərək fərqli bir roadmap-a keçə bilərsən.",
  },
  {
    question: "Premium planın pulsuz plandan fərqi nədir?",
    answer:
      "Premium planda limitsizə yaxın AI sorğusu, tam fərdiləşdirilmiş roadmap, daha uzun mentor sessiyaları var.",
  },
  {
    question: "Mentor olmaq üçün necə müraciət edə bilərəm?",
    answer:
      "Mentor kimi qoşul düyməsindən qeydiyyat formunu doldurmalısan. Müraciətlər 24-48 saat ərzində nəzərdən keçirilir.",
  },
  {
    question: "Ödənişlərim təhlükəsizdirmi?",
    answer:
      "Bəli, bütün ödənişlər şifrələnmiş və PCI-uyğun ödəniş provayderləri vasitəsilə həyata keçirilir.",
  },
  {
    question: "İstənilən vaxt abunəliyi ləğv edə bilərəmmi?",
    answer:
      "Bəli, abunəliyini Profil, Abonəlik bölməsindən istənilən vaxt dayandıra bilərsən.",
  },
]

export const blogPosts: BlogPost[] = [
  {
    id: "ai-2026-gelecek",
    title: "2026-ci ilde AI-nin Gelecegi: Reqabet, Inteqrasiya ve Karyera",
    excerpt:
      "Generative AI bir nece ilin icerisinde senaiyeni kokunden deyisdi. Bes 2026 sonrasinda ne olacaq? Hansi bacariqlar en deyerli olacaq?",
    content:
      "Generative AI artiq eksperiment merhelesinı kecib istehsalata catmisdir. Agent-based AI sistemleri insan mudaxilesi olmadan murekkeb tapsirigen icra edir. Karyera baxisdan en telebatli profiller: AI Safety Engineer, Prompt Architect, MLOps Specialist ve AI Product Manager.",
    authorName: "Elvin Ceferov",
    authorTitle: "Lead Data Scientist · SOCAR Digital",
    authorAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=700&fit=crop",
    date: "10.06.2026",
    likes: 284,
    views: "61k",
    kind: "blog",
    category: "AI & ML",
  },
  {
    id: "senior-developer-olmaq",
    title: "Senior Developer Olmaq: Texniki Bacariqdan Kenarda Ne Var?",
    excerpt:
      "Kodlashdirma bacarigi Senior texniki mutexessis olmaq ucun yalniz ilk addimdir. Sirketler gercekde ne axtarir?",
    content:
      "Senior Developer titlini qazanmaq ucun daha cox kod yazmaq yeterli deyil. Sirketler sistematik dusunceni, liderliyi ve qeyri-mueyyen halda qerar qebul etme bacarigini axtarir. System Design, Code Review Leadership, Performance Engineering esas kompetenslerdir.",
    authorName: "Tural Eliyev",
    authorTitle: "Staff Backend Engineer · Azercell",
    authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=700&fit=crop",
    date: "02.06.2026",
    likes: 197,
    views: "38k",
    kind: "blog",
    category: "Karyera",
  },
  {
    id: "system-design-giris",
    title: "System Design Musahibe: FAANG Suallerine Hazirlasmaq",
    excerpt:
      "WhatsApp, Twitter, YouTube kimi sistemler nece qurulur? System design musahibesini ugurla kecmek ucun cercive.",
    content:
      "System design musahibe texniki musahibenin en cetim merhelelerinden biridir. Load Balancing, Caching, Database Scaling, Message Queues — bunlar esas konseptlerdir.",
    authorName: "Kamran Hesenli",
    authorTitle: "Senior DevOps Engineer · PASHA Technology",
    authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=700&fit=crop",
    date: "25.05.2026",
    likes: 253,
    views: "47k",
    kind: "blog",
    category: "Backend",
  },
  {
    id: "devops-roadmap-2026",
    title: "DevOps Muhendisi Olmaq: 2026 ucun Tam Yol Xeritesi",
    excerpt:
      "Docker, Kubernetes, Terraform ve CI/CD — DevOps dunyasina girishin en effektiv yolu hansidir? Addim-addim plan.",
    content:
      "DevOps muhendisi olmaq ucun Linux esaslarindan bashlayaraq cloud infrastrukturuna qeder ardıcıl bir oyrenmə yolu var. Linux, Docker, Kubernetes, CI/CD, Terraform, Cloud. CKA sertifikatı reqabetde ustunluk verir.",
    authorName: "Kamran Hesenli",
    authorTitle: "Senior DevOps Engineer · PASHA Technology",
    authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=700&fit=crop",
    date: "14.05.2026",
    likes: 318,
    views: "55k",
    kind: "blog",
    category: "DevOps",
  },
  {
    id: "ux-ui-dizayn",
    title: "UX/UI Dizayn Prinsipleri: Istifadeci Tecrubesini Guclendirmek",
    excerpt:
      "UX/UI dizayn sadece gozel gorunen interfeys yaratmaq deyil — istifadecinin mehsulla rahat, suretli elaqe qurmasini temin etmekdir.",
    content:
      "Guclu UX istifadecinin ne istediyini evvelden anlayaraq ona en qisa yolu gosterir. Konsistentlik, sadelik, geri bildirish ve elcatanlıq — muasir UI-nin 4 sutunu.",
    authorName: "Aysel Memmedova",
    authorTitle: "Lead Product Designer · Kapital Bank",
    authorAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=700&fit=crop",
    date: "08.05.2026",
    likes: 156,
    views: "28k",
    kind: "blog",
    category: "UX/UI",
  },
  {
    id: "podcast-ep12",
    title: "Ep.12: Sifirdan Staff Engineer-e — 6 Illik Yol",
    excerpt:
      "Tural Eliyev Baki Dovlet Universitetinden Azercell-in texniki liderlik komandasina geden yolu, etdiyi sehvleri ve oyrenderini aciq danisir.",
    content:
      "Bu epizodda Staff Backend Engineer Tural Eliyev ile genis sohbet etdik. Junior illerde edilən en boyuk 3 sehv, yuksek yuklu sistemin dizayni, texniki musahibe prosesi, Senior-den Staff-a kecidde ne deyisdi — bunlar muzakire edildi.",
    authorName: "Yolum IT Podcast",
    authorTitle: "Texniki Karyera Seriyasi",
    authorAvatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=700&fit=crop",
    date: "05.06.2026",
    likes: 98,
    views: "14k",
    kind: "podcast",
    category: "Backend",
  },
  {
    id: "podcast-ep13",
    title: "Ep.13: Product Manager Olmaq — Texniki Bilik Lazimdirimii?",
    excerpt:
      "Birbank-da Senior PM kimi calisan Nigar Rzayeva karyera kecidi, texniki biliklər ve product musahibesinin sirlərini paylasir.",
    content:
      "Bu epizodda Birbank-in Senior Product Manager-i Nigar Rzayeva ile maraqlı sohbet etdik. PM ucun SQL bilmek sertdirmi? Discovery, PRD yazimi, stakeholder idareetmesi muzakire edildi.",
    authorName: "Yolum IT Podcast",
    authorTitle: "Texniki Karyera Seriyasi",
    authorAvatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=700&fit=crop",
    date: "12.06.2026",
    likes: 74,
    views: "9.8k",
    kind: "podcast",
    category: "Product",
  },
  {
    id: "podcast-ep14",
    title: "Ep.14: Data Science — Hansi Bacariqlar Realdir, Hansilar Mif?",
    excerpt:
      "SOCAR Digital-in Lead Data Scientist Elvin Ceferov 2026-ci ilde data sahesindeki teleblerı, aletleri ve genclere meslehetlerini boluşur.",
    content:
      "Bu epizodda SOCAR Digital-in Lead Data Scientist Elvin Ceferov ile real sohbet etdik. Data Analyst vs Data Scientist vs MLOps ferqleri, Python-SQL-Pandas yeterlidirmi, LLM hype-i oyrenmek lazimdirimii muzakire edildi.",
    authorName: "Yolum IT Podcast",
    authorTitle: "Texniki Karyera Seriyasi",
    authorAvatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
    coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=700&fit=crop",
    date: "19.06.2026",
    likes: 112,
    views: "17k",
    kind: "podcast",
    category: "Data Science",
  },
]

export const games: Game[] = [
  {
    id: "security-shield",
    title: "Security Shield",
    category: "Kiber Tehlukesizlik",
    description:
      "SQL injection, XSS ve CSRF hucumlarini real kod yazaraq dayandır. Sistemi qoru, zeifliklerı baglı, xal qazanmaga davam et.",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
    tags: ["Tehlukesizlik", "Kodlasdirma", "CTF"],
    href: "/games/security-shield",
  },
  {
    id: "data-detective",
    title: "Data Detective",
    category: "Data Elmi",
    description:
      "Python/Pandas tapsirigları ilə real datasetdeki anomaliyalari tap, gizli numuneleri aşkar et, biznes suallarini cavablandir.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    tags: ["Python", "Analiz", "Mentiq"],
    href: "/games/data-detective",
  },
  {
    id: "git-quest",
    title: "Git Quest",
    category: "Git & Version Control",
    description:
      "Merge conflict-leri hell et, rebasing et, PR-lari idare et. Peshekar Git workflow-nu oyun formatinda menimsə.",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop",
    tags: ["Git", "Terminal", "DevOps"],
    href: "/games/git-quest",
  },
  {
    id: "algo-arena",
    title: "Algo Arena",
    category: "Alqoritimler & Data Strukturlar",
    description:
      "LeetCode tipli alqoritm problemlerini hell et, Big-O analiz et, optimal helli tapib zaman ve yaddas xalini artir.",
    imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop",
    tags: ["Alqoritimler", "Python", "Musahibe"],
    href: "/games/algo-arena",
  },
  {
    id: "api-builder",
    title: "API Builder",
    category: "Backend & REST API",
    description:
      "RESTful API endpoint-ler yaz, HTTP status kodlarini duzgun sec, auth middleware qur — real dunya backend tapsiriglari.",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    tags: ["Backend", "REST", "API"],
    href: "/games/api-builder",
  },
  {
    id: "flexbox-robot",
    title: "Flexbox Robot",
    category: "CSS & Frontend",
    description:
      "CSS Flexbox ve Grid ile muasir responsive layout-lar qur, robotu hedefe catdir, pixel-perfect dizayni reallasdır.",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    tags: ["CSS", "Frontend", "Dizayn"],
    href: "/games/flexbox-robot",
  },
]

export const notifications: Notification[] = [
  {
    id: "n1",
    icon: "🚀",
    title: "Yeni AI funksionalligi",
    description:
      "Aira indi sistem dizayni suallerine cavab verə bilir. Roadmap-inıza esasen ferdilesdirilmis modul tovsiyelerı alin.",
    date: "20.06.2026",
    time: "10:00",
    read: false,
  },
  {
    id: "n2",
    icon: "🎯",
    title: "Roadmap yenilendi",
    description:
      "Backend Development roadmap-ina Distributed Systems Fundamentals modulu elave olundu. Indi baxib davam edin.",
    date: "18.06.2026",
    time: "09:30",
    read: false,
  },
  {
    id: "n3",
    icon: "🎓",
    title: "Mentor sessiyasi tesdiklendi",
    description:
      "Tural Eliyev ile sessiya 22 iyun, 18:00-20:00 ucun tesdiklendi. Google Meet linki profilinize gonderildi.",
    date: "17.06.2026",
    time: "14:45",
    read: false,
  },
  {
    id: "n4",
    icon: "💬",
    title: "Yeni mesaj",
    description: "Leyla Ismayilova: Portfolio review sessiyasi ucun kodunu evvelceden paylas.",
    date: "15.06.2026",
    time: "17:12",
    read: true,
  },
  {
    id: "n5",
    icon: "🏆",
    title: "Ders tamamlandi",
    description:
      "TypeScript Generics and Utility Types dersinizi tamamladiniz. Novbeti ders: Advanced React Patterns.",
    date: "14.06.2026",
    time: "20:00",
    read: true,
  },
]

export const mentorSessions: MentorSession[] = [
  {
    id: "s1",
    studentName: "Rauf Elizade",
    studentTitle: "Junior Backend Developer",
    studentAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    topic: "Django REST Framework arxitekturası ve auth sisteminin qurulmasi",
    date: "22 iyun",
    timeRange: "18:00 - 20:00",
    status: "confirmed",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "s2",
    studentName: "Gunel Huseynova",
    studentTitle: "Frontend Developer (React)",
    studentAvatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    topic: "React portfolio layihesinin code review-u ve performans optimallaşdirmasi",
    date: "19 iyun",
    timeRange: "17:00 - 18:30",
    status: "completed",
  },
  {
    id: "s3",
    studentName: "Orxan Babayev",
    studentTitle: "CS Telebesi (IV kurs)",
    studentAvatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces",
    topic: "System Design musahibesine hazirlig: URL shortener dizayni",
    date: "25 iyun",
    timeRange: "19:00 - 20:30",
    status: "pending",
  },
  {
    id: "s4",
    studentName: "Ayten Qasimova",
    studentTitle: "Data Analytics Student",
    studentAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    topic: "SQL sorgu optimallasdirmasi ve indeksleme strategiyasi",
    date: "15 iyun",
    timeRange: "16:00 - 17:00",
    status: "cancelled",
  },
]

export const reviews: Review[] = [
  {
    id: "r1",
    authorName: "Rauf Elizade",
    authorTitle: "Junior Backend Developer",
    authorAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    topic: "Django REST Framework arxitekturası",
    rating: 5,
    date: "19 iyun, 21:04",
    comment: "Inanilmaz faydali sessiya idi. Mentor konkret numunelerle auth sistemini basan sona izah etdi.",
  },
  {
    id: "r2",
    authorName: "Gunel Huseynova",
    authorTitle: "React Frontend Developer",
    authorAvatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    topic: "React portfolio code review",
    rating: 5,
    date: "19 iyun, 19:12",
    comment: "Portfolio-ma baxaraq real sirket muhitindeki standartlara uygun deyisiklikler etdi.",
  },
  {
    id: "r3",
    authorName: "Elnur Memmedli",
    authorTitle: "Software Engineering Student",
    authorAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    topic: "Alqoritimler ve musahibeye hazirlig",
    rating: 5,
    date: "12 iyun, 15:30",
    comment: "Big-O analizi anlayisim cox zeif idi, indi ferqli dusunurem. Musahibede nece izah edeceyimi de oyretdi.",
  },
  {
    id: "r4",
    authorName: "Nilufer Rzayeva",
    authorTitle: "Junior QA Engineer",
    authorAvatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces",
    topic: "Test automation strategy ve Playwright ile E2E testing",
    rating: 4,
    date: "08 iyun, 11:45",
    comment: "Manual QA-dan automation-a kecid ucun cox aydin yol xeritesi aldim.",
  },
]

export const transactions: Transaction[] = [
  {
    id: "t1",
    studentName: "Rauf Elizade",
    studentTitle: "Junior Backend Developer",
    studentAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    sessionTitle: "Django REST Framework arxitekturası (2 saat)",
    date: "19 iyun, 2026",
    amount: 125,
  },
  {
    id: "t2",
    studentName: "Gunel Huseynova",
    studentTitle: "React Frontend Developer",
    studentAvatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
    sessionTitle: "React portfolio code review (1.5 saat)",
    date: "19 iyun, 2026",
    amount: 95,
  },
  {
    id: "t3",
    studentName: "Elnur Memmedli",
    studentTitle: "CS Student",
    studentAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    sessionTitle: "Alqoritimler ve musahibeye hazirlig (1 saat)",
    date: "12 iyun, 2026",
    amount: 65,
  },
  {
    id: "t4",
    studentName: "Nilufer Rzayeva",
    studentTitle: "Junior QA Engineer",
    studentAvatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=faces",
    sessionTitle: "Test automation strategy (1 saat)",
    date: "08 iyun, 2026",
    amount: 65,
  },
]

export const weeklySessionActivity = [
  { day: "B.e", sessions: 12 },
  { day: "Ca", sessions: 18 },
  { day: "C", sessions: 26 },
  { day: "Ca", sessions: 15 },
  { day: "C", sessions: 31 },
  { day: "S", sessions: 9 },
  { day: "B", sessions: 14 },
]
