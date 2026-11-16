import React, { useMemo, useState } from 'react';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import { createNewsletterSubscription } from '../../services/msrasiService';
import type { NewsArticle, RoutePath, ScientificEvent } from '../../types/msrasi';

interface HomePageProps {
  events: ScientificEvent[];
  articles: NewsArticle[];
  onNavigate: (route: RoutePath) => void;
  onSelectEvent: (eventId: string, targetRoute?: RoutePath) => void;
}

const DOMAIN_AXES = [
  {
    axe: 'Axe 01',
    icon: 'biotech',
    title: 'Recherche Scientifique Appliquée',
    desc: "Biotechnologies végétales et médicales, nanomatériaux pour le dessalement de l'eau et modélisation de santé prédictive.",
    stat: '12 Projets en cours',
    colorClass: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
    textAccent: 'text-primary',
  },
  {
    axe: 'Axe 02',
    icon: 'memory',
    title: 'Innovation & Nouvelles Technologies',
    desc: "Intelligence artificielle explicable, réseaux de capteurs IoT industriels, cybersécurité et pilotage d'énergies renouvelables (Smart Grids).",
    stat: '8 Chaires IA & Data',
    colorClass: 'bg-[#F58200]/10 text-[#F58200] group-hover:bg-[#F58200] group-hover:text-white',
    textAccent: 'text-[#F58200]',
  },
  {
    axe: 'Axe 03',
    icon: 'menu_book',
    title: 'Formation & Éducation Scientifique',
    desc: "Masterclasses doctorales certifiées, bootcamps en rédaction d'articles indexés et méthodologies de recherche computationnelle.",
    stat: '650 Diplômés certifiés',
    colorClass: 'bg-[#087a4b]/10 text-[#087a4b] group-hover:bg-[#087a4b] group-hover:text-white',
    textAccent: 'text-[#087a4b]',
  },
  {
    axe: 'Axe 04',
    icon: 'record_voice_over',
    title: 'Conférences & Congrès Internationaux',
    desc: 'Organisation de symposiums majeurs réunissant lauréats, membres de la diaspora marocaine et experts de classe mondiale.',
    stat: '4 Événements majeurs / an',
    colorClass: 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white',
    textAccent: 'text-secondary',
  },
  {
    axe: 'Axe 05',
    icon: 'precision_manufacturing',
    title: 'Ateliers Pratiques & FabLabs',
    desc: "Laboratoires ouverts pour le prototypage rapide, bancs d'essai en microélectronique et caractérisation de composants physiques.",
    stat: '3 Espaces Maker équipés',
    colorClass: 'bg-purple-700/10 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
    textAccent: 'text-purple-700',
  },
  {
    axe: 'Axe 06',
    icon: 'handshake',
    title: 'Liaison & Partenariats Industriels',
    desc: 'Interface dédiée au cofinancement R&D entre grands groupes marocains (énergie, phosphates, aéronautique) et laboratoires.',
    stat: '19 Conventions actives',
    colorClass: 'bg-teal-700/10 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
    textAccent: 'text-teal-700',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  events,
  articles,
  onNavigate,
  onSelectEvent,
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const publishedEvents = useMemo(
    () => events.filter((e) => e.status === 'publie' || e.status === 'en_attente'),
    [events]
  );

  const featuredEvent = useMemo(() => {
    return (
      publishedEvents.find((e) => e.featured) ||
      publishedEvents[0] ||
      events[0]
    );
  }, [publishedEvents, events]);

  const regularEvents = useMemo(() => {
    const filtered = publishedEvents.filter((e) => {
      if (selectedCategory === 'Tous') return true;
      return e.category === selectedCategory;
    });
    const list =
      selectedCategory === 'Tous'
        ? filtered.filter((e) => e.id !== featuredEvent?.id)
        : filtered;
    return list.slice(0, 3);
  }, [publishedEvents, selectedCategory, featuredEvent]);

  const publishedArticles = useMemo(
    () => articles.filter((a) => a.status === 'publie'),
    [articles]
  );
  const featuredArticle =
    publishedArticles.find((a) => a.featured) || publishedArticles[0];
  const sideArticles = publishedArticles
    .filter((a) => a.id !== featuredArticle?.id)
    .slice(0, 3);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubmittingNewsletter(true);
    try {
      await createNewsletterSubscription(newsletterEmail, true, 'accueil');
      showToast(
        "Merci pour votre inscription à la lettre d'information scientifique MSRASI."
      );
      setNewsletterEmail('');
    } catch {
      showToast(
        'Votre demande a été enregistrée. Vérifiez votre messagerie institutionnelle.',
        'info'
      );
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  const categoryButtons = [
    { label: 'Tous les événements', value: 'Tous' },
    { label: 'Conférences', value: 'Conférences' },
    { label: 'Ateliers', value: 'Ateliers' },
    { label: 'Formations', value: 'Formations' },
    { label: 'Compétitions & Hackathons', value: 'Compétitions & Hackathons' },
    { label: 'Séminaires', value: 'Séminaires' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: HERO SECTION */}
      <section className="relative w-full bg-[#10243B] text-white overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg
            className="w-full h-full object-cover"
            fill="none"
            viewBox="0 0 1440 900"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="200" cy="200" r="140" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
            <circle cx="1200" cy="400" r="220" stroke="currentColor" strokeDasharray="6 6" strokeWidth="1" />
            <path d="M150 150 L350 450 L720 200 L950 500 L1300 250" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="150" cy="150" fill="#659dff" r="6" />
            <circle cx="350" cy="450" fill="#ffdcc4" r="5" />
            <circle cx="720" cy="200" fill="#659dff" r="7" />
            <circle cx="950" cy="500" fill="#087a4b" r="6" />
            <circle cx="1300" cy="250" fill="#ffdcc4" r="8" />
            <g stroke="currentColor" strokeWidth="1" transform="translate(1150, 650) scale(1.4)">
              <polygon points="0,-60 18,-18 60,0 18,18 0,60 -18,18 -60,0 -18,-18" />
              <polygon points="-42,-42 0,-25 42,-42 25,0 42,42 0,25 -42,42 -25,0" />
            </g>
          </svg>
        </div>

        <div className="relative w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              <div className="inline-flex items-center gap-space-xs self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-secondary-fixed text-label-sm font-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                  hub
                </span>
                <span>Réseau National d&apos;Excellence &amp; Innovation</span>
              </div>

              <h1 className="font-display-hero text-headline-xl lg:text-display-hero text-white tracking-tight leading-tight">
                La science inspire.
                <br />
                L&apos;innovation transforme.
                <br />
                <span className="text-secondary-fixed-dim">
                  L&apos;avenir se construit ensemble.
                </span>
              </h1>

              <p className="font-body-lg text-body-lg text-slate-300 max-w-xl">
                La MSRASI œuvre pour promouvoir la recherche en sciences appliquées,
                encourager l&apos;innovation et créer des opportunités de collaboration
                scientifique à l&apos;échelle nationale et internationale.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('nos-activites')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary-container text-white font-label-md text-label-md hover:bg-[#F58200] transition-colors shadow-lg shadow-black/20 cursor-pointer"
                >
                  <span>Découvrir nos activités</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('evenements')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                    calendar_month
                  </span>
                  <span>Explorer les événements</span>
                </button>
              </div>

              <div className="pt-4 flex items-center gap-4 text-slate-400 font-code-citation text-code-citation">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-emerald-400">
                    verified
                  </span>
                  Partenaire Académique Accrédité
                </span>
                <span>•</span>
                <span>Pôles Universitaires Régionaux</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
                <SafeImage
                  src={HOTLINK_IMAGES.heroLab}
                  fallback={LOCAL_FALLBACK_IMAGES.lab}
                  alt="Laboratoire national MSRASI recherche appliquée et photonique"
                  className="w-full h-[440px] lg:h-[500px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10243B]/90 via-[#10243B]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-code-citation text-code-citation px-2.5 py-1 rounded bg-black/40 backdrop-blur-md">
                    Pôle Nanotechnologies &amp; Énergies — Rabat
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Laboratoire Ouvert
                  </span>
                </div>
              </div>

              <div className="absolute -top-6 -left-2 sm:left-4 bg-white text-on-surface p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">groups</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none tabular-nums">
                    +1,200
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Chercheurs &amp; Étudiants
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-2 sm:right-4 bg-white text-on-surface p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-[#F58200]">
                  <span className="material-symbols-outlined text-[26px]">science</span>
                </div>
                <div>
                  <div className="font-headline-sm text-headline-sm font-bold text-on-surface leading-none tabular-nums">
                    34 Projets
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    R&amp;D Soutenus en 2024-25
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex absolute top-1/2 -right-4 transform -translate-y-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
                  workspace_premium
                </span>
                <span className="font-label-md text-label-md">
                  18 Brevets &amp; Publications
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT THE ASSOCIATION */}
      <section className="w-full py-20 bg-surface" id="a-propos">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">
                  account_balance
                </span>
                <span>Fondation &amp; Vision</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Une association tournée vers la connaissance et l&apos;innovation.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Fondée sous les auspices de la communauté universitaire et industrielle du
                Royaume du Maroc, la{' '}
                <strong className="text-on-surface font-semibold">MSRASI</strong> réunit
                scientifiques de haut niveau, doctorants et entrepreneurs technologiques
                pour transformer la recherche fondamentale en retombées tangibles pour
                l&apos;économie nationale.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <h3 className="font-headline-xs text-headline-xs text-on-surface">
                      Excellence Académique
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Encadrement méthodologique et accès aux revues indexées pour stimuler
                    des travaux à fort impact mondial.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#087a4b] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        conversion_path
                      </span>
                    </div>
                    <h3 className="font-headline-xs text-headline-xs text-on-surface">
                      Transfert Technologique
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Passerelles concrètes entre brevets de laboratoire et industrialisation
                    locale par des spin-offs durables.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-[#F58200] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        emoji_people
                      </span>
                    </div>
                    <h3 className="font-headline-xs text-headline-xs text-on-surface">
                      Mentorat Scientifique
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Accompagnement personnalisé des doctorants marocains par des experts de
                    la diaspora et de l&apos;étranger.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-surface-container-low transition-all hover:bg-surface-container">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-secondary text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">public</span>
                    </div>
                    <h3 className="font-headline-xs text-headline-xs text-on-surface">
                      Rayonnement Mondial
                    </h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Accords multilatéraux avec les laboratoires d&apos;Afrique,
                    d&apos;Europe et d&apos;Amérique du Nord.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-sm text-label-sm px-2.5 py-1 rounded bg-[#E6F5EE] text-[#087a4b] font-semibold">
                      Organisme Agréé
                    </span>
                    <span className="font-code-citation text-code-citation text-on-surface-variant">
                      Statut Loi 75-00
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Un hub scientifique national pluridisciplinaire
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    Chaque initiative de la MSRASI répond aux orientations de la Stratégie
                    Nationale de Développement de la Recherche Scientifique à
                    l&apos;horizon 2030, axée sur la souveraineté technologique, médicale et
                    énergétique du Maroc.
                  </p>

                  <div className="p-4 rounded-xl bg-surface-container mb-6">
                    <div className="font-label-md text-label-md text-on-surface mb-2 font-bold flex justify-between">
                      <span>Répartition des Chaires de Recherche</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-primary-container"
                        style={{ width: '40%' }}
                        title="Sciences Numériques & IA (40%)"
                      />
                      <div
                        className="h-full bg-[#087a4b]"
                        style={{ width: '30%' }}
                        title="Énergie, Eau & Matériaux (30%)"
                      />
                      <div
                        className="h-full bg-[#F58200]"
                        style={{ width: '20%' }}
                        title="Biotechnologie & Santé (20%)"
                      />
                      <div
                        className="h-full bg-secondary-container"
                        style={{ width: '10%' }}
                        title="Sciences Humaines Appliquées (10%)"
                      />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-code-citation text-code-citation text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary-container" /> IA &amp;
                        Data 40%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#087a4b]" /> Énergie &amp;
                        Climat 30%
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#F58200]" /> Bio-Santé 20%
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('a-propos')}
                  className="inline-flex items-center justify-between w-full py-3 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors cursor-pointer"
                >
                  <span>Découvrir notre association &amp; gouvernance</span>
                  <span className="material-symbols-outlined text-[18px]">east</span>
                </button>
              </div>

              <div className="p-6 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-start gap-4">
                <span className="material-symbols-outlined text-tertiary-fixed text-[32px] shrink-0">
                  format_quote
                </span>
                <div>
                  <p className="font-body-sm text-body-sm italic text-slate-300">
                    « La valorisation des talents scientifiques marocains est la condition
                    première pour bâtir une nation résiliente et pionnière des technologies
                    émergentes. »
                  </p>
                  <div className="font-label-sm text-label-sm font-bold text-white mt-2">
                    Pr. Mohammed Al-Khatib — Président du Conseil Scientifique
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SCIENTIFIC FIELDS AND ACTIVITIES */}
      <section className="w-full py-20 bg-surface-container-low" id="activites">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface text-primary font-label-sm text-label-sm uppercase tracking-wider mb-3">
                <span className="material-symbols-outlined text-[16px]">interests</span>
                <span>Champs d&apos;Action</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Nos Domaines &amp; Pôles Scientifiques
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Des programmes intégrés conçus pour catalyser la découverte, outiller les
                équipes de recherche et relier le laboratoire à la société.
              </p>
            </div>
            <div className="mt-4 md:mt-0 font-code-citation text-code-citation text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">
                auto_stories
              </span>
              6 Pôles Opérationnels Actifs
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAIN_AXES.map((item) => (
              <button
                key={item.axe}
                type="button"
                onClick={() => onNavigate('nos-activites')}
                className="group text-left p-6 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors ${item.colorClass}`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {item.icon}
                    </span>
                  </div>
                  <div
                    className={`font-label-sm text-label-sm uppercase font-bold tracking-wider mb-1 ${item.textAccent}`}
                  >
                    {item.axe}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-between text-on-surface-variant font-code-citation text-code-citation w-full">
                  <span>{item.stat}</span>
                  <span
                    className={`material-symbols-outlined text-[18px] ${item.textAccent} group-hover:translate-x-1 transition-transform`}
                  >
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: UPCOMING EVENTS */}
      <section className="w-full py-20 bg-surface" id="evenements">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col space-y-6 mb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F5EE] text-[#087a4b] font-label-sm text-label-sm uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-[16px]">
                    event_available
                  </span>
                  <span>Agenda Scientifique 2025 - 2026</span>
                </div>
                <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                  Nos prochains rendez-vous scientifiques
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('evenements')}
                className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-secondary transition-colors self-start md:self-auto cursor-pointer"
              >
                <span>Voir le calendrier complet</span>
                <span className="material-symbols-outlined text-[18px]">
                  calendar_view_month
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {categoryButtons.map((btn) => {
                const active = selectedCategory === btn.value;
                return (
                  <button
                    key={btn.value}
                    type="button"
                    onClick={() => setSelectedCategory(btn.value)}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURED EVENT */}
          {featuredEvent && (
            <div className="w-full rounded-2xl bg-surface-container-lowest shadow-md overflow-hidden mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-6 relative min-h-[300px] lg:min-h-[420px]">
                  <SafeImage
                    src={HOTLINK_IMAGES.cisaSpotlight}
                    fallback={LOCAL_FALLBACK_IMAGES.conference}
                    alt={featuredEvent.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-6 left-6 bg-[#10243B] text-white px-4 py-3 rounded-xl shadow-lg flex flex-col items-center">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-container">
                      OCT
                    </span>
                    <span className="font-headline-lg text-headline-lg font-bold leading-none my-1">
                      14-16
                    </span>
                    <span className="font-code-citation text-code-citation text-slate-300">
                      2025
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F5EE] text-[#087a4b] font-label-md text-label-md shadow-md">
                    <span className="w-2 h-2 rounded-full bg-[#087a4b] animate-ping" />
                    <span>Inscriptions &amp; Call for Papers Ouverts</span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded bg-[#EAF2FC] text-primary font-label-sm text-label-sm font-semibold">
                        Symposium International
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          location_on
                        </span>
                        {featuredEvent.location}
                      </span>
                    </div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface mb-4 leading-snug">
                      {featuredEvent.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                      {featuredEvent.shortSummary}
                    </p>
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low mb-6 text-center">
                      <div>
                        <div className="font-headline-sm text-headline-sm font-bold text-primary tabular-nums">
                          450+
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          Participants
                        </div>
                      </div>
                      <div>
                        <div className="font-headline-sm text-headline-sm font-bold text-primary tabular-nums">
                          60
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          Conférenciers
                        </div>
                      </div>
                      <div>
                        <div className="font-headline-sm text-headline-sm font-bold text-primary tabular-nums">
                          12
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          Workshops Hands-on
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 self-start sm:self-auto font-code-citation text-code-citation text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px] text-tertiary">
                        timer
                      </span>
                      <span>
                        Date limite soumission résumés :{' '}
                        <strong>30 Août 2025</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(featuredEvent.id, 'evenement-detail')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-secondary text-white font-label-md text-label-md transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Découvrir l&apos;événement</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRID OF 3 REGULAR EVENT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {regularEvents.map((evt, index) => {
              const remaining = Math.max(0, evt.capacity - evt.registeredCount);
              const gradientCard =
                index === 1
                  ? 'from-primary-container to-secondary'
                  : 'from-tertiary-container to-[#572a00]';

              return (
                <div
                  key={evt.id}
                  className="rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {index === 0 ? (
                      <div className="relative h-44 w-full">
                        <SafeImage
                          src={evt.imageUrl}
                          fallback={LOCAL_FALLBACK_IMAGES.lab}
                          alt={evt.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#10243B] text-white px-2.5 py-1 rounded-lg text-center font-bold text-xs shadow-md uppercase">
                          {evt.dateLabel}
                        </div>
                        <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-on-surface font-label-sm text-label-sm font-semibold">
                          {evt.category}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`p-6 bg-gradient-to-br ${gradientCard} text-white relative`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-white/20 px-2.5 py-1 rounded-lg text-center font-bold text-xs uppercase">
                            {evt.dateLabel}
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-label-sm text-label-sm">
                            {evt.category}
                          </span>
                        </div>
                        <div className="font-headline-sm text-headline-sm font-bold leading-tight line-clamp-2">
                          {evt.title}
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant mb-2">
                        <span className="material-symbols-outlined text-[16px]">
                          location_on
                        </span>
                        <span className="truncate">{evt.location}</span>
                      </div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2 line-clamp-2">
                        {evt.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                        {evt.shortSummary}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-[#087a4b] font-semibold">
                      {remaining > 0
                        ? `${remaining} places restantes`
                        : 'Liste d’attente ouverte'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt.id, 'evenement-detail')}
                      className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-secondary cursor-pointer"
                    >
                      <span>{index === 0 ? "S'inscrire" : 'Consulter'}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onNavigate('evenements')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-all shadow-sm cursor-pointer"
            >
              <span>Voir tous les événements de l&apos;année</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: LATEST NEWS AND ANNOUNCEMENTS */}
      <section className="w-full py-20 bg-surface-container-low" id="actualites">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface text-primary font-label-sm text-label-sm uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">feed</span>
                <span>Publications &amp; Communiqués</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                Actualités de l&apos;association
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('actualites')}
              className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-secondary mt-3 md:mt-0 cursor-pointer"
            >
              <span>Accéder aux archives de presse</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_right_alt
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {featuredArticle && (
              <article
                onClick={() => setActiveArticle(featuredArticle)}
                className="lg:col-span-7 rounded-2xl bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-200">
                    <SafeImage
                      src={featuredArticle.imageUrl}
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-white font-label-sm text-label-sm">
                      {featuredArticle.category}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-code-citation text-code-citation mb-3">
                      <span>Rabat</span>
                      <span>•</span>
                      <span>Publié le {featuredArticle.publishedLabel}</span>
                      <span>•</span>
                      <span>{featuredArticle.author}</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                      {featuredArticle.summary}
                    </p>
                  </div>
                </div>
                <div className="px-8 pb-8 pt-0 flex items-center justify-between">
                  <span className="font-code-citation text-code-citation text-on-surface-variant">
                    Temps de lecture : 4 min
                  </span>
                  <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold">
                    <span>Lire le communiqué complet</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </article>
            )}

            <div className="lg:col-span-5 flex flex-col gap-4">
              {sideArticles.map((art, i) => {
                const badgeStyle =
                  i === 0
                    ? 'bg-[#FFF4E5] text-[#F58200]'
                    : i === 1
                    ? 'bg-[#E6F5EE] text-[#087a4b]'
                    : 'bg-[#EAF2FC] text-primary';
                return (
                  <article
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className="p-6 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded font-label-sm text-label-sm font-semibold ${badgeStyle}`}
                        >
                          {art.category}
                        </span>
                        <span className="font-code-citation text-code-citation text-on-surface-variant">
                          {art.publishedLabel}
                        </span>
                      </div>
                      <h4 className="font-headline-xs text-headline-xs text-on-surface mb-2 hover:text-primary transition-colors">
                        {art.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {art.summary}
                      </p>
                    </div>
                    <div className="pt-3 flex items-center justify-between text-xs text-primary font-semibold">
                      <span>{art.department}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        chevron_right
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: INSTITUTIONAL PARTNERS */}
      <section className="w-full py-16 bg-surface">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">
              Écosystème Partenaire
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
              Ils soutiennent et collaborent avec la MSRASI
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
            {[
              { code: 'UM6P', name: 'Université Mohammed VI Polytechnique' },
              { code: 'CNRST', name: 'Centre National pour la Recherche' },
              { code: 'UM5 Rabat', name: 'Université Mohammed V' },
              { code: 'MAScIR', name: 'Moroccan Foundation for Advanced Science' },
              { code: 'FSR', name: 'Faculté des Sciences de Rabat' },
            ].map((p, idx) => (
              <div
                key={p.code}
                className={`h-24 rounded-xl bg-surface-container-low p-4 flex flex-col items-center justify-center text-center group hover:bg-surface-container transition-colors ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors tracking-tight">
                  {p.code}
                </span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: NEWSLETTER CTA */}
      <section className="w-full py-16 bg-gradient-to-r from-[#10243B] via-[#1646A8] to-[#10243B] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" fill="none" viewBox="0 0 1200 400">
            <path d="M0 200 C300 100, 600 300, 1200 200" stroke="white" strokeWidth="2" />
            <path
              d="M0 100 C400 300, 800 50, 1200 250"
              stroke="white"
              strokeDasharray="6 6"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="relative w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-tertiary-fixed">
              <span className="material-symbols-outlined text-[32px]">
                mark_email_unread
              </span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-white tracking-tight">
              Restons connectés à l&apos;innovation scientifique marocaine
            </h2>
            <p className="font-body-md text-body-md text-slate-200 max-w-xl">
              Recevez mensuellement les appels à communication, les synthèses de nos
              congrès, les invitations aux workshops et les offres de bourses de
              recherche.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 pt-2"
            >
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Votre adresse courriel académique ou professionnelle"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-on-surface placeholder-slate-400 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submittingNewsletter}
                className="w-full sm:w-auto shrink-0 h-12 px-8 rounded-xl bg-[#F58200] hover:bg-[#ff9924] text-white font-label-md text-label-md font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{submittingNewsletter ? 'Envoi...' : "S'abonner"}</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>

            <p className="font-code-citation text-code-citation text-slate-400">
              En vous inscrivant, vous acceptez notre politique de protection des données
              scientifiques. Désabonnement à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Article Quick Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="relative h-56 w-full">
              <SafeImage
                src={activeArticle.imageUrl}
                fallback={LOCAL_FALLBACK_IMAGES.conference}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-primary text-white font-label-sm">
                {activeArticle.category}
              </span>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
                <span>{activeArticle.publishedLabel}</span>
                <span>•</span>
                <span>{activeArticle.author}</span>
                <span>•</span>
                <span>{activeArticle.department}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {activeArticle.title}
              </h3>
              <p className="font-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {activeArticle.content || activeArticle.summary}
              </p>
              <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setActiveArticle(null);
                    onNavigate('actualites');
                  }}
                  className="px-4 py-2 rounded-lg bg-surface-container text-primary font-label-md hover:bg-surface-container-high cursor-pointer"
                >
                  Toutes les actualités
                </button>
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 rounded-lg bg-primary text-white font-label-md hover:bg-secondary cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
