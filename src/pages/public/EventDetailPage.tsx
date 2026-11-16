import React, { useState } from 'react';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import {
  DEFAULT_PROGRAM_DAYS,
  DEFAULT_SPEAKERS,
  DEFAULT_TARIFF_TIERS,
  HOTLINK_IMAGES,
  LOCAL_FALLBACK_IMAGES,
} from '../../data/seedData';
import { downloadIcsForEvent } from '../../services/msrasiService';
import type { RoutePath, ScientificEvent, TariffTier } from '../../types/msrasi';

interface EventDetailPageProps {
  event: ScientificEvent;
  selectedTariff: TariffTier;
  onSelectTariff: (tier: TariffTier) => void;
  onNavigate: (route: RoutePath) => void;
}

const FAQS = [
  {
    id: 'faq-1',
    q: "Les doctorants bénéficient-ils d'une prise en charge ?",
    a: "Oui. L'association MSRASI octroie 40 bourses d'hébergement complètes pour les doctorants dont la communication orale ou le poster a été retenu avec avis très favorable par le comité d'arbitrage.",
  },
  {
    id: 'faq-2',
    q: 'Les actes du congrès seront-ils indexés ?',
    a: "Absolument. Tous les articles complets acceptés et présentés feront l'objet d'une publication dans le recueil des actes officiel MSRASI avec attribution d'un DOI individuel, indexé dans Scopus et Web of Science (Conference Proceedings Citation Index).",
  },
  {
    id: 'faq-3',
    q: 'Peut-on suivre les conférences à distance ?',
    a: "Un flux live sécurisé HD et un salon interactif Q&R seront accessibles pour les inscrits en formule distancielle. Le lien d'accès vous sera transmis par email 48 heures avant l'événement.",
  },
];

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  selectedTariff,
  onSelectTariff,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [activeDay, setActiveDay] = useState<string>('j1');
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');

  const remaining = Math.max(0, event.capacity - event.registeredCount);
  const currentDayObj =
    DEFAULT_PROGRAM_DAYS.find((d) => d.id === activeDay) || DEFAULT_PROGRAM_DAYS[0];

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumbs & DOI Ribbon */}
      <div className="w-full bg-surface-container-low py-space-sm">
        <div className="max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between">
          <nav className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Accueil</span>
            </button>
            <span className="text-outline-variant">/</span>
            <button
              type="button"
              onClick={() => onNavigate('evenements')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Événements
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-primary font-semibold truncate max-w-[240px] md:max-w-none">
              {event.code} {event.city}
            </span>
          </nav>

          <div className="hidden sm:flex items-center gap-space-sm font-code-citation text-code-citation text-on-surface-variant">
            <span className="inline-flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-[14px]">article</span>
              DOI: {event.doi || '10.5842/msrasi.2025'}
            </span>
            <span className="text-outline-variant">•</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-variant text-on-secondary-container font-label-sm">
              Session N° 12
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative w-full bg-inverse-surface text-inverse-on-surface overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url('${event.imageUrl || HOTLINK_IMAGES.cisaDetailHero}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/90 to-primary-container/40" />

        <div className="relative max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl lg:py-16">
          <div className="max-w-4xl space-y-space-md">
            <div className="flex flex-wrap items-center gap-space-xs pt-2">
              <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary-fixed font-label-sm text-label-sm tracking-wider uppercase backdrop-blur-sm inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary-container">
                  public
                </span>
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-container-highest/20 text-white font-label-sm text-label-sm tracking-wider uppercase backdrop-blur-sm inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                {event.format === 'hybride'
                  ? 'Hybride (Présentiel & Live Stream)'
                  : event.format === 'virtuel'
                  ? 'Virtuel Interactive'
                  : 'Présentiel sur campus'}
              </span>
              <span className="px-3 py-1 rounded-full bg-tertiary-container/60 text-tertiary-fixed font-label-sm text-label-sm tracking-wider uppercase backdrop-blur-sm inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Indexé Scopus &amp; WoS
              </span>
            </div>

            <h1 className="font-headline-xl lg:font-display-hero text-headline-xl lg:text-display-hero font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="font-body-lg text-body-lg text-inverse-on-surface/90 font-light max-w-3xl leading-relaxed">
              {event.shortSummary}
            </p>

            <div className="pt-space-md flex flex-wrap items-center gap-y-3 gap-x-6 text-inverse-on-surface font-body-sm text-body-sm">
              <div className="flex items-center gap-2 bg-surface-container-highest/10 px-3.5 py-2 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-secondary-container text-[20px]">
                  calendar_month
                </span>
                <span className="font-semibold text-white">{event.dateLabel}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-highest/10 px-3.5 py-2 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">
                  location_on
                </span>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-highest/10 px-3.5 py-2 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  groups
                </span>
                <span>{event.capacity}+ Délégués &amp; Intervenants</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-space-xl min-w-0">
            {/* À propos */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-space-sm">
                <span className="w-2.5 h-6 rounded-full bg-primary" />
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  À propos de l&apos;événement
                </h2>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-space-md">
                {event.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
                <div className="bg-surface-container-low p-space-md rounded-lg space-y-space-xs transition-transform hover:-translate-y-0.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-container text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">
                      neurology
                    </span>
                  </div>
                  <h3 className="font-headline-xs text-headline-xs text-primary font-bold">
                    IA &amp; Santé de Précision
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Modèles fondation pour la génomique, bio-informatique clinique et
                    criblage virtuel de molécules thérapeutiques.
                  </p>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg space-y-space-xs transition-transform hover:-translate-y-0.5">
                  <div className="w-9 h-9 rounded-lg bg-secondary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">eco</span>
                  </div>
                  <h3 className="font-headline-xs text-headline-xs text-secondary font-bold">
                    Biotechnologies Vertes
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Agro-ressources résilientes, bio-stimulants, valorisation des
                    sous-produits de l&apos;arganier et phosphates enrichis.
                  </p>
                </div>

                <div className="bg-surface-container-low p-space-md rounded-lg space-y-space-xs transition-transform hover:-translate-y-0.5">
                  <div className="w-9 h-9 rounded-lg bg-tertiary-container text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <h3 className="font-headline-xs text-headline-xs text-tertiary font-bold">
                    Énergies &amp; Matériaux
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Matériaux à gradient pour l&apos;hydrogène vert, membranes de
                    dessalement et capteurs nanostructurés.
                  </p>
                </div>
              </div>
            </section>

            {/* Objectifs & Publics Ciblés */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-space-sm">
                    <span className="material-symbols-outlined text-primary text-[24px]">
                      flag
                    </span>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Objectifs Scientifiques
                    </h3>
                  </div>
                  <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant pt-2">
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                        check_circle
                      </span>
                      <span>
                        Accélérer le transfert des brevets de laboratoire vers
                        l&apos;écosystème industriel marocain.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                        check_circle
                      </span>
                      <span>
                        Primer et financer les 3 meilleures thèses doctorales nationales
                        (Prix MSRASI Jeune Chercheur).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                        check_circle
                      </span>
                      <span>
                        Établir 5 nouveaux consortiums public-privé de recherche
                        translationnelle.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-space-md p-space-sm bg-surface-container rounded-lg flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    Volume des Actes : 120 Communications
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    download_done
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-center gap-2 mb-space-sm">
                  <span className="material-symbols-outlined text-tertiary-container text-[24px]">
                    badge
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Publics Ciblés
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    { icon: 'school', label: 'Chercheurs & Enseignants', color: 'text-primary' },
                    { icon: 'psychology', label: 'Doctorants & Post-doctorants', color: 'text-secondary' },
                    { icon: 'precision_manufacturing', label: 'Ingénieurs R&D', color: 'text-primary' },
                    { icon: 'rocket_launch', label: 'Startups DeepTech', color: 'text-tertiary-container' },
                    { icon: 'account_balance', label: 'Bailleurs & Décideurs Publics', color: 'text-primary' },
                  ].map((tag) => (
                    <span
                      key={tag.label}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5"
                    >
                      <span className={`material-symbols-outlined text-[16px] ${tag.color}`}>
                        {tag.icon}
                      </span>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Interactive Program Timeline */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 rounded-full bg-secondary" />
                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                      Programme Détaillé
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sélectionnez une journée pour explorer les keynotes et sessions
                    thématiques.
                  </p>
                </div>

                <div className="inline-flex p-1 rounded-lg bg-surface-container">
                  {DEFAULT_PROGRAM_DAYS.map((day) => {
                    const active = activeDay === day.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => setActiveDay(day.id)}
                        className={`px-3 py-1.5 rounded text-label-md font-label-md transition-all cursor-pointer ${
                          active
                            ? 'bg-white text-primary shadow-sm font-bold'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-space-md">
                {currentDayObj.slots.map((slot) => (
                  <div
                    key={slot.title}
                    className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-low transition-colors hover:bg-surface-container"
                  >
                    <div className="w-24 shrink-0 text-center">
                      <span
                        className={`font-label-md text-label-md font-bold block tabular-nums ${
                          slot.accent === 'secondary'
                            ? 'text-secondary'
                            : slot.accent === 'tertiary'
                            ? 'text-tertiary-container'
                            : 'text-primary'
                        }`}
                      >
                        {slot.time}
                      </span>
                      <span className="font-code-citation text-code-citation text-on-surface-variant">
                        {slot.room}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${
                          slot.accent === 'secondary'
                            ? 'bg-secondary-container/20 text-on-secondary-container'
                            : slot.accent === 'tertiary'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-surface-variant text-primary'
                        }`}
                      >
                        {slot.badge}
                      </span>
                      <h4 className="font-headline-xs text-headline-xs font-bold text-on-surface">
                        {slot.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {slot.speaker}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Keynote Speakers */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-space-md">
                <span className="w-2.5 h-6 rounded-full bg-tertiary-container" />
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Intervenants d&apos;Honneur &amp; Keynotes
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Leaders scientifiques reconnus à l&apos;échelle internationale.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {DEFAULT_SPEAKERS.map((spk) => (
                  <div
                    key={spk.name}
                    className="flex gap-space-md p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-all"
                  >
                    <SafeImage
                      src={spk.photoUrl}
                      fallback={spk.fallbackPhoto}
                      alt={spk.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-headline-xs text-headline-xs font-bold text-on-surface truncate">
                        {spk.name}
                      </h4>
                      <p className="font-label-md text-label-md text-primary truncate">
                        {spk.role}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {spk.affiliation}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-mono text-outline">
                        {spk.metric}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Location & Practical Access */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-space-md">
                <span className="w-2.5 h-6 rounded-full bg-primary" />
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Lieu &amp; Informations Pratiques
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {event.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
                <div className="md:col-span-7">
                  <div className="w-full h-64 md:h-full min-h-[240px] rounded-lg overflow-hidden relative shadow-inner">
                    <SafeImage
                      src={
                        event.city === 'Marrakech'
                          ? HOTLINK_IMAGES.marrakechMap
                          : HOTLINK_IMAGES.rabatMap
                      }
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={`Carte d'accès ${event.location}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded text-label-sm font-label-sm text-on-surface flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[16px] text-error">
                        pin_drop
                      </span>
                      <span>Avenue des Nations Unies, {event.city}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 space-y-space-sm bg-surface-container-low p-space-md rounded-lg">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                      tram
                    </span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        Accès Tramway
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Ligne 1, Station « Nations Unies » ou « Cité Universitaire » à 3
                        minutes à pied.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px] shrink-0 mt-0.5">
                      hotel
                    </span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        Hôtels Partenaires
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Tarifs préférentiels négociés (-25%) avec le code promo{' '}
                        <span className="font-mono text-primary font-bold">
                          MSRASI2025
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                      badge
                    </span>
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface font-bold">
                        Badges &amp; Sécurité
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Présentation obligatoire d&apos;une pièce d&apos;identité ou carte
                        d&apos;étudiant lors de l&apos;accès au hall.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Previous Editions Mosaic */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    Rétrospective &amp; Éditions Précédentes
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Moments forts des symposiums CISA 2023 &amp; 2024 à Marrakech et
                    Casablanca.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('actualites')}
                  className="text-label-md font-label-md text-primary flex items-center gap-1 hover:text-secondary cursor-pointer"
                >
                  Archives MSRASI{' '}
                  <span className="material-symbols-outlined text-[16px]">
                    chevron_right
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                {[
                  { img: HOTLINK_IMAGES.retro1, label: 'CISA 2024 • Casablanca' },
                  { img: HOTLINK_IMAGES.retro2, label: 'Prix Thèse 2024' },
                  { img: HOTLINK_IMAGES.retro3, label: 'Session Posters CISA 2023' },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className={`group relative rounded-lg overflow-hidden h-36 ${
                      idx === 2 ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <SafeImage
                      src={item.img}
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                      <span className="text-white font-label-sm text-label-sm">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
              <div className="flex items-center gap-2 mb-space-md">
                <span className="w-2.5 h-6 rounded-full bg-secondary" />
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Foire Aux Questions (FAQ)
                </h2>
              </div>
              <div className="space-y-space-sm">
                {FAQS.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? '' : item.id)}
                      className="w-full text-left rounded-lg bg-surface-container-low p-space-md cursor-pointer transition-colors hover:bg-surface-container"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-headline-xs text-headline-xs font-semibold text-on-surface">
                          {item.q}
                        </h4>
                        <span
                          className={`material-symbols-outlined text-primary text-[20px] transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                      {isOpen && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                          {item.a}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Registration Box (4 Cols) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-space-md">
            <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative">
              <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-container" />
              <div className="p-space-lg space-y-space-md">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
                    Inscriptions Ouvertes
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-error tabular-nums">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                    {remaining} places restantes
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    Tarifs de Participation
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Accès complet aux journées de conférences et workshops.
                  </p>
                </div>

                <div className="space-y-space-xs font-body-sm text-body-sm">
                  {DEFAULT_TARIFF_TIERS.map((tier) => {
                    const checked = selectedTariff.id === tier.id;
                    return (
                      <label
                        key={tier.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          checked
                            ? 'bg-surface-container ring-1 ring-primary'
                            : 'bg-surface-container-low hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="tarif"
                            checked={checked}
                            onChange={() => onSelectTariff(tier)}
                            className="accent-primary w-4 h-4"
                          />
                          <div>
                            <span className="font-bold text-on-surface block">
                              {tier.title}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              {tier.subtitle}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-headline-xs text-headline-xs font-bold tabular-nums ${
                            tier.accent === 'primary'
                              ? 'text-primary'
                              : tier.accent === 'secondary'
                              ? 'text-secondary'
                              : 'text-on-surface'
                          }`}
                        >
                          {tier.priceLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="pt-space-xs space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1">
                    Votre inscription inclut :
                  </span>
                  {[
                    'Badge congressiste & Sacoche officielle',
                    'Déjeuners buffets & Pauses-café de networking',
                    'Recueil numérique complet des résumés & DOI',
                    'Certificat officiel de présence émargé',
                  ].map((inc) => (
                    <div key={inc} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        check
                      </span>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('inscription')}
                    className="w-full py-3.5 px-space-md rounded-lg bg-primary-container text-white font-label-md text-label-md font-bold hover:bg-secondary transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>S&apos;inscrire à l&apos;événement</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadIcsForEvent(event);
                      showToast('Événement ajouté à votre agenda (.ics).');
                    }}
                    className="w-full py-2.5 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      calendar_add_on
                    </span>
                    <span>Ajouter au calendrier (.ics)</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
