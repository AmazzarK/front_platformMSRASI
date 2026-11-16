import React, { useMemo, useState } from 'react';
import { LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import {
  deleteEventRecord,
  exportCsvFile,
  logAdminActivity,
  saveEventRecord,
} from '../../services/msrasiService';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import type { EventStatus, RoutePath, ScientificEvent } from '../../types/msrasi';

interface AdminEventsPageProps {
  events: ScientificEvent[];
  onNavigate: (route: RoutePath) => void;
  onCreateNewEvent: () => void;
  onEditEvent: (event: ScientificEvent) => void;
  onPreviewEvent: (event: ScientificEvent) => void;
}

export const AdminEventsPage: React.FC<AdminEventsPageProps> = ({
  events,
  onCreateNewEvent,
  onEditEvent,
  onPreviewEvent,
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [statusSegment, setStatusSegment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScientificEvent | null>(null);

  const pageSize = 6;

  const statusCounts = useMemo(() => {
    return {
      all: events.length,
      publie: events.filter((e) => e.status === 'publie').length,
      brouillon: events.filter((e) => e.status === 'brouillon').length,
      en_attente: events.filter((e) => e.status === 'en_attente').length,
      archive: events.filter((e) => e.status === 'archive' || e.status === 'cloture').length,
    };
  }, [events]);

  const totalRegistrations = useMemo(
    () => events.reduce((acc, e) => acc + (e.registeredCount || 0), 0),
    [events]
  );

  const avgFillRate = useMemo(() => {
    if (events.length === 0) return 0;
    const sum = events.reduce(
      (acc, e) => acc + Math.min(100, (e.registeredCount / Math.max(1, e.capacity)) * 100),
      0
    );
    return Math.round(sum / events.length);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (statusSegment === 'archive') {
        if (evt.status !== 'archive' && evt.status !== 'cloture') return false;
      } else if (statusSegment !== 'all' && evt.status !== statusSegment) {
        return false;
      }

      if (categoryFilter !== 'all' && evt.category !== categoryFilter) return false;
      if (formatFilter !== 'all' && evt.format !== formatFilter) return false;
      if (yearFilter !== 'all' && !evt.startDate.startsWith(yearFilter)) return false;

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${evt.title} ${evt.code} ${evt.city} ${evt.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, statusSegment, categoryFilter, formatFilter, yearFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedEvents = filteredEvents.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allOnPageSelected =
    paginatedEvents.length > 0 && paginatedEvents.every((e) => selectedIds.includes(e.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedEvents.some((e) => e.id === id)));
    } else {
      const next = new Set([...selectedIds, ...paginatedEvents.map((e) => e.id)]);
      setSelectedIds(Array.from(next));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleFeatured = async (evt: ScientificEvent) => {
    await saveEventRecord({ ...evt, featured: !evt.featured });
    showToast(
      !evt.featured ? `« ${evt.code} » mis à la une.` : `« ${evt.code} » retiré de la une.`,
      'success'
    );
  };

  const handleStatusChange = async (evt: ScientificEvent, nextStatus: EventStatus) => {
    setOpenMenuId(null);
    await saveEventRecord({ ...evt, status: nextStatus });
    showToast(`Statut de « ${evt.code} » mis à jour.`, 'success');
  };

  const handleDuplicate = async (evt: ScientificEvent) => {
    setOpenMenuId(null);
    const copy: ScientificEvent = {
      ...evt,
      id: `evt-${Date.now()}`,
      code: `${evt.code}-COPY`,
      title: `${evt.title} (Copie)`,
      registeredCount: 0,
      status: 'brouillon',
      featured: false,
    };
    await saveEventRecord(copy);
    showToast('Événement dupliqué en brouillon.', 'success');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteEventRecord(deleteTarget.id);
    setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    showToast(`Événement « ${deleteTarget.code} » supprimé.`, 'info');
    setDeleteTarget(null);
  };

  const handleBatchAction = async (action: 'publie' | 'archive' | 'csv') => {
    const chosen = events.filter((e) => selectedIds.includes(e.id));
    if (chosen.length === 0) return;

    if (action === 'csv') {
      exportCsvFile(
        'msrasi-selection-evenements.csv',
        ['Code', 'Titre', 'Date', 'Ville', 'Inscrits', 'Capacité', 'Statut'],
        chosen.map((e) => [
          e.code,
          e.title,
          e.dateLabel,
          e.city,
          e.registeredCount,
          e.capacity,
          e.status,
        ])
      );
      await logAdminActivity(
        'export',
        `Export groupé de ${chosen.length} événements scientifiques.`,
        'Sélection CSV'
      );
      showToast(`${chosen.length} événements exportés en CSV.`, 'success');
      return;
    }

    for (const evt of chosen) {
      await saveEventRecord({ ...evt, status: action });
    }
    setSelectedIds([]);
    showToast(
      action === 'publie'
        ? `${chosen.length} événements publiés.`
        : `${chosen.length} événements archivés.`,
      'success'
    );
  };

  const renderStatusPill = (status: EventStatus) => {
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
      case 'archive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d5e3fe] text-[#434652] font-semibold text-[11px]">
            Archivé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e7eeff] text-[#434652] font-semibold text-[11px]">
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#434652] mb-1">
            <span>Administration</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            <span className="text-[#003082] font-semibold">Colloques &amp; Événements</span>
          </div>
          <h1 className="font-headline-lg text-[28px] font-bold text-[#0d1c30] tracking-tight">
            Gestion des Événements Scientifiques
          </h1>
          <p className="text-[14px] text-[#434652]">
            Supervisez les congrès, ateliers techniques, hackathons et archives académiques MSRASI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode((v) => (v === 'table' ? 'calendar' : 'table'))}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-[13px] transition-colors cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-[#003082] text-white'
                : 'bg-[#dee9ff] hover:bg-[#d5e3fe] text-[#003082]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {viewMode === 'calendar' ? 'table_rows' : 'calendar_view_month'}
            </span>
            {viewMode === 'calendar' ? 'Vue Tableau' : 'Vue Calendrier'}
          </button>

          <button
            type="button"
            onClick={onCreateNewEvent}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[13px] shadow-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            + Créer un nouvel événement
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
            Total Événements
          </span>
          <div className="font-headline-md text-[26px] font-extrabold text-[#0d1c30] mt-1 tabular-nums">
            {events.length}
          </div>
          <span className="text-[12px] text-[#115cba] font-medium">
            {statusCounts.publie} publiés actifs
          </span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
            Inscriptions Cumulées
          </span>
          <div className="font-headline-md text-[26px] font-extrabold text-[#003082] mt-1 tabular-nums">
            {totalRegistrations.toLocaleString('fr-FR')}
          </div>
          <span className="text-[12px] text-[#087A4B] font-medium">Tous formats confondus</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
            Remplissage Moyen
          </span>
          <div className="font-headline-md text-[26px] font-extrabold text-[#0d1c30] mt-1 tabular-nums">
            {avgFillRate}%
          </div>
          <span className="text-[12px] text-[#434652]">Capacité amphithéâtres &amp; ateliers</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
            À la Une Portail
          </span>
          <div className="font-headline-md text-[26px] font-extrabold text-[#793d00] mt-1 tabular-nums">
            {events.filter((e) => e.featured).length}
          </div>
          <span className="text-[12px] text-[#793d00] font-medium">Mis en avant accueil</span>
        </div>
      </div>

      {/* Status Segment Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-[#f0f3ff] p-1.5 rounded-xl">
        {[
          { key: 'all', label: 'Tous', count: statusCounts.all },
          { key: 'publie', label: 'Publiés', count: statusCounts.publie },
          { key: 'brouillon', label: 'Brouillons', count: statusCounts.brouillon },
          { key: 'en_attente', label: 'En attente', count: statusCounts.en_attente },
          { key: 'archive', label: 'Clôturés & Archivés', count: statusCounts.archive },
        ].map((seg) => (
          <button
            key={seg.key}
            type="button"
            onClick={() => {
              setStatusSegment(seg.key);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
              statusSegment === seg.key
                ? 'bg-[#003082] text-white shadow-sm'
                : 'text-[#434652] hover:bg-white'
            }`}
          >
            {seg.label}{' '}
            <span className="ml-1 opacity-75 tabular-nums">({seg.count})</span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747684] text-[19px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Rechercher par titre, code, ville ou campus..."
            className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
          />
        </div>
        <div className="md:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30]"
          >
            <option value="all">Toutes catégories</option>
            <option value="Conférences">Conférences</option>
            <option value="Ateliers">Ateliers</option>
            <option value="Séminaires">Séminaires</option>
            <option value="Compétitions & Hackathons">Hackathons</option>
            <option value="Formations">Formations</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={formatFilter}
            onChange={(e) => {
              setFormatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30]"
          >
            <option value="all">Tous formats</option>
            <option value="hybride">Hybride</option>
            <option value="presentiel">Présentiel</option>
            <option value="virtuel">Virtuel</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30]"
          >
            <option value="all">Toutes années</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
        <div className="md:col-span-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setStatusSegment('all');
              setSearchQuery('');
              setCategoryFilter('all');
              setFormatFilter('all');
              setYearFilter('all');
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-lg bg-[#f0f3ff] hover:bg-[#dee9ff] text-[#003082] text-[12px] font-semibold cursor-pointer"
            title="Réinitialiser les filtres"
          >
            RAZ
          </button>
        </div>
      </div>

      {/* Batch Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#233145] text-white rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <span className="text-[13px] font-semibold">
            {selectedIds.length} événement(s) sélectionné(s)
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBatchAction('publie')}
              className="px-3 py-1.5 rounded bg-[#087A4B] hover:opacity-90 text-[12px] font-semibold cursor-pointer"
            >
              Publier la sélection
            </button>
            <button
              type="button"
              onClick={() => handleBatchAction('csv')}
              className="px-3 py-1.5 rounded bg-[#115cba] hover:opacity-90 text-[12px] font-semibold cursor-pointer"
            >
              Exporter en CSV
            </button>
            <button
              type="button"
              onClick={() => handleBatchAction('archive')}
              className="px-3 py-1.5 rounded bg-[#793d00] hover:opacity-90 text-[12px] font-semibold cursor-pointer"
            >
              Archiver
            </button>
          </div>
        </div>
      )}

      {/* Calendar View OR Table View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...filteredEvents]
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 border-l-4 border-[#003082]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#f0f3ff] text-[#003082] font-bold text-[11px]">
                      {evt.dateLabel}
                    </span>
                    {renderStatusPill(evt.status)}
                  </div>
                  <h3 className="font-headline-xs font-bold text-[16px] text-[#0d1c30]">
                    {evt.title}
                  </h3>
                  <p className="text-[12px] text-[#434652]">
                    {evt.location} • <span className="capitalize">{evt.format}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#e7eeff]">
                  <span className="text-[12px] font-semibold text-[#003082] tabular-nums">
                    {evt.registeredCount} / {evt.capacity} places
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewEvent(evt)}
                      className="text-[12px] font-semibold text-[#434652] hover:text-[#003082] cursor-pointer"
                    >
                      Aperçu
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditEvent(evt)}
                      className="px-3 py-1 rounded bg-[#003082] text-white text-[12px] font-semibold cursor-pointer"
                    >
                      Éditer
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f0f3ff] text-[11px] font-bold uppercase tracking-wider text-[#434652]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#003082]"
                    />
                  </th>
                  <th className="py-3 px-3">Événement &amp; Code</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">Date &amp; Lieu</th>
                  <th className="py-3 px-3">Remplissage</th>
                  <th className="py-3 px-3 text-center">Une</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7eeff] text-[13px]">
                {paginatedEvents.map((evt) => {
                  const pct = Math.min(
                    100,
                    Math.round((evt.registeredCount / Math.max(1, evt.capacity)) * 100)
                  );
                  return (
                    <tr key={evt.id} className="hover:bg-[#f9f9ff] transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(evt.id)}
                          onChange={() => toggleSelectOne(evt.id)}
                          className="w-4 h-4 accent-[#003082]"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#e7eeff]">
                            <SafeImage
                              src={evt.imageUrl}
                              fallback={LOCAL_FALLBACK_IMAGES.conference}
                              alt={evt.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <button
                              type="button"
                              onClick={() => onEditEvent(evt)}
                              className="font-semibold text-[#0d1c30] hover:text-[#003082] truncate block text-left w-full cursor-pointer"
                            >
                              {evt.title}
                            </button>
                            <span className="text-[11px] font-mono text-[#747684]">
                              {evt.code} • {evt.format}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e7eeff] text-[#003082] text-[11px] font-semibold">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-[#0d1c30]">{evt.dateLabel}</div>
                        <div className="text-[11px] text-[#747684]">{evt.city}</div>
                      </td>
                      <td className="py-3.5 px-3 min-w-[130px]">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-semibold tabular-nums">
                            {evt.registeredCount}/{evt.capacity}
                          </span>
                          <span className="tabular-nums text-[#434652]">{pct}%</span>
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
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(evt)}
                          className={`p-1 rounded hover:bg-[#f0f3ff] cursor-pointer ${
                            evt.featured ? 'text-[#F58200]' : 'text-[#c4c6d4]'
                          }`}
                          title="Mettre à la une"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {evt.featured ? 'star' : 'star_outline'}
                          </span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {renderStatusPill(evt.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewEvent(evt)}
                            className="p-1.5 rounded hover:bg-[#e7eeff] text-[#434652] hover:text-[#003082] cursor-pointer"
                            title="Aperçu en direct"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditEvent(evt)}
                            className="p-1.5 rounded hover:bg-[#e7eeff] text-[#434652] hover:text-[#003082] cursor-pointer"
                            title="Modifier dans l'assistant"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit_note</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((cur) => (cur === evt.id ? null : evt.id))
                            }
                            className="p-1.5 rounded hover:bg-[#e7eeff] text-[#434652] cursor-pointer"
                            title="Plus d'actions"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>

                        {openMenuId === evt.id && (
                          <div className="absolute right-4 top-12 z-30 w-44 bg-white rounded-xl shadow-xl border border-[#e7eeff] py-1.5 text-left text-[12px]">
                            {evt.status !== 'publie' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(evt, 'publie')}
                                className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#087A4B] font-semibold flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  publish
                                </span>
                                Publier
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(evt, 'brouillon')}
                                className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#434652] flex items-center gap-2 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  unpublished
                                </span>
                                Passer en brouillon
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDuplicate(evt)}
                              className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#0d1c30] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                content_copy
                              </span>
                              Dupliquer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(evt, 'archive')}
                              className="w-full px-3 py-2 hover:bg-[#f0f3ff] text-[#6f3800] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">archive</span>
                              Archiver
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeleteTarget(evt);
                              }}
                              className="w-full px-3 py-2 hover:bg-[#ffdad6] text-[#ba1a1a] flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#747684]">
                      Aucun événement trouvé pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-[#f0f3ff] px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#434652]">
            <span>
              Affichage de {filteredEvents.length === 0 ? 0 : (safePage - 1) * pageSize + 1} à{' '}
              {Math.min(safePage * pageSize, filteredEvents.length)} sur {filteredEvents.length}{' '}
              événements
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded font-bold text-[12px] cursor-pointer ${
                      safePage === pageNum
                        ? 'bg-[#003082] text-white'
                        : 'hover:bg-white text-[#0d1c30]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-headline-sm font-bold text-[#0d1c30]">
              Confirmer la suppression
            </h3>
            <p className="text-[13px] text-[#434652]">
              Voulez-vous supprimer définitivement l&apos;événement{' '}
              <strong>{deleteTarget.title}</strong> ({deleteTarget.code}) ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg bg-[#f0f3ff] text-[#0d1c30] text-[13px] font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-[13px] font-semibold cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
