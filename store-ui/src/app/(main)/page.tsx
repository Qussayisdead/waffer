"use client";

import { useEffect, useRef, useState } from "react";
import { cachedRequest } from "../../lib/api";

const brandName = "????";
const stores = [
  {
    name: "\u0628\u0646 \u0627\u0644\u062c\u0628\u0644",
    category: "\u0645\u062d\u0627\u0645\u0635 \u0648\u0645\u0643\u0633\u0631\u0627\u062a",
    location: "\u0631\u0627\u0645 \u0627\u0644\u0644\u0647",
    facebook: "#",
    instagram: "#"
  },
  {
    name: "\u0627\u0644\u0647\u0644\u0627\u0644",
    category: "\u0633\u0648\u0628\u0631 \u0645\u0627\u0631\u0643\u062a",
    location: "\u0646\u0627\u0628\u0644\u0633",
    facebook: "#",
    instagram: "#"
  },
  {
    name: "\u062a\u0645\u0648\u064a\u0646\u0627\u062a \u0627\u0644\u062d\u064a",
    category: "\u0628\u0642\u0627\u0644\u0629 \u0648\u062d\u0644\u0648\u064a\u0627\u062a",
    location: "\u0627\u0644\u062e\u0644\u064a\u0644",
    facebook: "#",
    instagram: "#"
  }
];

const defaultAds = [
  {
    title: "حملة خصم العيد",
    body: "خصم مميز لمدة محدودة للعملاء المشاركين.",
    date: "هذا الاسبوع",
    link_url: "",
    image_url: ""
  },
  {
    title: "مكافآت أكبر",
    body: "استبدل نقاطك بقسائم قيمتها أعلى.",
    date: "هذا الشهر",
    link_url: "",
    image_url: ""
  },
  {
    title: "شراكات جديدة",
    body: "انضمام متاجر جديدة للشبكة.",
    date: "اليوم",
    link_url: "",
    image_url: ""
  }
];

