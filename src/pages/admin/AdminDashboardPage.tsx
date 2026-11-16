import React, { useMemo, useState } from 'react';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import {
  downloadIcsForEvent,
  exportCsvFile,
  logAdminActivity,
  saveEventRecord,
} from '../../services/msrasiService';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import type {
  ActivityLog,
  EventArchetype,
  EventFormat,
  EventRegistration,
  NewsArticle,
  RoutePath,
  ScientificEvent,
} from '../../types/msrasi';

interface AdminDashboardPageProps {
  adminDisplayName: string;
  events: ScientificEvent[];
  articles: NewsArticle[];
  registrations: EventRegistration[];
  activityLogs: ActivityLog[];
  onNavigate: (route: RoutePath) => void;
  onEditEvent: (event: ScientificEvent) => void;
  onPreviewEvent: (event: ScientificEvent) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminDisplayName,
  events,
  articles,
  registrations,
  activityLogs,
  onNavigate,
  onEditEvent,
  onPreviewEvent,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false);
  const [charterOpen, setCharterOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);

  // Quick-create event form state
  const [newTitle, setNewTitle] = useState('');
  const [newDateLabel, setNewDateLabel] = useState('20 - 22 Nov 2025');
  const [newCity, setNewCity] = useState('Rabat');
  const [newFormat, setNewFormat] = useState<EventFormat>('hybride');
  const [newArchetype, setNewArchetype] = useState<EventArchetype>('conf');
  const [newCapacity, setNewCapacity] = useState(200);
  const [savingQuick, setSavingQuick] = useState(false);

  const totalRegistrations = useMemo(
    () => events.reduce((acc, item) => acc + (item.registeredCount || 0), 0),
    [events]
  );

  const totalCapacity = useMemo(
    () => events.reduce((acc, item) => acc + (item.capacity || 0), 0),
    [events]
  );

  const publishedEventsCount = useMemo(
    () => events.filter((e) => e.status === 'publie').length,
    [events]
  );

  const submissionsCount = useMemo(
    () => 84 + registrations.filter((r) => r.participationRole !== 'auditeur').length,
    [registrations]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.code.toLowerCase().includes(q) ||
        evt.city.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  const handleExportCsv = async () => {
    exportCsvFile(
      'msrasi-rapport-evenements-2025.csv',
      ['Code', 'Titre', 'Catégorie', 'Format', 'Date', 'Ville', 'Inscrits', 'Capacité', 'Statut'],
      events.map((e) => [
        e.code,
        e.title,
        e.category,
        e.format,
        e.dateLabel,
        e.city,
        e.registeredCount,
        e.capacity,
        e.status,
      ])
    );
    await logAdminActivity(
      'export',
      `Export CSV généré : ${events.length} événements scientifiques.`,
      "À l'instant • Archive administrative"
    );
    showToast('Rapport CSV téléchargé avec succès.', 'success');
  };

  const handleQuickCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez saisir un titre pour l’événement.', 'warning');
      return;
    }
    setSavingQuick(true);
    try {
      const categoryMap: Record<EventArchetype, string> = {
        conf: 'Conférences',
        workshop: 'Ateliers',
        hackathon: 'Compétitions & Hackathons',
        symposium: 'Séminaires',
      };
      const created: ScientificEvent = {
        id: `evt-${Date.now()}`,
        code: `${newArchetype.toUpperCase()}-2025-${Math.floor(10 + Math.random() * 89)}`,
        title: newTitle.trim(),
        shortSummary:
          'Rencontre scientifique MSRASI dédiée à la recherche appliquée et au transfert technologique.',
        description:
          'Programme scientifique en cours de consolidation par le Secrétariat Général MSRASI.',
        archetype: newArchetype,
        category: categoryMap[newArchetype],
        discipline: 'ia',
        format: newFormat,
        dateLabel: newDateLabel,
        startDate: '2025-11-20',
        location: `${newCity}, Campus Académique`,
        city: newCity,
        capacity: Number(newCapacity) || 200,
        registeredCount: 0,
        status: 'brouillon',
        featured: false,
        imageUrl: HOTLINK_IMAGES.wizardCover,
        languages: ['Français', 'Anglais'],
        tags: ['#MSRASI', '#RechercheAppliquée'],
        createdBy: 'admin-dashboard',
      };
      await saveEventRecord(created);
      setNewTitle('');
      setQuickDrawerOpen(false);
      showToast('Événement créé en brouillon. Ouvrez l’assistant pour le détailler.', 'success');
    } finally {
      setSavingQuick(false);
    }
  };

  const getStatusBadge = (status: ScientificEvent['status']) => {
    switch (status) {
      case 'publie':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F5EE] text-[#087A4B] font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#087A4B]" />
            Publié
          </span>
        );
      case 'en_attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdcc4] text-[#6f3800] font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F58200]" />
            En attente
          </span>
        );
      case 'cloture':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dee9ff] text-[#003082] font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003082]" />
            Clôturé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e7eeff] text-[#434652] font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#747684]" />
            Brouillon
          </span>
        );
    }
  };

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'registration':
        return { icon: 'how_to_reg', cls: 'bg-[#e7eeff] text-[#003082]' };
      case 'article':
        return { icon: 'article', cls: 'bg-[#ffdcc4] text-[#6f3800]' };
      case 'export':
        return { icon: 'badge', cls: 'bg-[#d7e2ff] text-[#003371]' };
      default:
        return { icon: 'event_note', cls: 'bg-[#E6F5EE] text-[#087A4B]' };
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 1. Greeting Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#115cba] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F58200]" />
            Console de Direction Scientifique
          </div>
          <h1 className="font-headline-lg text-[28px] lg:text-[32px] font-bold text-[#0d1c30] tracking-tight">
            Bonjour, {adminDisplayName}
          </h1>
          <p className="text-[14px] text-[#434652] mt-0.5">
            Secrétariat Général • Association Marocaine pour la Recherche en Sciences Appliquées
            et l&apos;Innovation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dee9ff] hover:bg-[#d5e3fe] text-[#003082] font-semibold text-[13px] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exporter les rapports (CSV)
          </button>
          <button
            type="button"
            onClick={() => setQuickDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[13px] shadow-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            + Créer un événement
          </button>
        </div>
      </div>

      {/* 2. Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#434652]">
              Événements Planifiés (2025)
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#f0f3ff] text-[#003082] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-[30px] font-extrabold text-[#0d1c30] tabular-nums leading-none">
              {events.length}
            </div>
            <p className="text-[12px] text-[#087A4B] font-semibold mt-2">
              {publishedEventsCount} publiés sur le portail
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#434652]">Inscriptions Validées</span>
            <div className="w-9 h-9 rounded-lg bg-[#f0f3ff] text-[#115cba] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-[30px] font-extrabold text-[#003082] tabular-nums leading-none">
              {totalRegistrations.toLocaleString('fr-FR')}
            </div>
            <p className="text-[12px] text-[#434652] mt-2">
              Taux de remplissage global :{' '}
              <strong className="text-[#003082]">
                {totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0}%
              </strong>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#434652]">
              Soumissions Scientifiques
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#ffdcc4] text-[#6f3800] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">science</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-[30px] font-extrabold text-[#0d1c30] tabular-nums leading-none">
              {submissionsCount}
            </div>
            <p className="text-[12px] text-[#793d00] font-medium mt-2">
              En cours d&apos;évaluation par les pairs
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#434652]">
              Articles &amp; Actualités
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#dee9ff] text-[#003082] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
            </div>
          </div>
          <div>
            <div className="font-headline-lg text-[30px] font-extrabold text-[#0d1c30] tabular-nums leading-none">
              {articles.length}
            </div>
            <p className="text-[12px] text-[#115cba] font-medium mt-2">
              {articles.filter((a) => a.status === 'publie').length} dépêches publiques en ligne
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: 8 Columns Table + 4 Columns Milestones/Logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-6">
          {/* Immediate Event Management Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f0f3ff]">
              <div>
                <h2 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
                  Gestion Immédiate des Événements
                </h2>
                <p className="text-[12px] text-[#434652]">
                  Pilotez les capacités, validations et publications en temps réel.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#747684]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer..."
                    className="h-9 pl-8 pr-3 rounded-lg bg-white text-[13px] text-[#0d1c30] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-white text-[13px] text-[#0d1c30] focus:outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="publie">Publié</option>
                  <option value="en_attente">En attente</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="cloture">Clôturé</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9f9ff] text-[11px] font-bold uppercase tracking-wider text-[#747684]">
                    <th className="py-3 px-4">Événement</th>
                    <th className="py-3 px-3">Date &amp; Format</th>
                    <th className="py-3 px-3">Capacité</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-[13px]">
                  {filteredEvents.slice(0, 6).map((evt) => {
                    const pct = Math.min(
                      100,
                      Math.round((evt.registeredCount / Math.max(1, evt.capacity)) * 100)
                    );
                    return (
                      <tr key={evt.id} className="hover:bg-[#f9f9ff] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-[#e7eeff]">
                              <SafeImage
                                src={evt.imageUrl}
                                fallback={LOCAL_FALLBACK_IMAGES.conference}
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 max-w-[230px]">
                              <p className="font-semibold text-[#0d1c30] truncate">{evt.title}</p>
                              <p className="text-[11px] text-[#747684] truncate">
                                {evt.code} • {evt.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-medium text-[#0d1c30]">{evt.dateLabel}</div>
                          <span className="inline-block text-[11px] text-[#115cba] capitalize">
                            {evt.format}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 min-w-[140px]">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-semibold text-[#0d1c30] tabular-nums">
                              {evt.registeredCount} / {evt.capacity}
                            </span>
                            <span className="text-[#434652] tabular-nums">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#e7eeff] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 85 ? 'bg-[#F58200]' : 'bg-[#003082]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getStatusBadge(evt.status)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditEvent(evt)}
                              className="px-2.5 py-1 rounded bg-[#f0f3ff] hover:bg-[#003082] hover:text-white text-[#003082] font-semibold text-[12px] transition-colors cursor-pointer"
                            >
                              Gérer
                            </button>
                            <button
                              type="button"
                              onClick={() => onNavigate('admin-members')}
                              className="px-2.5 py-1 rounded bg-[#f9f9ff] hover:bg-[#e7eeff] text-[#434652] font-medium text-[12px] transition-colors cursor-pointer"
                            >
                              Inscrits
                            </button>
                            <button
                              type="button"
                              onClick={() => onPreviewEvent(evt)}
                              className="p-1.5 rounded hover:bg-[#e7eeff] text-[#434652] hover:text-[#003082] cursor-pointer"
                              title="Prévisualiser"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                visibility
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#747684]">
                        Aucun événement ne correspond à ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-[#f9f9ff] flex items-center justify-between text-[12px]">
              <span className="text-[#434652]">
                Affichage de {Math.min(6, filteredEvents.length)} sur {filteredEvents.length}{' '}
                événements
              </span>
              <button
                type="button"
                onClick={() => onNavigate('admin-events')}
                className="font-semibold text-[#003082] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Voir le catalogue complet
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Campagne de Labellisation 2025 Banner */}
          <div className="relative rounded-xl overflow-hidden bg-[#003082] text-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-8 p-6 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[#ffdcc4] text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                  Campagne de Labellisation 2025
                </span>
                <h3 className="font-headline-sm text-[20px] font-bold">
                  Labellisation Scientifique des Colloques Universitaires Marocains
                </h3>
                <p className="text-[13px] text-[#dbe1ff] leading-relaxed">
                  Accordez le label d&apos;excellence MSRASI aux laboratoires partenaires, avec
                  indexation automatique des actes et comité de lecture inter-universitaire.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setCharterOpen(true)}
                    className="px-4 py-2 rounded-lg bg-white text-[#003082] font-semibold text-[13px] hover:bg-[#f0f3ff] transition-colors cursor-pointer"
                  >
                    Consulter la charte
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('nous-rejoindre')}
                    className="px-4 py-2 rounded-lg bg-[#793d00] hover:bg-[#572a00] text-white font-semibold text-[13px] transition-colors cursor-pointer"
                  >
                    Déposer une demande
                  </button>
                </div>
              </div>
              <div className="md:col-span-4 relative min-h-[160px]">
                <SafeImage
                  src={HOTLINK_IMAGES.dashLab}
                  fallback={LOCAL_FALLBACK_IMAGES.lab}
                  alt="Laboratoire de recherche MSRASI"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#003082] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Milestones + Activity Stream */}
        <div className="xl:col-span-4 space-y-6">
          {/* Milestones Trimestriels */}
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-xs text-[16px] font-bold text-[#0d1c30]">
                Milestones Trimestriels
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#f0f3ff] text-[#003082] text-[11px] font-bold">
                Q4 2025
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  date: '14 Oct 2025',
                  title: 'Ouverture Congrès CISA-2025',
                  sub: 'UM5 Rabat • 408 inscrits confirmés',
                  event: events[0],
                },
                {
                  date: '28 Nov 2025',
                  title: 'Atelier Robotique Médicale',
                  sub: 'Technopark Casablanca • Places limitées',
                  event: events[1] || events[0],
                },
                {
                  date: '12 Déc 2025',
                  title: 'Validation Finale Symposium H2',
                  sub: 'Clôture du comité de lecture IRESEN',
                  event: events[2] || events[0],
                },
              ].map((m) => (
                <div
                  key={m.title}
                  className="p-3 rounded-lg bg-[#f9f9ff] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#115cba]">{m.date}</span>
                    <p className="font-semibold text-[13px] text-[#0d1c30] truncate">{m.title}</p>
                    <p className="text-[11px] text-[#434652] truncate">{m.sub}</p>
                  </div>
                  {m.event && (
                    <button
                      type="button"
                      onClick={() => {
                        downloadIcsForEvent(m.event);
                        showToast('Échéance ajoutée à votre calendrier (.ics).', 'success');
                      }}
                      className="p-2 rounded-lg bg-[#e7eeff] hover:bg-[#003082] text-[#003082] hover:text-white transition-colors shrink-0 cursor-pointer"
                      title="Synchroniser (.ics)"
                    >
                      <span className="material-symbols-outlined text-[17px]">event_available</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Flux Opérationnel Récent */}
          <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-xs text-[16px] font-bold text-[#0d1c30]">
                Flux Opérationnel Récent
              </h2>
              <button
                type="button"
                onClick={() => setLogsModalOpen(true)}
                className="text-[12px] font-semibold text-[#115cba] hover:underline cursor-pointer"
              >
                Tout voir
              </button>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => {
                const style = getLogIcon(log.type);
                return (
                  <div key={log.id} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.cls}`}
                    >
                      <span className="material-symbols-outlined text-[17px]">{style.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-[#0d1c30] font-medium leading-snug">
                        {log.message}
                      </p>
                      <p className="text-[11px] text-[#747684] mt-0.5">{log.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Create Event Slide-Over Drawer */}
      {quickDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#e7eeff]">
                <div>
                  <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
                    Création Rapide d&apos;Événement
                  </h3>
                  <p className="text-[12px] text-[#434652]">
                    Enregistrez l&apos;ossature ou ouvrez l&apos;assistant complet 6 étapes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickDrawerOpen(false)}
                  className="p-1 rounded hover:bg-[#f0f3ff] cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form id="quick-event-form" onSubmit={handleQuickCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                    Titre de l&apos;événement *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Colloque National Smart Grids & IA 2026"
                    className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                      Archétype
                    </label>
                    <select
                      value={newArchetype}
                      onChange={(e) => setNewArchetype(e.target.value as EventArchetype)}
                      className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                    >
                      <option value="conf">Conférence</option>
                      <option value="workshop">Atelier / Workshop</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="symposium">Symposium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                      Modalité
                    </label>
                    <select
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value as EventFormat)}
                      className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                    >
                      <option value="hybride">Hybride</option>
                      <option value="presentiel">Présentiel</option>
                      <option value="virtuel">Virtuel</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                      Période affichée
                    </label>
                    <input
                      type="text"
                      value={newDateLabel}
                      onChange={(e) => setNewDateLabel(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#0d1c30] mb-1">
                    Capacité maximale
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                  />
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-[#e7eeff] space-y-2">
              <button
                type="submit"
                form="quick-event-form"
                disabled={savingQuick}
                className="w-full py-2.5 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[13px] cursor-pointer disabled:opacity-60"
              >
                {savingQuick ? 'Enregistrement...' : 'Enregistrer en brouillon'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickDrawerOpen(false);
                  onNavigate('admin-event-wizard');
                }}
                className="w-full py-2.5 rounded-lg bg-[#f0f3ff] hover:bg-[#dee9ff] text-[#003082] font-semibold text-[13px] cursor-pointer"
              >
                Ouvrir l&apos;Assistant Complet (6 étapes) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labellisation Charter Modal */}
      {charterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm font-bold text-[#0d1c30]">
                Charte de Labellisation Scientifique MSRASI 2025
              </h3>
              <button
                type="button"
                onClick={() => setCharterOpen(false)}
                className="cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#434652]">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#087A4B] text-[18px]">
                  check_circle
                </span>
                <span>Comité scientifique composé d&apos;au moins 40% d&apos;experts externes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#087A4B] text-[18px]">
                  check_circle
                </span>
                <span>Évaluation en double aveugle pour toutes les communications indexées.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#087A4B] text-[18px]">
                  check_circle
                </span>
                <span>Attribution d&apos;un préfixe DOI MSRASI et archivage libre des résumés.</span>
              </li>
            </ul>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCharterOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#003082] text-white text-[13px] font-semibold cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Activity Log Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-[#233145] text-white flex items-center justify-between">
              <h3 className="font-headline-xs font-bold">Journal Complet des Opérations</h3>
              <button
                type="button"
                onClick={() => setLogsModalOpen(false)}
                className="cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {activityLogs.map((log) => {
                const style = getLogIcon(log.type);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#f9f9ff]">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.cls}`}
                    >
                      <span className="material-symbols-outlined text-[17px]">{style.icon}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#0d1c30]">{log.message}</p>
                      <p className="text-[11px] text-[#747684]">{log.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
