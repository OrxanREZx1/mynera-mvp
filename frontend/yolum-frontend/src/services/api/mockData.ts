import type {
  BlogPost,
  FaqItem,
  Game,
  MentorSession,
  Notification,
  PricingPlan,
  Review,
  Transaction,
} from '@/types'

export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Başlanğıc',
    priceMonthly: 0,
    description: 'IT sahəsinə giriş üçün sadə və başlanğıc plan',
    ctaLabel: 'Başla',
    features: [
      { label: 'Ayda 30 sorğu', description: 'AI vasitəsilə suallar verərək sahələri araşdır' },
      { label: '1 pulsuz canlı online dərsə giriş (coming soon)', description: 'Canlı dərslərlə ilkin bilik əldə et' },
      { label: 'Sənə uyğun sahə üzrə roadmap', description: 'Maraqlarına uyğun öyrənmə istiqaməti təqdim olunur' },
      { label: 'Sənə uyğun roadmap (50%)', description: 'Qismən fərdiləşdirilmiş öyrənmə planı' },
    ],
  },
  {
    id: 'standard',
    name: 'Standart',
    priceMonthly: 15,
    description: 'Daha çox dəstək və istiqamətlə öyrən',
    ctaLabel: 'Daxil ol',
    highlighted: true,
    features: [
      { label: 'Ayda 200 sorğu', description: 'Daha aktiv istifadə və daha geniş araşdırma imkanı' },
      { label: '2 pulsuz canlı online dərsə giriş', description: 'Müxtəlif mövzular üzrə əlavə bilik qazan' },
      { label: 'Mentorlarla 15 dəqiqəlik görüş', description: 'Qısa və effektiv mentor dəstəyi əldə et' },
      { label: 'Sənə uyğun roadmap (70%)', description: 'Qismən fərdiləşdirilmiş öyrənmə planı' },
      { label: 'Portfolio və inkişafın izlənməsi', description: 'İnkişafını və gördüyün işləri rahat izləyə bil' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceMonthly: 25,
    description: 'Tam fərdiləşdirilmiş və maksimum inkişaf planı',
    ctaLabel: 'Başla',
    features: [
      { label: 'Ayda 500 sorğu', description: 'Geniş istifadə imkanı ilə limitsizə yaxın təcrübə' },
      { label: '3 pulsuz canlı online dərsə giriş', description: 'Daha çox praktiki və canlı öyrənmə imkanı' },
      { label: 'Mentorlarla 30 dəqiqəlik görüş', description: 'Daha dərin və detallı mentor dəstəyi' },
      { label: 'Full roadmap (100%)', description: 'Tam fərdiləşdirilmiş, addım-addım öyrənmə planı' },
      { label: 'Portfolio və inkişafın izlənməsi', description: 'Tam nəzarət və inkişaf analizləri' },
    ],
  },
]

export const faqItems: FaqItem[] = [
  {
    question: 'Hansı İT sahəsinin mənə uyğun olduğundan əmin deyiləm. Bu platforma necə kömək edə bilər?',
    answer:
      'Aira adlı AI köməkçimiz sənə bir neçə sual verərək maraqlarını, bacarıq səviyyəni və məqsədlərini müəyyən edir, sonra bunlara uyğun 2-3 IT sahəsi təklif edir və hər biri üçün fərdi roadmap hazırlayır.',
  },
  {
    question: 'Mentor sessiyaları necə keçirilir və nə qədər çəkir?',
    answer:
      'Sessiyaları planına uyğun olaraq 10 dəqiqədən 2 saata qədər seçə bilərsən. Görüşlər Google Meet üzərindən onlayn keçirilir və mentor profilindən birbaşa planlaşdırıla bilər.',
  },
  {
    question: 'Roadmap-ı sonradan dəyişə bilərəmmi?',
    answer:
      'Bəli. İstənilən vaxt "Yol xəritəni dəyiş" bölməsindən yeni sahə seçərək fərqli bir roadmap-a keçə bilərsən, əvvəlki irəliləyişin profilində saxlanılır.',
  },
  {
    question: 'Premium planın pulsuz plandan fərqi nədir?',
    answer:
      'Premium planda limitsizə yaxın AI sorğusu, tam fərdiləşdirilmiş roadmap, daha uzun mentor sessiyaları və prioritet dəstək var. Ətraflı müqayisə üçün Qiymətlər bölməsinə bax.',
  },
  {
    question: 'Mentor olmaq üçün necə müraciət edə bilərəm?',
    answer:
      '"Mentor kimi qoşul" düyməsindən qeydiyyat formunu doldurmalısan. Müraciətlər adətən 24-48 saat ərzində nəzərdən keçirilir və nəticə e-poçtuna göndərilir.',
  },
  {
    question: 'Ödənişlərim təhlükəsizdirmi?',
    answer:
      'Bəli, bütün ödənişlər şifrələnmiş və PCI-uyğun ödəniş provayderləri vasitəsilə həyata keçirilir. Kart məlumatların bizim serverlərimizdə saxlanılmır.',
  },
  {
    question: 'İstənilən vaxt abunəliyi ləğv edə bilərəmmi?',
    answer:
      'Bəli, abunəliyini Profil → Abonəlik bölməsindən istənilən vaxt dayandıra bilərsən, cari dövrün sonuna qədər girişin davam edir.',
  },
]

export const blogPosts: BlogPost[] = [
  {
    id: 'ux-ui-dizayn',
    title: 'İstifadəçi Təcrübəsini Gücləndirən UX/UI Dizayn',
    excerpt:
      'UX/UI dizayn sadəcə gözəl görünən interfeys yaratmaq deyil, istifadəçinin məhsulla rahat, sürətli və problemsiz şəkildə əlaqə qurmasını təmin etməkdir.',
    content: `UX/UI dizayn sadəcə gözəl görünən interfeys yaratmaq deyil, istifadəçinin məhsulla rahat, sürətli və problemsiz şəkildə əlaqə qurmasını təmin etməkdir. Güclü UX istifadəçinin nə istədiyini əvvəlcədən anlayaraq ona ən qısa yolu göstərir, yaxşı UI isə bu təcrübəni vizual olaraq daha aydın və estetik edir.

Müasir rəqəmsal məhsullarda sadəlik, oxunaqlılıq və düzgün istifadəçi axını istifadəçinin platformada qalma müddətinə və ümumi təcrübəsinə birbaşa təsir edir. Buna görə uğurlu dizayn yalnız rəng və ikonlardan deyil, istifadəçinin davranışını düzgün analiz etməkdən başlayır.

Dizayn sistemi qurarkən konsistentlik açar rolunu oynayır: hər komponent, hər rəng və hər boşluq qərarı bütün məhsul boyunca eyni məntiqi izləməlidir. Bu, həm istifadəçilər üçün tanışlıq hissi yaradır, həm də komanda üçün inkişafı sürətləndirir.`,
    authorName: 'Adam Adəmoğlu',
    authorTitle: 'UX/UI Designer',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    coverUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=700&fit=crop',
    date: '15.05.2025',
    likes: 36,
    views: '12k',
    kind: 'blog',
    category: 'UX/UI',
  },
  {
    id: 'ai-karyera-tovsiyeleri',
    title: 'AI Necə Sənin Karyera Yolunu Müəyyən Edir?',
    excerpt:
      'Süni intellekt əsaslı tövsiyə sistemləri maraqlarını necə oxuyur və sənə uyğun IT sahəsini necə tapır — arxa planda baş verən prosesə nəzər salırıq.',
    content: `Süni intellekt əsaslı tövsiyə sistemləri sənin cavablarını, davranış nümunələrini və maraq sahələrini analiz edərək ən uyğun IT istiqamətini müəyyənləşdirir.

Bu proses adətən bir neçə mərhələdən keçir: məlumat toplama, profil qurma, uyğunluq hesablama və nəticələrin fərdiləşdirilməsi. Hər mərhələdə sistem sənin verdiyin geri bildirimlərdən öyrənərək tövsiyələrini daha da dəqiqləşdirir.

Nəticədə ortaya çıxan roadmap tək bir template deyil — sənin səviyyənə, vaxt büdcənə və məqsədlərinə uyğun tərtib olunmuş fərdi bir plandır.`,
    authorName: 'Adam Adəmoğlu',
    authorTitle: 'UX/UI Designer',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    coverUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=700&fit=crop',
    date: '02.05.2025',
    likes: 51,
    views: '9.4k',
    kind: 'blog',
    category: 'AI & ML',
  },
  {
    id: 'mentorluqdan-maksimum-fayda',
    title: 'Mentorluq Sessiyalarından Maksimum Faydanı Necə Götürməli?',
    excerpt:
      'Mentorunla ilk görüşə hazırlaşarkən nələrə diqqət etməlisən? Sualları necə qurmalısan ki, sessiyadan ən çox dəyəri qazanasan.',
    content: `Mentorluq sessiyası vaxtını ən yaxşı şəkildə dəyərləndirmək üçün əvvəlcədən hazırlıq vacibdir. Konkret suallarla gəlmək, ümumi "necə uğur qazanım" tipli suallardan qat-qat effektivdir.

Sessiya öncəsi öz məqsədini bir cümlə ilə yaz: nəyi öyrənmək, hansı qərarı vermək və ya hansı problemi həll etmək istəyirsən? Bu, mentorunla vaxtınızı düzgün istiqamətləndirməyə kömək edir.

Sessiyadan sonra qeydlərini nəzərdən keçir və növbəti addımlarını planla — beləliklə hər görüş əvvəlkinin üzərinə inşa olunur.`,
    authorName: 'Cahan Abdullazadə',
    authorTitle: 'UX/UI Designer',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    coverUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=700&fit=crop',
    date: '28.04.2025',
    likes: 29,
    views: '6.1k',
    kind: 'blog',
    category: 'Karyera',
  },
  {
    id: 'podcast-ep1',
    title: 'Epizod 1: Sıfırdan Backend Developerə',
    excerpt: 'Qonağımız Elvin Məmmədov universitet illərindən Bakcell-də backend komandasına qədər olan yolunu danışır.',
    content: 'Podcast transkripti tezliklə əlavə olunacaq.',
    authorName: 'Yolum IT',
    authorTitle: 'Podcast',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=700&fit=crop',
    date: '10.04.2025',
    likes: 44,
    views: '3.2k',
    kind: 'podcast',
    category: 'Backend',
  },
]

export const games: Game[] = [
  {
    id: 'security-shield',
    title: 'Security Shield',
    category: 'Kiber Təhlükəsizlik',
    description: 'Kiber təhlükəsizlik üzrə real kod yazaraq sistemi qoru və hücumların qarşısını al.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
    tags: ['Təhlükəsizlik', 'Kodlaşdırma'],
    href: '/games/security-shield',
  },
  {
    id: 'data-detective',
    title: 'Data Detective',
    category: 'Data Elmi',
    description: 'Kod yazaraq məlumatları analiz et, gizli nümunələri tap və düzgün nəticələr çıxar.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    tags: ['Analiz', 'Məntiq'],
    href: '/games/data-detective',
  },
  {
    id: 'git-quest',
    title: 'Git Quest',
    category: 'Git & Version Control',
    description: 'Git əmrlərini öyrən, versiyaları idarə et və missiyaları addım-addım tamamla.',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop',
    tags: ['Git', 'Terminal'],
    href: '/games/git-quest',
  },
  {
    id: 'flexbox-robot',
    title: 'Flexbox Robot',
    category: 'CSS & Dizayn',
    description: 'CSS Flexbox qaydalarını tətbiq et, elementləri düzgün yerləşdir və robotu hədəfə çatdır.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    tags: ['Dizayn', 'CSS'],
    href: '/games/flexbox-robot',
  },
]

export const notifications: Notification[] = [
  {
    id: 'n1',
    icon: '🚀',
    title: 'Süni intellekt',
    description:
      'Süni intellekt və maşın öyrənməsi üzrə peşəkar mentorlarla fərdi sessiyalara qoşulun. Karyera inkişafı, real layihələr və praktiki biliklər üçün indi sessiya planlaşdırın.',
    date: '07.01.2026',
    time: '12:00',
    read: false,
  },
  {
    id: 'n2',
    icon: '🎯',
    title: 'Roadmap yeniləndi',
    description: 'Süni intelekt və maşın öyrənməsi roadmap-ına yeni modul əlavə olundu. İndi bax və davam et.',
    date: '05.01.2026',
    time: '09:30',
    read: false,
  },
  {
    id: 'n3',
    icon: '💬',
    title: 'Yeni mesaj',
    description: 'Cahan Abdullazadə sənə mesaj göndərdi. Sessiya təfərrüatlarına baxmaq üçün klikləyin.',
    date: '02.01.2026',
    time: '17:12',
    read: true,
  },
]

export const mentorSessions: MentorSession[] = [
  {
    id: 's1',
    studentName: 'Aysel Məmmədli',
    studentTitle: 'Frontend developer',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    topic: 'Protfolyo layihələrinin dəyərləndirilməsi',
    date: '12 iyun',
    timeRange: '18:00 - 20:00',
    status: 'confirmed',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 's2',
    studentName: 'Aysel Məmmədli',
    studentTitle: 'Frontend developer',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    topic: 'Protfolyo layihələrinin dəyərləndirilməsi',
    date: '12 iyun',
    timeRange: '18:00 - 20:00',
    status: 'completed',
  },
  {
    id: 's3',
    studentName: 'Aysel Məmmədli',
    studentTitle: 'Frontend developer',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    topic: 'Protfolyo layihələrinin dəyərləndirilməsi',
    date: '12 iyun',
    timeRange: '18:00 - 20:00',
    status: 'pending',
  },
  {
    id: 's4',
    studentName: 'Aysel Məmmədli',
    studentTitle: 'Frontend developer',
    studentAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    topic: 'Protfolyo layihələrinin dəyərləndirilməsi',
    date: '12 iyun',
    timeRange: '18:00 - 20:00',
    status: 'cancelled',
  },
]

export const reviews: Review[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `r${i + 1}`,
  authorName: 'Aysel Məmmədli',
  authorTitle: 'Frontend developer',
  authorAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
  topic: 'Protfolyo layihələrinin dəyərləndirilməsi',
  rating: 4,
  date: '12 iyun, 12:23',
  comment: 'Sessiya çox faydalı idi, praktiki məsləhətlər üçün təşəkkürlər!',
}))

export const transactions: Transaction[] = Array.from({ length: 4 }).map((_, i) => ({
  id: `t${i + 1}`,
  studentName: 'Aysel Məmmədli',
  studentTitle: 'Frontend developer',
  studentAvatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
  sessionTitle: 'Protfolyo layihələrinin dəyərləndirilməsi',
  date: '12 iyun, 2026',
  amount: 50,
}))

export const weeklySessionActivity = [
  { day: 'B.e', sessions: 8 },
  { day: 'Ç.a', sessions: 14 },
  { day: 'Ç', sessions: 21 },
  { day: 'C.a', sessions: 12 },
  { day: 'C', sessions: 25 },
  { day: 'Ş', sessions: 6 },
  { day: 'B', sessions: 10 },
]