export default function LandingPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const [ads, setAds] = useState(defaultAds);
  const storesTrackRef = useRef<HTMLDivElement | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [chatInput, setChatInput] = useState("");
        const [chatMessages, setChatMessages] = useState<
    { id: number; role: "user" | "bot"; text: string }[]
  >([
    {
      id: 1,
      role: "bot",
      text: "????? ??! ??? ?????? ??? ??????? ?? ?? ??? ??? ????: ???????? ????????? ????????? ??????? ???? ???????? ?????????."
    }
  ]);

    const faqs = [
    {
      question: "??? ???? ????? ????? ??????? ?????",
      answer:
        "???? ????? ?? ???? ???????? ?? ???? ?????? ???? ???? ????? ????? ??. ??? ??? ???? ?? ??????/QR ??????? ??? ??????? ?????? ??? ?????."
    },
    {
      question: "?? ?? ????? ???? ??????? (Golden)?",
      answer:
        "????? VIP ???? ????? ?????? ??? ???? ???? ???? ??????. ????? ????? ?? ???? ??? ??????? ???????? ?????? ???????? ????????."
    },
    {
      question: "??? ???? ??????? ????????",
      answer:
        "???? ??? ???? ??? ???????? ??? ????? ???? ??????/?????? ????????? ?? ???? ?????. ????? ?????? ?? ??????."
    },
    {
      question: "?? ????? ??? ??? QR ????????? 1D?",
      answer:
        "???????? 1D ????? ?????? ????? ?? ???????? ???? QR ????? ????? ???????. ????? ??????? ?? ????? ??? ??????."
    },
    {
      question: "??? ??? ????? ????????/??? QR?",
      answer:
        "?? ???? ?????? ???? ??????? ??? ????? ????? ???????? ?? ???? ??? ?????? ???? ?????? ?????."
    },
    {
      question: "?? ?? ???? ????? ??? ???????",
      answer:
        "???? ????? ?????? ?????? ??? ????? ??????. ?????? ???? ??? ???? ??? ?????? ??? ????? ?????."
    },
    {
      question: "??? ???? ???????/??????????",
      answer:
        "??????? ???? ?????? ?????? ???? ?????? ?????? ?????? ????? ?????? ??????? ??????."
    },
    {
      question: "??? ???? ?????? ??????????",
      answer:
        "??? ?? ?????? ?????? ???? ???? ??? ????? ??????. ???? ??????? ?????? ?????? ?? ?????? ?? ???? ??????."
    },
    {
      question: "??? ???? ???? ???? ??? ?? ????????",
      answer:
        "?? ???? ??????? ??? ?????? ?????? ???? ???? ????? ????????. ??????? ???? ??? ???????? ?????????."
    },
    {
      question: "??? ??? ???????? ????????????",
      answer:
        "???? ??????? ????? ??? ?????? ????? ??????? ??????? ???????? ????????? ?????????."
    },
    {
      question: "??? ?????? ?????? ????????",
      answer:
        "?????? ????? ????? ????? ????? ?????? ?? ??? ?????? ???? ???? ????? ??? ???? ??????."
    },
    {
      question: "?? ???????? ?????",
      answer:
        "???? ??? ??? ???????? ?? ????? ?????? ????? ?? ??????? ????? ??? ?????? ???????? ???????."
    },
    {
      question: "??? ?????? ?? ??????",
      answer:
        "????? ???????? ??? ?????? ?? ?????? ??????? ?? ???? ??????? ????? ???? ??????."
    }
  ];

        const respondToMessage = (input: string) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return "???? ????? ???????? ?????.";
    if (normalized.includes("?????") || normalized.includes("vip") || normalized.includes("golden")) {
      return "????? ???? ??????? ???? ????? ?????? ????? ????. ????? ????? ?? ???? ??? ??????? ???????? ?????? ???.";
    }
    if (normalized.includes("???") || normalized.includes("?????") || normalized.includes("application")) {
      return "?????? ??? ???????: ???? ???? ??? ???????? ???? ????????? ????? ?????. ?????? ?????? ?????.";
    }
    if (normalized.includes("?????") || normalized.includes("signup") || normalized.includes("register")) {
      return "????? ??????? ????? ?? ???? ???????? ?? ????? ?????? ?????? ????? ?????? ?????? ?????.";
    }
    if (normalized.includes("????") || normalized.includes("login") || normalized.includes("????? ????")) {
      return "???? ?????? ??????? ????? ??????. ??? ???? ???? ??????? ????? ?? ????? ?????? ???????.";
    }
    if (normalized.includes("???") || normalized.includes("discount")) {
      return "???? ????? ?????? ?????? ??? ????. ??? ????? ??? ?????? ???? ???????? ??? ???? ????.";
    }
    if (normalized.includes("?????") || normalized.includes("commission")) {
      return "??????? ????? ??? ????? ?????? ????? ?? ?????? ??????? ?????????.";
    }
    if (normalized.includes("????") || normalized.includes("points") || normalized.includes("????")) {
      return "?????? ?????? ??? ?? ????? ??? ????? ?????? ????? ????????? ?????? ?? ??????.";
    }
    if (normalized.includes("?????") || normalized.includes("voucher") || normalized.includes("??????")) {
      return "??????? ????? ??? ???? ??????? ?? ??? ???? ????????? ????? ?????? ?? ???? ?????.";
    }
    if (normalized.includes("??????") || normalized.includes("barcode") || normalized.includes("1d")) {
      return "???????? 1D ????? ?????? ????? ?? ???????. ????? ???????? ??? ??? QR ??? ???? ??????? ?? ???? QR.";
    }
    if (normalized.includes("qr") || normalized.includes("???") || normalized.includes("???")) {
      return "??? QR ????? ????? ??????? ????? ???? ????? ???????? ??????? ??????.";
    }
    if (normalized.includes("?????") || normalized.includes("terminal") || normalized.includes("???????")) {
      return "??????? ???? ?????? ????? ??? ?????? ?????? ??????? ??????? ??????.";
    }
    if (normalized.includes("????") || normalized.includes("store")) {
      return "?????? ???? ?????? ????? ????? ????????. ?????? ????? ?????? ?? ???? ?????? ?????? ?????.";
    }
    if (normalized.includes("????") || normalized.includes("admin") || normalized.includes("?????")) {
      return "???? ??????? ?????? ??????? ???????? ????????? ??????? ???????? ????????? ????????.";
    }
    if (normalized.includes("?????") || normalized.includes("report") || normalized.includes("??????")) {
      return "???????? ?????? ?? ???? ??????? ????? ????????? ????????? ????????? ?? ?????? ????????.";
    }
    if (normalized.includes("???") || normalized.includes("?????") || normalized.includes("help")) {
      return "????? ???? ??? ?????? ?? ?????? ?? ???? ??????? ????? ???? ?????.";
    }
    return "?? ???? ?????? ??????. ???? ?????? ?????? ???: ???? ????? ?????? ?????? ????? ?? ?????.";
  };

  const handleChatSend = () => {
    const input = chatInput.trim();
    if (!input) return;
    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      text: input
    };
    const botMessage = {
      id: Date.now() + 1,
      role: "bot" as const,
      text: respondToMessage(input)
    };
    setChatMessages((prev) => [...prev, userMessage, botMessage]);
    setChatInput("");
  };

  useEffect(() => {
    const loadAds = async () => {
      try {
        type AdApiItem = {
          title: string;
          body: string;
          link_url?: string | null;
          image_url?: string | null;
          created_at: string;
        };
        const response = await cachedRequest<AdApiItem[]>("/api/v1/public/ads", undefined, 60000);
        const items = response.data.map((item) => ({
          title: item.title,
          body: item.body,
          link_url: item.link_url || "",
          image_url: item.image_url ? `${baseUrl}${item.image_url}` : "",
          date: new Date(item.created_at).toLocaleDateString("ar-EG")
        }));
        if (items.length > 0) setAds(items);
      } catch {
        setAds(defaultAds);
      }
    };
    loadAds();
  }, [baseUrl]);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0", "scale-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleStoresScroll = (direction: "left" | "right") => {
    const track = storesTrackRef.current;
    if (!track) return;
    const scrollAmount = Math.min(420, track.clientWidth * 0.8);
    track.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-black">
      <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full bg-emerald-100/70 blur-3xl animate-float-slow" />
      <div
        className="absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-black/5 blur-3xl animate-float-slow"
        style={{ animationDelay: "2s" }}
      />

      <header className="relative z-10 px-6 pt-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-black/10 bg-white/80 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 shadow-sm">
              <img className="h-20 w-20 object-contain" src="/logo.png" alt="Logo" />
            </div>
            <div>
              <p className="text-lg font-semibold text-black">????? ????</p>
              <p className="text-xs text-black/60">????? ??? ??????? ???? ?? ???</p>
            </div>
          </div>
          <a
            className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            href="/choose-role"
          >
            ابدأ الآن
          </a>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="px-6 pb-16 pt-12 animate-fade-up">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-sm text-emerald-800">
                واجهة موحدة للمتجر والعميل
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-black md:text-5xl">
                {brandName}
                <span className="block text-emerald-700">
                 <br></br> وفّر ... اشتري اكثر, وادفع أقل!
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-black/70">
              انتهى زمن دفع السعر الكامل... منصة وفّر أصبحت بين يديك!
              <br></br>
                نظام بسيط يجمع بين التوفير والمكافآت للعملاء مع تحليل مباشر للمتجر.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.35)] transition hover:bg-emerald-800"
                  href="/choose-role"
                >
                  سجّل الآن وابدأ التوفير
                </a>
                <a
                  className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black transition hover:border-emerald-300 hover:text-emerald-700"
                  href="#stores"
                >
                  المتاجر المشاركة
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[36px] border border-black/10 bg-black/5 shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                <video
                  className="h-full w-full object-cover"
                  src="/video.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-emerald-200/20" />
              </div>
              <div className="absolute -bottom-8 right-6 rounded-3xl bg-white px-5 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                <p className="text-sm font-semibold text-black">
                  بطاقة توفير في جيبك
                </p>
                <p className="text-xs text-black/60">
                  مسح واحصل على التوفير
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {[
              {
                label: "عدد المتاجر",
                value: "120+"
              },
              {
                label: "عدد البطاقات",
                value: "14K"
              },
              {
                label: "متوسط التوفير",
                value: "30%"
              }
            ].map((stat) => (
              <div
                data-reveal
                className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-[0_16px_40px_rgba(0,0,0,0.08)] opacity-0 translate-y-6 scale-95 transition-all duration-700"
                key={stat.label}
              >
                <p className="text-3xl font-semibold text-black">{stat.value}</p>
                <p className="mt-2 text-sm text-black/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-700">كيف تعمل المنصة</p>
                <h2 className="text-2xl font-semibold text-black">
                  ثلاث خطوات بسيطة للبدء
                </h2>
              </div>
              <p className="max-w-md text-sm text-black/60">
                مسار واضح يربط المتجر والعميل وينهي العملية بالتوفير.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 7h16M6 3h12v4H6zM5 7v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
                      <path d="M9 11h6" />
                    </svg>
                  ),
                  title: "إصدر بطاقة",
                  desc: "أنشئ بطاقة للعميل واربطها بالمتجر."
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <rect x="3" y="3" width="8" height="8" rx="1.5" />
                      <rect x="13" y="3" width="8" height="8" rx="1.5" />
                      <rect x="3" y="13" width="8" height="8" rx="1.5" />
                      <path d="M13 13h4v4h4" />
                    </svg>
                  ),
                  title: "مسح الرمز",
                  desc: "امسح QR عند الكاشير لحساب الخصم."
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 3v18M5 7h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h12" />
                    </svg>
                  ),
                  title: "اكسب النقاط",
                  desc: "تجمع النقاط واستبدلها بقسائم."
                }
              ].map((step) => (
                <div
                  data-reveal
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)] opacity-0 translate-y-6 scale-95 transition-all duration-700"
                  key={step.title}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-black">{step.title}</h3>
                  <p className="mt-2 text-sm text-black/60">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16" id="vip-cards" dir="rtl">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">بطاقات كبار العملاء</p>
              <h2 className="text-3xl font-semibold text-black md:text-4xl">البطاقة الذهبية</h2>
              <p className="max-w-xl text-base leading-relaxed text-black/70">
                ارتقِ بتجربة التوفير مع البطاقة الذهبية المميزة. استمتع بعروض حصرية، دعم أولوية،
                وتصميم أنيق يعكس مكانتك كعميل VIP.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-black/70">
                <span className="rounded-full border border-black/10 bg-white px-4 py-2">خصومات حصرية</span>
                <span className="rounded-full border border-black/10 bg-white px-4 py-2">عروض VIP</span>
                <span className="rounded-full border border-black/10 bg-white px-4 py-2">دعم أولوية</span>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  href="/vip-card-application"
                className="block rounded-2xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                ???? ??? ???????
              </a>
                <a className="text-sm font-semibold text-emerald-700" href="/choose-role">
                  اعرف المزيد
                </a>
              </div>
            </div>
            <div className="relative">
              <div
                data-reveal
                className="relative overflow-hidden rounded-[32px] border border-amber-200/60 bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)] opacity-0 translate-y-6 scale-95 transition-all duration-700"
              >
                <svg viewBox="0 0 520 320" className="h-full w-full" role="img" aria-label="Golden QR code card">
                  <defs>
                    <linearGradient id="goldenCardGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="45%" stopColor="#FBBF24" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="goldenCardGlow" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                  </defs>
                  <rect x="12" y="12" width="496" height="296" rx="28" fill="url(#goldenCardGradient)" />
                  <rect x="28" y="28" width="464" height="264" rx="24" fill="url(#goldenCardGlow)" opacity="0.6" />
                  <rect x="44" y="62" width="140" height="96" rx="14" fill="rgba(0,0,0,0.15)" />
                  <rect x="58" y="76" width="36" height="36" rx="6" fill="rgba(0,0,0,0.35)" />
                  <rect x="102" y="76" width="68" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="102" y="96" width="68" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="58" y="126" width="112" height="12" rx="6" fill="rgba(0,0,0,0.28)" />
                  <rect x="320" y="72" width="140" height="140" rx="18" fill="rgba(0,0,0,0.2)" />
                  <rect x="336" y="88" width="36" height="36" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="380" y="88" width="64" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="380" y="108" width="64" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="132" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="152" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <rect x="336" y="172" width="108" height="12" rx="6" fill="rgba(255,255,255,0.7)" />
                  <text x="56" y="214" fill="rgba(0,0,0,0.55)" fontSize="18" fontWeight="600">
                    GOLDEN VIP CARD
                  </text>
                  <text x="56" y="246" fill="rgba(0,0,0,0.4)" fontSize="14">
                    5288 9031 4521 1149
                  </text>
                  <text x="56" y="272" fill="rgba(0,0,0,0.4)" fontSize="12">
                    VALID 12/28
                  </text>
                </svg>
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl border border-amber-200/60 bg-white/80 px-4 py-3 text-xs font-semibold text-black shadow-[0_15px_35px_rgba(0,0,0,0.15)] backdrop-blur">
                يشمل عضوية المستوى الذهبي
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black/95 px-6 py-16 text-white" id="stores">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-300">{"\u0645\u062a\u0627\u062c\u0631\u0646\u0627"}</p>
                <h2 className="text-2xl font-semibold">{"\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u062a\u0627\u062c\u0631 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629"}</h2>
              </div>
              <p className="max-w-md text-sm text-white/70">
                {"\u062a\u0639\u0631\u0641 \u0639\u0644\u0649 \u0645\u062a\u0627\u062c\u0631 \u0645\u062e\u062a\u0627\u0631\u0629 \u0645\u0646 \u0634\u0628\u0643\u062a\u0646\u0627."}
              </p>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/90 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/90 to-transparent" />
              <button
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm text-white transition hover:bg-emerald-600"
                type="button"
                onClick={() => handleStoresScroll("left")}
                aria-label="Scroll left"
              >
                {"<"}
              </button>
              <button
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm text-white transition hover:bg-emerald-600"
                type="button"
                onClick={() => handleStoresScroll("right")}
                aria-label="Scroll right"
              >
                {">"}
              </button>
              <div
                ref={storesTrackRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
              >
                {stores.map((store) => (
                  <div
                    data-reveal
                    className="flex min-w-[260px] snap-start flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 opacity-0 translate-y-6 scale-95 transition-all duration-700 sm:min-w-[320px]"
                    key={store.name}
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <p className="text-sm text-white/70">{store.category}</p>
                      <p className="text-xs text-white/50">{"\u0627\u0644\u0645\u0648\u0642\u0639: "}{store.location}</p>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm">
                      <a
                        className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-emerald-500"
                        href={store.facebook}
                      >
                        {"\u0641\u064a\u0633\u0628\u0648\u0643"}
                      </a>
                      <a
                        className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-emerald-500"
                        href={store.instagram}
                      >
                        {"\u0627\u0646\u0633\u062a\u063a\u0631\u0627\u0645"}
                      </a>
                      <a
                        className="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-emerald-500"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.location)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {"\u0627\u0644\u0645\u0648\u0642\u0639"}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16" id="ads">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-emerald-700">آخر الإعلانات</p>
                <h2 className="text-2xl font-semibold text-black">
                  عروض وحملات المتاجر
                </h2>
              </div>
              <p className="max-w-md text-sm text-black/60">
                آخر العروض والحملات الترويجية من المتاجر المشاركة.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {ads.map((ad) => (
                <div
                  data-reveal
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)] opacity-0 translate-y-6 scale-95 transition-all duration-700"
                  key={ad.title}
                >
                  <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
                    {ad.date}
                  </div>
                  {ad.image_url && (
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="mb-4 h-36 w-full rounded-2xl object-cover"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-black">{ad.title}</h3>
                  <p className="mt-2 text-sm text-black/60">{ad.body}</p>
                  {ad.link_url && (
                    <a
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
                      href={ad.link_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      معرفة المزيد
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/95 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8">
          <div className="space-y-3">
            <p className="text-lg font-semibold text-white">{brandName}</p>
            <p className="max-w-sm text-sm text-white/70">
              نطاق واسع من المتاجر والعملاء لتجربة التوفير ومكافآت أفضل.
            </p>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="text-white">روابط سريعة</p>
            <a className="block hover:text-emerald-300" href="#stores">
              المتاجر
            </a>
            <a className="block hover:text-emerald-300" href="#ads">
              الإعلانات
            </a>
          </div>
          <div className="space-y-2 text-sm text-white/70">
            <p className="text-white">تواصل معنا</p>
            <p>support@wafercash.com</p>
            <p>0598639313</p>

            <div className="flex items-center gap-3 pt-2">
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-emerald-300 hover:text-emerald-300"
                href="#"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="16.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-emerald-300 hover:text-emerald-300"
                href="#"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M13.5 9.5h2.6V7.2c0-1-.1-2.6-2.8-2.6-2.2 0-3.5 1.3-3.5 3.6v1.3H7.5v2.7h2.3v6.3h3V12.2h2.4l.3-2.7h-2.7V9.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isFaqOpen && (
          <div
            className="w-[320px] overflow-hidden rounded-3xl border border-emerald-200/60 bg-white/95 shadow-[0_25px_60px_rgba(0,0,0,0.22)] backdrop-blur"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">FAQ</p>
                <p className="text-lg font-semibold text-black">مساعد سريع</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-emerald-200 px-3 py-1 text-xs text-emerald-700 hover:border-emerald-300"
                onClick={() => setIsFaqOpen(false)}
              >
                ?????
              </button>
            </div>
            <div className="max-h-[360px] space-y-3 overflow-y-auto px-5 py-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
                ?????! ???? ?? ???? ?? ??????? ??????? ???? ?? ???? ?????.
              </div>
              <div className="space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-sm text-white"
                        : "rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-black/80"
                    }
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-black outline-none focus:border-emerald-400"
                  placeholder="???? ????? ???..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleChatSend();
                  }}
                />
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  onClick={handleChatSend}
                >
                  ?????
                </button>
              </div>
              <div className="grid gap-2">
                {faqs.map((item, index) => (
                  <button
                    key={item.question}
                    type="button"
                    className={
                      index === activeFaq
                        ? "rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-right text-sm text-black shadow-sm"
                        : "rounded-2xl border border-transparent bg-emerald-50/40 px-4 py-3 text-right text-sm text-emerald-800 hover:border-emerald-200 hover:bg-white"
                    }
                    onClick={() => setActiveFaq(index)}
                  >
                    {item.question}
                  </button>
                ))}
              </div>
              {activeFaq !== null && (
                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-black/80">
                  {faqs[activeFaq].answer}
                </div>
              )}
              <a
                href="/vip-card-application"
                className="block rounded-2xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                قدّم طلبك الآن
              </a>
            </div>
          </div>
        )}
        <button
          type="button"
          className="flex items-center gap-3 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.4)] transition hover:bg-emerald-800"
          onClick={() => setIsFaqOpen((prev) => !prev)}
          aria-expanded={isFaqOpen}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 17l-1 4 4-1 9-9a2.8 2.8 0 0 0-4-4l-9 9z" />
              <path d="M14 7l4 4" />
            </svg>
          </span>
          {isFaqOpen ? "\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629" : "\u0645\u0633\u0627\u0639\u062f \u0633\u0631\u064a\u0639"}
        </button>
      </div>
    </div>
  );
}
