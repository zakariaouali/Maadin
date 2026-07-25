"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

/* ─────────────────────────────────────────────────────────────
   Content data — EN / FR / AR fully written for each craft
   ───────────────────────────────────────────────────────────── */
export interface CraftContent {
  id: string;
  slug: string;            // links to /products?category=...
  label: string;           // short eyebrow label
  title: string;
  region: string;
  body: string;            // 3–4 sentences, keyword-rich
  images: [string, string]; // [img1, img2] — pass "" for placeholder
  imageAlts: [string, string];
  ctaLabel: string;
  accent: string;          // tailwind bg class for the accent dot
}

export type Locale = "en" | "fr" | "ar";

export const CRAFTS: Record<Locale, CraftContent[]> = {
  en: [
    {
      id: "zellige",
      slug: "zellige",
      label: "Traditional tilework",
      title: "Zellige — The Art of Moroccan Mosaic",
      region: "Fès · Meknès",
      body:
        "Zellige is one of Morocco's most emblematic crafts — hand-cut geometric tiles assembled into intricate mosaic patterns that have adorned palaces, mosques, and riads for over a thousand years. Each tile is individually carved by a maâlem (master craftsman) using a small hammer and chisel, then fired in wood-burning kilns to achieve vivid, deep colours. The process can take months for a single panel, making every zellige work a one-of-a-kind creation. Fès is the undisputed capital of zellige in Morocco, where workshops still use techniques passed down through generations.",
      images: ["/blogs/zlij.jfif", "/blogs/zlij2.jfif"],
      imageAlts: ["Zellige mosaic tilework from Fès", "Moroccan zellige geometric patterns"],
      ctaLabel: "Explore Zellige",
      accent: "bg-amber-400",
    },
    {
      id: "pottery",
      slug: "pottery",
      label: "Earthenware & ceramics",
      title: "Moroccan Pottery — Fired by Tradition",
      region: "Safi · Fès · Salé",
      body:
        "Moroccan pottery is among the most recognised artisan crafts in the world, celebrated for its vivid cobalt blues, warm ochres, and bold geometric motifs. The city of Safi alone is home to over 700 pottery workshops, many operating in the same family for centuries. Potters shape clay on foot-powered wheels, then apply hand-painted glazes before firing in traditional kilns. Pieces range from functional tagines and bowls to purely decorative vases and platters — every piece carries the unmistakable mark of the human hand.",
      images: ["/blogs/fkhar.jfif", "/blogs/fkhar2.jfif"],
      imageAlts: ["Moroccan blue pottery from Safi", "Hand-painted ceramic tagine Morocco"],
      ctaLabel: "Shop Pottery",
      accent: "bg-blue-400",
    },
    {
      id: "leather",
      slug: "leather",
      label: "Tanneries & leather craft",
      title: "Moroccan Leather — The Soul of the Medina",
      region: "Fès · Marrakech",
      body:
        "The tanneries of Fès are among the oldest leather-working sites in the world, continuously in operation since the 11th century. Moroccan leather — known as maroquinerie — uses a purely vegetable tanning process with natural dyes derived from saffron, poppy, pomegranate, cedar bark, and indigo. Babouches (traditional slippers), poufs, bags, and belts produced here are exported worldwide as symbols of Moroccan craftsmanship. The distinctive honeycomb of stone vats, stained with centuries of dye, is a sight that defines the Moroccan medina.",
      images: ["/blogs/jeld.jfif", "/blogs/jeld2.jfif"],
      imageAlts: ["Fès tannery leather dyeing vats", "Moroccan leather babouches slippers"],
      ctaLabel: "Browse Leather Goods",
      accent: "bg-amber-700",
    },
    {
      id: "carpets",
      slug: "carpets",
      label: "Weaving & textiles",
      title: "Moroccan Rugs — Woven Stories",
      region: "Beni Mellal · Middle Atlas · Taznakht",
      body:
        "Moroccan rugs are coveted by interior designers and collectors the world over for their bold colours, tribal patterns, and exceptional quality. The Beni Ourain rugs — off-white wool with abstract black lines — have become a modern design icon. Azilal rugs from the High Atlas combine geometric shapes with vivid splashes of colour. Every rug is hand-knotted or flat-woven by Berber women, and the patterns encode stories, symbols of fertility, protection, and identity unique to each tribe and village. A Moroccan rug is not just décor — it is a conversation with history.",
      images: ["/blogs/zrbiya.jfif", "/blogs/zrbiya2.jfif"],
      imageAlts: ["Beni Ourain handwoven Moroccan rug", "Berber Azilal rug High Atlas Morocco"],
      ctaLabel: "Discover Rugs",
      accent: "bg-red-400",
    },
    {
      id: "thuya",
      slug: "wood",
      label: "Wood & marquetry",
      title: "Thuya Wood — Essaouira's Living Treasure",
      region: "Essaouira · Agadir",
      body:
        "Thuya (or Thuja) is a rare, fragrant wood native to the Atlas Mountains and coastal cliffs of southwest Morocco. Its highly figured burls — with swirling honey-gold grain — make it one of the most prized materials for luxury objects. Essaouira is the world centre of thuya craftsmanship, where artisans inlay boxes, frames, chess sets, and furniture with silver, lemon-wood, and mother-of-pearl using techniques dating back to the Phoenicians. The scent of freshly worked thuya fills every workshop in the medina — a fragrance as distinctive as the craft itself.",
      images: ["/blogs/khcheb.jfif", "/blogs/khcheb2.jfif"],
      imageAlts: ["Thuya wood inlaid box from Essaouira", "Moroccan marquetry thuya furniture"],
      ctaLabel: "Shop Thuya Craft",
      accent: "bg-yellow-600",
    },
  ],

  fr: [
    {
      id: "zellige",
      slug: "zellige",
      label: "Carrelage traditionnel",
      title: "Zellige — L'Art de la Mosaïque Marocaine",
      region: "Fès · Meknès",
      body:
        "Le zellige est l'un des arts les plus emblématiques du Maroc — des carreaux géométriques taillés à la main, assemblés en arabesques complexes qui ornent depuis plus de mille ans les palais, mosquées et riads. Chaque carreau est sculpté individuellement par un maâlem à l'aide d'un marteau et d'un burin, puis cuit dans des fours à bois pour obtenir des couleurs vibrantes et profondes. La réalisation d'un panneau peut prendre plusieurs mois, faisant de chaque œuvre en zellige une création unique. Fès demeure la capitale incontestée du zellige au Maroc, avec des ateliers perpétuant des techniques transmises de génération en génération.",
      images: ["/blogs/zlij.jfif", "/blogs/zlij2.jfif"],
      imageAlts: ["Mosaïque zellige de Fès", "Motifs géométriques marocains en zellige"],
      ctaLabel: "Explorer le Zellige",
      accent: "bg-amber-400",
    },
    {
      id: "pottery",
      slug: "pottery",
      label: "Faïence & céramique",
      title: "Poterie Marocaine — Pétrie dans la Tradition",
      region: "Safi · Fès · Salé",
      body:
        "La poterie marocaine est l'un des artisanats les plus reconnus au monde, célèbre pour ses bleus cobalt éclatants, ses ocres chauds et ses motifs géométriques audacieux. La ville de Safi compte à elle seule plus de 700 ateliers de poterie, dont beaucoup sont dans la même famille depuis des siècles. Les potiers façonnent l'argile sur des tours actionnés au pied, puis appliquent des glaçures peintes à la main avant la cuisson dans des fours traditionnels. Les pièces vont des tajines et bols fonctionnels aux vases et plats purement décoratifs — chaque pièce porte la marque inimitable de la main humaine.",
      images: ["/blogs/fkhar.jfif", "/blogs/fkhar2.jfif"],
      imageAlts: ["Poterie bleue marocaine de Safi", "Tajine céramique peint à la main Maroc"],
      ctaLabel: "Voir la Poterie",
      accent: "bg-blue-400",
    },
    {
      id: "leather",
      slug: "leather",
      label: "Tanneries & maroquinerie",
      title: "Le Cuir Marocain — L'Âme de la Médina",
      region: "Fès · Marrakech",
      body:
        "Les tanneries de Fès comptent parmi les sites de travail du cuir les plus anciens du monde, en activité continue depuis le XIe siècle. La maroquinerie marocaine utilise un procédé de tannage entièrement végétal avec des teintures naturelles issues du safran, du pavot, de la grenade, de l'écorce de cèdre et de l'indigo. Babouches, poufs, sacs et ceintures produits ici sont exportés dans le monde entier comme symboles du savoir-faire marocain. Le nid d'abeilles caractéristique des cuves en pierre, colorées par des siècles de teinture, est un spectacle qui définit la médina marocaine.",
      images: ["/blogs/jeld.jfif", "/blogs/jeld2.jfif"],
      imageAlts: ["Tannerie de Fès cuves de teinture", "Babouches en cuir marocain"],
      ctaLabel: "Voir la Maroquinerie",
      accent: "bg-amber-700",
    },
    {
      id: "carpets",
      slug: "carpets",
      label: "Tissage & textile",
      title: "Tapis Marocains — Des Histoires Tissées",
      region: "Beni Mellal · Moyen Atlas · Taznakht",
      body:
        "Les tapis marocains sont convoités par les décorateurs d'intérieur et les collectionneurs du monde entier pour leurs couleurs vives, leurs motifs tribaux et leur qualité exceptionnelle. Les tapis Beni Ourain — laine écrue aux lignes noires abstraites — sont devenus une icône du design contemporain. Les tapis Azilal du Haut Atlas combinent formes géométriques et touches de couleur vives. Chaque tapis est noué à la main ou tissé à plat par des femmes berbères, et les motifs encodent des récits, des symboles de fertilité, de protection et d'identité propres à chaque tribu et village.",
      images: ["/blogs/zrbiya.jfif", "/blogs/zrbiya2.jfif"],
      imageAlts: ["Tapis Beni Ourain tissé à la main", "Tapis berbère Azilal Haut Atlas Maroc"],
      ctaLabel: "Découvrir les Tapis",
      accent: "bg-red-400",
    },
    {
      id: "thuya",
      slug: "wood",
      label: "Bois & marqueterie",
      title: "Bois de Thuya — Le Trésor d'Essaouira",
      region: "Essaouira · Agadir",
      body:
        "Le thuya est un bois rare et odorant originaire des montagnes de l'Atlas et des falaises côtières du sud-ouest du Maroc. Ses loupes très figurées — avec un grain tourbillonnant aux teintes dorées — en font l'un des matériaux les plus prisés pour les objets de luxe. Essaouira est le centre mondial de l'artisanat en bois de thuya, où les artisans incrustent boîtes, cadres, jeux d'échecs et meubles avec de l'argent, du citronnier et de la nacre, selon des techniques remontant aux Phéniciens. Le parfum du thuya fraîchement travaillé embaume chaque atelier de la médina.",
      images: ["/blogs/khcheb.jfif", "/blogs/khcheb2.jfif"],
      imageAlts: ["Boîte en thuya incrusté d'Essaouira", "Marqueterie marocaine en bois de thuya"],
      ctaLabel: "Voir l'Artisanat Thuya",
      accent: "bg-yellow-600",
    },
  ],

  ar: [
    {
      id: "zellige",
      slug: "zellige",
      label: "الفسيفساء التقليدية",
      title: "الزليج — فن الفسيفساء المغربية",
      region: "فاس · مكناس",
      body:
        "الزليج هو من أبرز الحرف المغربية — بلاطات هندسية منقوشة باليد تُجمَّع في أنماط فسيفسائية بديعة زيّنت القصور والمساجد والرياض منذ أكثر من ألف عام. يُنحت كل بلاط على حدة بيد المعلم الحرفي باستخدام مطرقة وإزميل صغيرين، ثم يُحرق في أفران تعمل بالحطب للحصول على ألوان زاهية وعميقة. قد تستغرق لوحة واحدة أشهراً من العمل، مما يجعل كل قطعة زليج خلقاً فريداً لا مثيل له. تظل فاس العاصمة الحقيقية للزليج في المغرب، حيث لا تزال الورش تعمل بأساليب توارثتها الأجيال خلفاً عن سلف.",
      images: ["/blogs/zlij.jfif", "/blogs/zlij2.jfif"],
      imageAlts: ["فسيفساء الزليج من فاس", "أنماط هندسية مغربية بالزليج"],
      ctaLabel: "اكتشف الزليج",
      accent: "bg-amber-400",
    },
    {
      id: "pottery",
      slug: "pottery",
      label: "الفخار والسيراميك",
      title: "الفخار المغربي — مشوي بالتقاليد",
      region: "آسفي · فاس · سلا",
      body:
        "يُعدّ الفخار المغربي من أشهر الحرف اليدوية في العالم، ويُحتفى به لألوانه الزرقاء الكوبالتية الزاهية ودرجاته الترابية الدافئة وزخارفه الهندسية الجريئة. تضم مدينة آسفي وحدها أكثر من 700 ورشة فخار، كثير منها يعمل في نفس الأسرة منذ قرون. يشكّل الفخاريون الطين على دوّارات تعمل بالقدم، ثم يطبّقون طلاءات مرسومة باليد قبل الحرق في أفران تقليدية. تتراوح القطع بين الطواجن والأواني العملية ووصولاً إلى المزهريات والأطباق الزخرفية البحتة — وكل قطعة تحمل بصمة اليد الإنسانية الحاضرة دائماً.",
      images: ["/blogs/fkhar.jfif", "/blogs/fkhar2.jfif"],
      imageAlts: ["الفخار المغربي الأزرق من آسفي", "طاجين سيراميك مرسوم باليد من المغرب"],
      ctaLabel: "تسوق الفخار",
      accent: "bg-blue-400",
    },
    {
      id: "leather",
      slug: "leather",
      label: "الدباغة وصناعة الجلود",
      title: "الجلد المغربي — روح المدينة العتيقة",
      region: "فاس · مراكش",
      body:
        "تُعدّ مدابغ فاس من أقدم مواقع دباغة الجلود في العالم، وهي تعمل بشكل متواصل منذ القرن الحادي عشر. تعتمد الصناعة الجلدية المغربية — المعروفة بالمروكيناري — على عملية دباغة نباتية بالكامل بأصباغ طبيعية مستخرجة من الزعفران وبذور الخشخاش والرمان ولحاء الأرز والنيلة. تُصدَّر البلاغي والبفات والحقائب والأحزمة المنتجة هنا إلى أرجاء العالم كرموز للحرف المغربية الأصيلة. وإن الخلية الشهيرة من أحواض الحجارة الملوّنة بصبغات قرون، لَمشهدٌ يُجسّد روح المدينة المغربية.",
      images: ["/blogs/jeld.jfif", "/blogs/jeld2.jfif"],
      imageAlts: ["أحواض الصباغة في مدابغ فاس", "البلاغي المغربية الجلدية"],
      ctaLabel: "تصفح منتجات الجلد",
      accent: "bg-amber-700",
    },
    {
      id: "carpets",
      slug: "carpets",
      label: "النسيج والحياكة",
      title: "الزرابي المغربية — حكايات منسوجة",
      region: "بني ملال · الأطلس المتوسط · تزناخت",
      body:
        "تحظى الزرابي المغربية بإقبال واسع من مصممي الديكور الداخلي والهواة حول العالم لألوانها الزاهية وأنماطها القبلية وجودتها الاستثنائية. وقد غدت زرابي بني ورين — الصوف الكريمي ذو الخطوط السوداء المجردة — أيقونة في تصميم الديكور المعاصر. أما زرابي عزيلال من الأطلس الكبير فتجمع بين الأشكال الهندسية ولمسات لونية نابضة. كل زربية تُنسج أو تُعقد باليد من قِبَل المرأة الأمازيغية، والأنماط ترمز إلى حكايات وقيم الخصوبة والحماية والهوية الخاصة بكل قبيلة وقرية — إنها ليست مجرد ديكور، بل هي حوار مع التاريخ.",
      images: ["/blogs/zrbiya.jfif", "/blogs/zrbiya2.jfif"],
      imageAlts: ["زربية بني ورين منسوجة يدوياً", "زربية أمازيغية أزيلال الأطلس الكبير"],
      ctaLabel: "اكتشف الزرابي",
      accent: "bg-red-400",
    },
    {
      id: "thuya",
      slug: "wood",
      label: "الخشب والنقش",
      title: "خشب الثويا — كنز الصويرة الحي",
      region: "الصويرة · أكادير",
      body:
        "الثويا خشب نادر وعطري يتجذّر في جبال الأطلس والمنحدرات الساحلية لجنوب غرب المغرب. تجعل منه عُقده الوفيرة ذات الحبوب الذهبية المتموّجة أحد أثمن المواد في صنع الأشياء الفاخرة. الصويرة هي المركز العالمي لحرفة خشب الثويا، حيث يُطعّم الحرفيون الصناديقَ والبراويزَ وأدوات الشطرنج والأثاثَ بالفضة وخشب الليمون والصدف، وفق تقنيات تعود إلى الفينيقيين. عطر الثويا المنحوت يملأ كل ورشة في المدينة — رائحة بصمة لا تُنسى كالحرفة ذاتها.",
      images: ["/blogs/khcheb.jfif", "/blogs/khcheb2.jfif"],
      imageAlts: ["صندوق خشب الثويا المطعّم من الصويرة", "نقش خشب الثويا المغربي"],
      ctaLabel: "تسوق حرفة الثويا",
      accent: "bg-yellow-600",
    },
  ],
};

