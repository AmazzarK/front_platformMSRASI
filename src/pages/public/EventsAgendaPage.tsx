import React, { useMemo, useState } from 'react';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import {
  createNewsletterSubscription,
  downloadIcsForEvent,
} from '../../services/msrasiService';
import type { RoutePath, ScientificEvent } from '../../types/msrasi';

interface EventsAgendaPageProps {
  events: ScientificEvent[];
  onNavigate: (route: RoutePath) => void;
  onSelectEvent: (eventId: string, targetRoute?: RoutePath) => void;
}

export const EventsAgendaPage: React.FC<EventsAgendaPageProps> = ({
  events,
  onNavigate,
  onSelectEvent,
}) => {
  const { showToast } = useToast();
  const [keyword, setKeyword] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [format, setFormat] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [timelineMode, setTimelineMode] = useState<'upcoming' | 'archives'>(
    'upcoming'
  );
  const [alertEmail, setAlertEmail] = useState('');
  const [alertImmediate, setAlertImmediate] = useState(true);
  const [submittingAlert, setSubmittingAlert] = useState(false);

  const visibleEvents = useMemo(() => {
    return events.filter((evt) => {
      if (timelineMode === 'upcoming') {
        if (evt.status !== 'publie' && evt.status !== 'en_attente') return false;
      } else {
        if (evt.status !== 'cloture' && evt.status !== 'archive') return false;
      }

      if (activeTab !== 'Tous') {
        if (activeTab === 'Conférences' && evt.category !== 'Conférences') return false;
        if (activeTab === 'Ateliers' && evt.category !== 'Ateliers') return false;
        if (activeTab === 'Formations' && evt.category !== 'Formations') return false;
        if (
          activeTab === 'Compétitions & Hackathons' &&
          evt.category !== 'Compétitions & Hackathons'
        )
          return false;
      }

      if (discipline && evt.discipline !== discipline) return false;
      if (format && evt.format !== format) return false;
      if (dateFilter && evt.startDate < dateFilter) return false;

      if (keyword.trim()) {
        const q = keyword.toLowerCase();
        const hay =
          `${evt.title} ${evt.shortSummary} ${evt.location} ${evt.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [events, timelineMode, activeTab, discipline, format, dateFilter, keyword]);

  const featuredEvent = useMemo(
    () =>
      events.find((e) => e.featured && e.status === 'publie') ||
      events.find((e) => e.status === 'publie') ||
      events[0],
    [events]
  );

  const tabs = [
    { label: `Tous les événements (${events.filter((e) => e.status === 'publie' || e.status === 'en_attente').length})`, value: 'Tous' },
    { label: 'Conférences & Congrès', value: 'Conférences' },
    { label: 'Ateliers & FabLab', value: 'Ateliers' },
    { label: 'Formations Doctorales', value: 'Formations' },
    { label: 'Compétitions & Hackathons', value: 'Compétitions & Hackathons' },
  ];

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;
    setSubmittingAlert(true);
    try {
      await createNewsletterSubscription(alertEmail, alertImmediate, 'agenda');
      showToast(
        'Abonnement aux alertes scientifiques confirmé pour ' + alertEmail
      );
      setAlertEmail('');
    } catch {
      showToast('Alerte enregistrée localement pour ' + alertEmail, 'info');
    } finally {
      setSubmittingAlert(false);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDiscipline('');
    setFormat('');
    setDateFilter('');
    setActiveTab('Tous');
    setTimelineMode('upcoming');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Hero Banner & Scientific Search */}
      <section className="relative w-full bg-inverse-surface text-inverse-on-surface overflow-hidden py-space-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="60" id="scientific-lattice" patternUnits="userSpaceOnUse" width="60">
                <path
                  d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="30" cy="34.64" fill="currentColor" r="3" />
                <line stroke="currentColor" strokeDasharray="2,2" strokeWidth="0.8" x1="30" x2="30" y1="0" y2="34.64" />
                <line stroke="currentColor" strokeWidth="0.8" x1="60" x2="30" y1="17.32" y2="34.64" />
                <line stroke="currentColor" strokeWidth="0.8" x1="0" x2="30" y1="17.32" y2="34.64" />
              </pattern>
            </defs>
            <rect fill="url(#scientific-lattice)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop">
          <nav
            aria-label="Fil d'ariane"
            className="flex items-center gap-space-xs font-label-sm text-label-sm text-outline-variant mb-space-md"
          >
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">home</span>
              Accueil
            </button>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-tertiary-fixed-dim font-bold">
              Événements &amp; Rendez-vous Scientifiques
            </span>
          </nav>

          <div className="max-w-3xl mb-space-xl">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container/15 text-tertiary-fixed font-label-sm text-label-sm mb-space-sm">
              <span className="material-symbols-outlined text-[15px]">calendar_clock</span>
              PROGRAMMATION ACADÉMIQUE 2025 - 2026
            </div>
            <h1 className="font-headline-xl text-headline-xl md:text-display-hero md:font-display-hero text-white tracking-tight leading-tight mb-space-sm">
              Agenda Scientifique &amp; Conférences
            </h1>
            <p className="font-body-lg text-body-lg text-outline-variant leading-relaxed">
              Consultez le calendrier complet des congrès internationaux, symposiums,
              ateliers techniques et formations doctorales organisés ou co-labellisés par
              la MSRASI à travers le Royaume.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-surface text-on-surface rounded-xl p-space-md shadow-xl">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-sm items-center"
            >
              <div className="lg:col-span-4 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Rechercher un thème, mot-clé, ville..."
                  className="w-full h-11 pl-10 pr-3 rounded bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all"
                />
              </div>

              <div className="lg:col-span-3 relative">
                <select
                  aria-label="Filtrer par discipline scientifique"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full h-11 px-3.5 pr-8 rounded bg-surface-container-low text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer"
                >
                  <option value="">Toutes les disciplines</option>
                  <option value="biotech">Biotechnologies &amp; Santé</option>
                  <option value="ia">Intelligence Artificielle &amp; Data</option>
                  <option value="energie">Énergies Renouvelables &amp; Hydrogène</option>
                  <option value="materiaux">Génie des Matériaux &amp; Nanotech</option>
                  <option value="agritech">Agritech &amp; Gestion de l&apos;Eau</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="lg:col-span-2 relative">
                <select
                  aria-label="Filtrer par format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full h-11 px-3.5 pr-8 rounded bg-surface-container-low text-on-surface font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container transition-all cursor-pointer"
                >
                  <option value="">Tous formats</option>
                  <option value="presentiel">En présentiel</option>
                  <option value="virtuel">Virtuel (Webinaire)</option>
                  <option value="hybride">Format Hybride</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[20px] pointer-events-none">
                  tune
                </span>
              </div>

              <div className="lg:col-span-2 relative">
                <input
                  aria-label="À partir du"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all"
                />
              </div>

              <div className="lg:col-span-1">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Réinitialiser les filtres"
                  className="w-full h-11 rounded bg-primary-container hover:bg-secondary text-on-primary flex items-center justify-center transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {keyword || discipline || format || dateFilter
                      ? 'filter_alt_off'
                      : 'arrow_forward'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Section 2: Tab Bar & Timeline Switch */}
      <section className="w-full bg-surface-container-low">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {tabs.map((tab) => {
                const active = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-space-md py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary-container text-on-primary shadow-sm'
                        : 'bg-surface hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center self-start md:self-auto bg-surface-variant p-1 rounded">
              <button
                type="button"
                onClick={() => setTimelineMode('upcoming')}
                className={`px-space-md py-1.5 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                  timelineMode === 'upcoming'
                    ? 'bg-surface text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Événements à venir
              </button>
              <button
                type="button"
                onClick={() => setTimelineMode('archives')}
                className={`px-space-md py-1.5 rounded font-label-sm text-label-sm transition-colors cursor-pointer ${
                  timelineMode === 'archives'
                    ? 'bg-surface text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Actes &amp; Archives
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Featured Event Spotlight */}
      {timelineMode === 'upcoming' && featuredEvent && (
        <section className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop mt-space-xl">
          <div className="relative bg-surface rounded-xl overflow-hidden shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full overflow-hidden bg-inverse-surface">
                <SafeImage
                  src={featuredEvent.imageUrl || HOTLINK_IMAGES.cisaAmphitheater}
                  fallback={LOCAL_FALLBACK_IMAGES.conference}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/30 to-transparent lg:hidden" />
                <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm px-space-sm py-1 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-1 shadow-md">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  ÉVÉNEMENT PHARE 2025
                </div>
              </div>

              <div className="lg:col-span-7 p-space-md lg:p-space-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-space-sm mb-space-sm">
                    <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[13px]">hub</span>
                      {featuredEvent.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[13px]">
                        record_voice_over
                      </span>
                      32 Sessions &amp; 4 Keynotes
                    </span>
                    <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[13px]">devices</span>
                      Format {featuredEvent.format}
                    </span>
                  </div>

                  <h2 className="font-headline-lg text-headline-lg text-primary hover:text-secondary transition-colors mb-space-sm">
                    {featuredEvent.title}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-md leading-relaxed">
                    {featuredEvent.shortSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg text-on-surface">
                    <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded">
                      <div className="w-9 h-9 rounded bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          calendar_month
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          Date du congrès
                        </span>
                        <span className="font-headline-xs text-headline-xs">
                          {featuredEvent.dateLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded">
                      <div className="w-9 h-9 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          pin_drop
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline">
                          Lieu principal
                        </span>
                        <span className="font-headline-xs text-headline-xs">
                          {featuredEvent.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse" />
                    <span className="font-label-md text-label-md font-bold text-tertiary-container">
                      Inscriptions ouvertes (
                      {Math.max(0, featuredEvent.capacity - featuredEvent.registeredCount)}{' '}
                      places restantes)
                    </span>
                  </div>
                  <div className="flex items-center gap-space-sm">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(featuredEvent.id, 'evenement-detail')}
                      className="px-space-md py-2.5 rounded font-label-md text-label-md bg-surface-container hover:bg-surface-container-high text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        menu_book
                      </span>
                      Consulter le programme
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(featuredEvent.id, 'inscription')}
                      className="px-space-lg py-2.5 rounded font-label-md text-label-md bg-primary-container hover:bg-secondary text-on-primary transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        how_to_reg
                      </span>
                      S&apos;inscrire maintenant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Events Grid */}
      <section className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop mt-space-xl">
        <div className="flex items-center justify-between mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <span className="w-1.5 h-6 bg-secondary rounded-full" />
            <h3 className="font-headline-md text-headline-md text-primary">
              {timelineMode === 'upcoming'
                ? 'Tous les prochains événements'
                : 'Actes & Éditions Clôturées'}
            </h3>
          </div>
          <span className="font-label-md text-label-md text-outline">
            {visibleEvents.length} événement(s) affiché(s)
          </span>
        </div>

        {visibleEvents.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center space-y-3 shadow-sm">
            <span className="material-symbols-outlined text-[42px] text-outline">
              event_busy
            </span>
            <h4 className="font-headline-sm text-on-surface">
              Aucun événement ne correspond à vos critères
            </h4>
            <p className="font-body-sm text-on-surface-variant">
              Modifiez vos filtres de discipline, format ou mots-clés pour afficher
              d&apos;autres rendez-vous scientifiques.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-label-md hover:bg-secondary cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {visibleEvents.map((evt) => {
              const pct = Math.min(
                100,
                Math.round((evt.registeredCount / Math.max(1, evt.capacity)) * 100)
              );
              const isAlmostFull = pct >= 85;
              return (
                <article
                  key={evt.id}
                  className="relative flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-surface-container-high">
                    <SafeImage
                      src={evt.imageUrl}
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-surface text-primary px-2.5 py-1 rounded font-label-sm text-label-sm font-bold shadow-sm">
                      {evt.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-inverse-surface/90 backdrop-blur-sm text-inverse-on-surface px-3 py-1 rounded flex items-center gap-1 font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">
                        schedule
                      </span>
                      {evt.dateLabel}
                    </div>
                  </div>

                  <div className="p-space-md flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-space-xs text-outline font-label-sm text-label-sm">
                        <span className="flex items-center gap-1 truncate pr-2">
                          <span className="material-symbols-outlined text-[14px]">
                            apartment
                          </span>
                          <span className="truncate">{evt.location}</span>
                        </span>
                        <span
                          className={`font-bold shrink-0 ${
                            isAlmostFull ? 'text-tertiary-container' : 'text-primary'
                          }`}
                        >
                          {isAlmostFull
                            ? 'Bientôt complet'
                            : evt.format === 'presentiel'
                            ? 'Présentiel'
                            : evt.format === 'virtuel'
                            ? 'Distanciel'
                            : 'Hybride'}
                        </span>
                      </div>

                      <h4 className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors mb-space-xs line-clamp-2">
                        {evt.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md line-clamp-3">
                        {evt.shortSummary}
                      </p>
                    </div>

                    <div className="pt-space-sm">
                      <div className="flex items-center justify-between text-label-sm font-label-sm mb-1.5">
                        <span className="text-on-surface-variant">
                          Inscriptions confirmées
                        </span>
                        <span
                          className={`font-bold tabular-nums ${
                            isAlmostFull ? 'text-tertiary-container' : 'text-primary'
                          }`}
                        >
                          {evt.registeredCount} / {evt.capacity} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container mb-space-md overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isAlmostFull ? 'bg-tertiary-container' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(evt.id, 'evenement-detail')}
                        className="w-full py-2.5 px-space-md rounded bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Découvrir l&apos;événement</span>
                        <span className="material-symbols-outlined text-[16px]">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 5: Calendar Sync & Alerts */}
      <section className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop my-space-xl">
        <div className="bg-gradient-to-r from-inverse-surface via-primary-container to-inverse-surface rounded-xl p-space-md lg:p-space-xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-white/10 text-tertiary-fixed-dim font-label-sm text-label-sm mb-space-sm">
                <span className="material-symbols-outlined text-[15px]">sync</span>
                SYNCHRONISATION EN TEMPS RÉEL
              </div>
              <h3 className="font-headline-lg text-headline-lg text-white mb-space-xs">
                Ne manquez aucun événement scientifique
              </h3>
              <p className="font-body-md text-body-md text-outline-variant leading-relaxed max-w-xl">
                Abonnez-vous au flux dynamique MSRASI pour recevoir automatiquement les
                appels à communication, dates limites de soumission et invitations
                directement dans votre calendrier académique.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm mt-space-md">
                <button
                  type="button"
                  onClick={() => {
                    if (featuredEvent) {
                      downloadIcsForEvent(featuredEvent);
                      showToast('Fichier iCal (.ics) généré pour votre calendrier.');
                    }
                  }}
                  className="px-space-md py-2 rounded bg-surface/10 hover:bg-surface/20 text-white font-label-sm text-label-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    event_available
                  </span>
                  Exporter vers Google Calendar (.ics)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (featuredEvent) {
                      downloadIcsForEvent(featuredEvent);
                      showToast('Flux iCal (.ics) téléchargé avec succès.');
                    }
                  }}
                  className="px-space-md py-2 rounded bg-surface/10 hover:bg-surface/20 text-white font-label-sm text-label-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Flux iCal (.ics)
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-surface text-on-surface p-space-md rounded-xl shadow-md">
              <h4 className="font-headline-xs text-headline-xs text-primary mb-space-xs">
                Alerte Événements &amp; Colloques
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Recevez un récapitulatif mensuel sur mesure selon vos disciplines de
                recherche.
              </p>
              <form onSubmit={handleAlertSubmit} className="space-y-space-sm">
                <div>
                  <label
                    className="block font-label-sm text-label-sm text-outline mb-1"
                    htmlFor="event-email-sub"
                  >
                    Adresse électronique institutionnelle
                  </label>
                  <input
                    id="event-email-sub"
                    type="email"
                    required
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="votre.nom@univ.ma"
                    className="w-full h-11 px-3 rounded bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="alert-immediate"
                    type="checkbox"
                    checked={alertImmediate}
                    onChange={(e) => setAlertImmediate(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="alert-immediate"
                    className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                  >
                    M&apos;alerter lors de la publication d&apos;un appel à communications
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={submittingAlert}
                  className="w-full py-2.5 rounded bg-primary-container hover:bg-secondary text-on-primary font-label-md text-label-md transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    notifications_active
                  </span>
                  {submittingAlert ? 'Validation...' : "S'abonner aux notifications"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