/* ─── Intersection Observer hook for scroll-triggered reveal ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ─── Single craft card ─── */
function CraftCard({ craft, index }: { craft: CraftContent; index: number }) {
  const { ref, inView } = useInView();
  const isEven = index % 2 === 0;

  return (
    <article
      ref={ref}
      className={`relative grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl bg-white border border-stone/10 shadow-sm transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* ── Images column ── */}
      <div className={`relative h-72 lg:h-auto min-h-[340px] bg-[#1f1b16] overflow-hidden ${isEven ? "lg:order-first" : "lg:order-last"}`}>
        {/* Main image — top 65% */}
        <div className="absolute inset-0 lg:inset-[0_0_35%_0]">
          {craft.images[0] ? (
            <Image src={craft.images[0]} alt={craft.imageAlts[0]} fill unoptimized className="object-cover" sizes="600px" />
          ) : (
            <PlaceholderImg label={craft.imageAlts[0]} index={0} />
          )}
        </div>
        {/* Secondary image — bottom 35% right 50% */}
        <div className="hidden lg:block absolute bottom-0 right-0 left-[50%] top-[65%]">
          {craft.images[1] ? (
            <Image src={craft.images[1]} alt={craft.imageAlts[1]} fill unoptimized className="object-cover" sizes="300px" />
          ) : (
            <PlaceholderImg label={craft.imageAlts[1]} index={1} />
          )}
        </div>
        {/* Bottom-left accent block */}
        <div className={`hidden lg:block absolute bottom-0 left-0 right-[50%] top-[65%] ${craft.accent} opacity-90`} />
        {/* Gradient overlay on main image */}
        <div className="absolute inset-0 lg:bottom-[35%] bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {/* Floating region badge */}
        <div className="absolute top-4 start-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2.5">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-[10px] text-white/80 font-medium tracking-wide">{craft.region}</span>
        </div>
      </div>

      {/* ── Text column ── */}
      <div className={`flex flex-col justify-center px-8 py-10 lg:px-12 ${isEven ? "lg:order-last" : "lg:order-first"}`}>
        {/* Eyebrow */}
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c9a96e] mb-3">{craft.label}</p>

        {/* Title */}
        <h3 className="font-display text-2xl lg:text-3xl text-[#1f1b16] leading-tight mb-4">
          {craft.title}
        </h3>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px flex-1 bg-stone/15" />
          <div className={`w-2 h-2 rounded-full ${craft.accent}`} />
          <div className="h-px w-8 bg-stone/15" />
        </div>

        {/* Body */}
        <p className="text-sm text-[#6b6460] leading-relaxed mb-7 line-clamp-[8]">
          {craft.body}
        </p>

        {/* CTA */}
        <Link
          href={`/products?category=${craft.slug}`}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1f1b16] hover:text-[#c9a96e] transition-colors duration-200 w-fit"
        >
          {craft.ctaLabel}
          <span className="w-7 h-7 rounded-full border border-[#1f1b16]/20 group-hover:border-[#c9a96e]/50 flex items-center justify-center transition-colors duration-200">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </Link>
      </div>
    </article>
  );
}

/* ─── Image placeholder ─── */
function PlaceholderImg({ label, index }: { label: string; index: number }) {
  const patterns = [
    "repeating-linear-gradient(45deg, #c9a96e22 0px, #c9a96e22 1px, transparent 1px, transparent 18px), repeating-linear-gradient(-45deg, #c9a96e22 0px, #c9a96e22 1px, transparent 1px, transparent 18px)",
    "radial-gradient(circle at 30% 70%, #c9a96e18 0%, transparent 60%), radial-gradient(circle at 75% 25%, #3d2a1418 0%, transparent 60%)",
  ];
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1108]"
      style={{ backgroundImage: patterns[index % 2] }}
      aria-label={label}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1" opacity="0.35">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
      <span className="text-[9px] text-[#c9a96e]/30 uppercase tracking-widest text-center px-4">{label}</span>
    </div>
  );
}

/* ─── Counter strip ─── */
function Counter({ to, label, inView }: { to: number; label: string; inView: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(to / (duration / 16));
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return (
    <div className="text-center">
      <p className="font-display text-4xl lg:text-5xl text-white">{val.toLocaleString()}+</p>
      <p className="text-[11px] uppercase tracking-widest text-white/50 mt-1">{label}</p>
    </div>
  );
}

/* ─── Main export ─── */
export default function ArtisanatSection({ locale, t }: {
  locale: "en" | "fr" | "ar";
  t: {
    sectionEyebrow: string;
    sectionTitle: string;
    sectionSubtitle: string;
    stat1Value: number; stat1Label: string;
    stat2Value: number; stat2Label: string;
    stat3Value: number; stat3Label: string;
  };
}) {
  const crafts = CRAFTS[locale] ?? CRAFTS.en;
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerInView, setHeaderInView] = useState(false);

  useEffect(() => {
    const observe = (el: Element | null, cb: () => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); obs.disconnect(); } }, { threshold: 0.2 });
      obs.observe(el);
      return () => obs.disconnect();
    };
    const c1 = observe(statsRef.current, () => setStatsInView(true));
    const c2 = observe(headerRef.current, () => setHeaderInView(true));
    return () => { c1?.(); c2?.(); };
  }, []);

  return (
    <section className="bg-[#faf8f5] py-24 overflow-hidden" aria-labelledby="artisanat-heading">
      {/* ── Section header ── */}
      <div
        ref={headerRef}
        className={`max-w-3xl mx-auto px-6 text-center mb-16 transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#c9a96e] mb-4">{t.sectionEyebrow}</p>
        <h2 id="artisanat-heading" className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#1f1b16] leading-tight mb-5">
          {t.sectionTitle}
        </h2>
        <p className="text-[#6b6460] text-base leading-relaxed max-w-xl mx-auto">{t.sectionSubtitle}</p>
        {/* Decorative zellige motif */}
        <div className="flex items-center justify-center gap-3 mt-7">
          <div className="h-px w-16 bg-stone/20" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.2" opacity="0.7">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <div className="h-px w-16 bg-stone/20" />
        </div>
      </div>

      {/* ── Craft cards ── */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col gap-8">
        {crafts.map((craft, i) => (
          <CraftCard key={craft.id} craft={craft} index={i} />
        ))}
      </div>

      {/* ── Stats strip ── */}
      <div
        ref={statsRef}
        className={`mt-20 bg-[#1f1b16] py-14 transition-all duration-700 ${statsInView ? "opacity-100" : "opacity-0"}`}
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 divide-x divide-white/10">
          <Counter to={t.stat1Value} label={t.stat1Label} inView={statsInView} />
          <Counter to={t.stat2Value} label={t.stat2Label} inView={statsInView} />
          <Counter to={t.stat3Value} label={t.stat3Label} inView={statsInView} />
        </div>
      </div>
    </section>
  );
}
