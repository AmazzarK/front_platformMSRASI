import React, { useMemo, useState } from 'react';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import {
  deleteArticleRecord,
  exportCsvFile,
  logAdminActivity,
  saveArticleRecord,
} from '../../services/msrasiService';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import type {
  ArticleCategory,
  ArticleStatus,
  NewsArticle,
  RoutePath,
  ScientificEvent,
} from '../../types/msrasi';

interface AdminNewsPageProps {
  articles: NewsArticle[];
  events: ScientificEvent[];
  onNavigate: (route: RoutePath) => void;
}

const ARTICLE_CATEGORIES: Array<'Toutes' | ArticleCategory> = [
  'Toutes',
  'Annonces officielles',
  'Résultats de recherche',
  'Retours sur événements',
  'Partenariats',
];

export const AdminNewsPage: React.FC<AdminNewsPageProps> = ({
  articles,
  events,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    () => events.find((e) => e.status === 'cloture')?.id || events[0]?.id || ''
  );
  const [injectSpeakers, setInjectSpeakers] = useState(true);
  const [injectGallery, setInjectGallery] = useState(true);
  const [injectStats, setInjectStats] = useState(true);
  const [injectDoi, setInjectDoi] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState<'Toutes' | ArticleCategory>('Toutes');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'views'>('recent');
  const [currentPage, setCurrentPage] = useState(1);

  const [editorArticle, setEditorArticle] = useState<NewsArticle | null>(null);
  const [readerArticle, setReaderArticle] = useState<NewsArticle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);

  const selectedSourceEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  const totalViews = useMemo(
    () => articles.reduce((acc, a) => acc + (a.views || 0), 0),
    [articles]
  );

  const convertedCount = useMemo(
    () => articles.filter((a) => Boolean(a.linkedEventCode)).length,
    [articles]
  );

  const filteredArticles = useMemo(() => {
    const base = articles.filter((a) => {
      if (categoryFilter !== 'Toutes' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${a.title} ${a.author} ${a.department} ${a.linkedEventCode || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return sortBy === 'views' ? [...base].sort((a, b) => b.views - a.views) : base;
  }, [articles, categoryFilter, statusFilter, searchQuery, sortBy]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedArticles = filteredArticles.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const buildDraftFromEvent = (): NewsArticle => {
    const evt = selectedSourceEvent;
    const blocks: string[] = [];
    if (evt) {
      blocks.push(
        `Rabat — Clôturé avec succès (${evt.dateLabel}), « ${evt.title} » a réuni ${evt.registeredCount} participants à ${evt.city}.`
      );
      if (injectSpeakers) {
        blocks.push(
          'Les sessions plénières animées par les professeurs et chercheurs du réseau MSRASI ont mis en lumière les avancées majeures en recherche appliquée.'
        );
      }
      if (injectStats) {
        blocks.push(
          `Bilan chiffré : ${evt.registeredCount} participants accueillis sur une capacité de ${evt.capacity} places (${evt.format}).`
        );
      }
      if (injectDoi && evt.doi) {
        blocks.push(`Référence pérenne des actes scientifiques : DOI ${evt.doi}.`);
      }
    }
    return {
      id: `art-${Date.now()}`,
      title: evt
        ? `Retour en images sur ${evt.title} : ${evt.registeredCount} participants à ${evt.city}`
        : 'Compte-rendu scientifique MSRASI',
      summary: evt?.shortSummary || 'Synthèse scientifique post-événement MSRASI.',
      content: blocks.join('\n\n'),
      author: "Comité d'Organisation MSRASI",
      department: 'Conversion Automatique',
      category: 'Retours sur événements',
      publishedLabel: "Aujourd'hui",
      views: 0,
      sharesLabel: injectGallery ? 'Galerie HD incluse' : 'Brouillon généré',
      linkedEventCode: evt?.code || 'MSRASI-2025',
      status: 'brouillon',
      featured: false,
      imageUrl: evt?.imageUrl || HOTLINK_IMAGES.newsCisaRecap,
      createdBy: 'admin-news',
    };
  };

  const handleGenerateDraft = async (openInEditor: boolean) => {
    const draft = buildDraftFromEvent();
    if (openInEditor) {
      setEditorArticle(draft);
      return;
    }
    await saveArticleRecord(draft);
    showToast('Brouillon enrichi généré et ajouté à la liste.', 'success');
  };

  const handleOpenBlankEditor = () => {
    setEditorArticle({
      id: `art-${Date.now()}`,
      title: '',
      summary: '',
      content: '',
      author: 'Secrétariat Général MSRASI',
      department: 'Conseil Scientifique',
      category: 'Annonces officielles',
      publishedLabel: "Aujourd'hui",
      views: 0,
      sharesLabel: '0 partages pro',
      status: 'brouillon',
      featured: false,
      imageUrl: HOTLINK_IMAGES.newsPartnership,
      createdBy: 'admin-news',
    });
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorArticle || !editorArticle.title.trim()) {
      showToast("Veuillez saisir un titre d'article.", 'warning');
      return;
    }
    await saveArticleRecord(editorArticle);
    setEditorArticle(null);
    showToast('Article enregistré.', 'success');
  };

  const handleToggleFeatured = async (art: NewsArticle) => {
    await saveArticleRecord({ ...art, featured: !art.featured });
    showToast(
      !art.featured ? 'Article mis à la une.' : 'Article retiré de la une.',
      'success'
    );
  };

  const handleDuplicate = async (art: NewsArticle) => {
    await saveArticleRecord({
      ...art,
      id: `art-${Date.now()}`,
      title: `${art.title} (Copie)`,
      status: 'brouillon',
      featured: false,
      views: 0,
    });
    showToast('Article dupliqué en brouillon.', 'success');
  };

  const handleArchive = async (art: NewsArticle) => {
    await saveArticleRecord({ ...art, status: 'archive', featured: false });
    showToast('Article archivé.', 'info');
  };

  const handleExportCsv = async () => {
    exportCsvFile(
      'msrasi-actualites.csv',
      ['Titre', 'Auteur', 'Catégorie', 'Date', 'Vues', 'Événement lié', 'Statut'],
      filteredArticles.map((a) => [
        a.title,
        a.author,
        a.category,
        a.publishedLabel,
        a.views,
        a.linkedEventCode || '',
        a.status,
      ])
    );
    await logAdminActivity(
      'export',
      `Export CSV de ${filteredArticles.length} actualités scientifiques.`,
      'Pôle Éditorial'
    );
    showToast('Listing actualités exporté en CSV.', 'success');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumb & Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[12px] text-[#434652]">
          <button
            type="button"
            onClick={() => onNavigate('admin-dashboard')}
            className="hover:text-[#003082] cursor-pointer"
          >
            Administration
          </button>
          <span className="material-symbols-outlined text-[15px]">chevron_right</span>
          <span className="text-[#003082] font-bold">
            Gestion des Actualités &amp; Communications Scientifiques
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#e7eeff] text-[#434652] font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#115cba]" />
          Flux RSS &amp; Newsletter MSRASI : Synchro Active
        </div>
      </div>

      {/* Editorial Header + Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dee9ff] text-[#003082] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px]">campaign</span>
              Pôle Éditorial &amp; Diffusion du Savoir
            </span>
            <h1 className="font-headline-lg text-[28px] font-bold text-[#0d1c30] tracking-tight">
              Actualités, Communiqués &amp; Retours d&apos;Événements
            </h1>
            <p className="text-[14px] text-[#434652]">
              Rédigez les annonces de l&apos;association, diffusez les avancées de recherche et
              convertissez les événements terminés en articles récapitulatifs sans ressaisie
              manuelle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#793d00] hover:bg-[#572a00] text-white font-semibold text-[13px] shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Convertir un événement clôturé
            </button>
            <button
              type="button"
              onClick={handleOpenBlankEditor}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1646a8] hover:bg-[#003082] text-white font-semibold text-[13px] shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              + Rédiger un article
            </button>
          </div>
        </div>

        {/* 4 Editorial Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f0f3ff] rounded-lg p-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
              Articles en Ligne
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-headline-md text-[24px] font-bold text-[#003082] tabular-nums">
                {articles.filter((a) => a.status === 'publie').length}
              </span>
              <span className="text-[11px] text-[#115cba] font-semibold">
                / {articles.length} total
              </span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
              Lectures Cumulées
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-headline-md text-[24px] font-bold text-[#0d1c30] tabular-nums">
                {(totalViews / 1000).toFixed(1)}k
              </span>
              <span className="text-[11px] text-[#115cba] font-semibold">Portail public</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
              Taux de Citations
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-headline-md text-[24px] font-bold text-[#003082]">14.2%</span>
              <span className="text-[11px] text-[#747684]">Indexées CNRST</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
              Actes Convertis
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-headline-md text-[24px] font-bold text-[#793d00] tabular-nums">
                {convertedCount}
              </span>
              <span className="text-[11px] text-[#793d00] font-semibold">Liés à un événement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Post-Event Article Generator */}
      {drawerOpen && (
        <div className="bg-[#d5e3fe] rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#572a00] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">auto_stories</span>
              </div>
              <div>
                <h2 className="font-headline-xs text-[16px] font-bold text-[#0d1c30] flex items-center gap-2">
                  Générateur d&apos;Article Post-Événement
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-[#ffdcc4] text-[#2f1400]">
                    Métadonnées &amp; Actes
                  </span>
                </h2>
                <p className="text-[12px] text-[#434652]">
                  Compilez instantanément les orateurs, visuels et statistiques d&apos;audience en
                  une dépêche prête à publier.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded hover:bg-white/40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white p-4 rounded-lg shadow-sm space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#0d1c30] mb-1">
                  Événement à Convertir
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full h-10 px-3 rounded bg-[#f0f3ff] text-[13px] text-[#0d1c30]"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.code} — {ev.title} ({ev.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-[12px] text-[#434652]">
                <span className="block font-bold text-[#0d1c30]">
                  Éléments Injectés Automatiquement
                </span>
                {[
                  {
                    checked: injectSpeakers,
                    set: setInjectSpeakers,
                    label: 'Liste des orateurs & laboratoires représentés',
                  },
                  {
                    checked: injectGallery,
                    set: setInjectGallery,
                    label: 'Galerie photo officielle HD',
                  },
                  {
                    checked: injectStats,
                    set: setInjectStats,
                    label: `Chiffres clés (${selectedSourceEvent?.registeredCount || 0} participants)`,
                  },
                  {
                    checked: injectDoi,
                    set: setInjectDoi,
                    label: 'Lien pérenne vers les Actes & DOI',
                  },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.checked}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="accent-[#003082]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleGenerateDraft(false)}
                className="w-full py-2.5 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                Générer le brouillon enrichi
              </button>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-8 bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#747684]">
                    Aperçu du gabarit généré
                  </span>
                  <span className="font-mono text-[11px] text-[#115cba]">
                    Format : Editorial Institutional Mono
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 rounded bg-[#f0f3ff] overflow-hidden h-36 relative">
                    <SafeImage
                      src={selectedSourceEvent?.imageUrl || HOTLINK_IMAGES.newsCisaRecap}
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={selectedSourceEvent?.title || 'Aperçu événement'}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[#0d1c30]/80 text-white text-[10px]">
                      Photo Principale
                    </span>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#e7eeff] text-[#003082] text-[11px] font-semibold">
                      Retours sur événements
                    </span>
                    <h3 className="font-bold text-[15px] text-[#0d1c30]">
                      Retour en images sur {selectedSourceEvent?.title || 'l’événement'} :{' '}
                      {selectedSourceEvent?.registeredCount || 0} congressistes à{' '}
                      {selectedSourceEvent?.city || 'Rabat'}
                    </h3>
                    <p className="text-[12px] text-[#434652] line-clamp-2">
                      {selectedSourceEvent?.shortSummary}
                    </p>
                    <div className="flex items-center gap-3 pt-1 font-mono text-[11px] text-[#747684]">
                      <span>Code: {selectedSourceEvent?.code}</span>
                      <span>•</span>
                      <span>DOI: {selectedSourceEvent?.doi || 'Indexation en cours'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 flex items-center justify-end gap-2 border-t border-[#e7eeff]">
                <button
                  type="button"
                  onClick={() => handleGenerateDraft(true)}
                  className="px-4 py-1.5 rounded bg-[#793d00] hover:bg-[#572a00] text-white font-semibold text-[12px] cursor-pointer"
                >
                  Ouvrir dans l&apos;éditeur de contenu →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtering Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#f0f3ff]">
            {ARTICLE_CATEGORIES.map((cat) => {
              const count =
                cat === 'Toutes'
                  ? articles.length
                  : articles.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#003082] text-white shadow-sm'
                      : 'text-[#434652] hover:bg-[#e7eeff]'
                  }`}
                >
                  {cat} <span className="ml-1 opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSortBy((s) => (s === 'recent' ? 'views' : 'recent'))}
            className="text-[12px] font-semibold text-[#003082] hover:underline cursor-pointer"
          >
            Tri par : {sortBy === 'recent' ? 'Date décroissante' : 'Nombre de vues'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-3 rounded-lg shadow-sm">
          <div className="md:col-span-7 relative">
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
              placeholder="Rechercher par mot-clé, chercheur, laboratoire ou événement lié..."
              className="w-full h-10 pl-10 pr-3 rounded bg-[#f0f3ff] text-[13px] text-[#0d1c30] focus:outline-none"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded bg-[#f0f3ff] text-[13px] text-[#0d1c30]"
            >
              <option value="all">Tous les statuts</option>
              <option value="publie">Publié en ligne</option>
              <option value="brouillon">Brouillon</option>
              <option value="en_revue">En revue scientifique</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-10 px-4 rounded bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#003082] font-semibold text-[12px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f3ff] text-[#747684] text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Article &amp; Auteur</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Publication</th>
                <th className="py-3 px-3 text-right">Vues &amp; Impact</th>
                <th className="py-3 px-3">Événement Lié</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-3 text-center">À la une</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7eeff] text-[13px]">
              {paginatedArticles.map((art) => (
                <tr key={art.id} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#e7eeff]">
                        <SafeImage
                          src={art.imageUrl}
                          fallback={LOCAL_FALLBACK_IMAGES.conference}
                          alt={art.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-[280px]">
                        <button
                          type="button"
                          onClick={() => setReaderArticle(art)}
                          className="font-semibold text-[#0d1c30] hover:text-[#003082] truncate block text-left w-full cursor-pointer"
                        >
                          {art.title}
                        </button>
                        <div className="text-[11px] text-[#747684] truncate">
                          {art.author} • <span className="text-[#115cba]">{art.department}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#dee9ff] text-[#003082] text-[11px] font-semibold">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#434652]">
                    {art.publishedLabel}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-right">
                    <div className="font-semibold text-[#0d1c30] tabular-nums">
                      {art.views.toLocaleString('fr-FR')} vues
                    </div>
                    <div className="text-[11px] text-[#115cba]">{art.sharesLabel}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {art.linkedEventCode ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#793d00] text-white text-[11px] font-bold">
                        <span className="material-symbols-outlined text-[13px]">link</span>
                        {art.linkedEventCode}
                      </span>
                    ) : (
                      <span className="text-[#747684] italic text-[12px]">— Aucun</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        art.status === 'publie'
                          ? 'bg-[#E6F5EE] text-[#087A4B]'
                          : art.status === 'en_revue'
                            ? 'bg-[#ffdcc4] text-[#6f3800]'
                            : 'bg-[#e7eeff] text-[#434652]'
                      }`}
                    >
                      {art.status === 'publie'
                        ? 'Publié'
                        : art.status === 'en_revue'
                          ? 'En revue'
                          : art.status === 'archive'
                            ? 'Archivé'
                            : 'Brouillon'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={art.featured}
                        onChange={() => handleToggleFeatured(art)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#e7eeff] rounded-full peer peer-checked:bg-[#003082] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 text-[#434652]">
                      <button
                        type="button"
                        onClick={() => setEditorArticle(art)}
                        className="p-1.5 rounded hover:bg-[#e7eeff] hover:text-[#003082] cursor-pointer"
                        title="Modifier"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(art)}
                        className="p-1.5 rounded hover:bg-[#e7eeff] hover:text-[#003082] cursor-pointer"
                        title="Dupliquer"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReaderArticle(art)}
                        className="p-1.5 rounded hover:bg-[#e7eeff] hover:text-[#003082] cursor-pointer"
                        title="Aperçu"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(art)}
                        className="p-1.5 rounded hover:bg-[#e7eeff] hover:text-[#793d00] cursor-pointer"
                        title="Archiver"
                      >
                        <span className="material-symbols-outlined text-[18px]">archive</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(art)}
                        className="p-1.5 rounded hover:bg-[#ffdad6] hover:text-[#ba1a1a] cursor-pointer"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-[#f0f3ff] px-5 py-3 flex items-center justify-between text-[12px] text-[#434652]">
          <span>
            Affichage de {filteredArticles.length === 0 ? 0 : (safePage - 1) * pageSize + 1} à{' '}
            {Math.min(safePage * pageSize, filteredArticles.length)} sur {filteredArticles.length}{' '}
            actualités
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded font-bold cursor-pointer ${
                  safePage === i + 1 ? 'bg-[#003082] text-white' : 'hover:bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Scientific Rigor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[#003082] text-[24px]">verified</span>
          <div>
            <h4 className="font-bold text-[14px] text-[#0d1c30]">Protocole de Validation</h4>
            <p className="text-[12px] text-[#434652] mt-0.5">
              Toute annonce mentionnant un brevet ou une découverte majeure requiert l&apos;aval du
              Secrétaire de Commission.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[#793d00] text-[24px]">share</span>
          <div>
            <h4 className="font-bold text-[14px] text-[#0d1c30]">Multi-Diffusion Automatisée</h4>
            <p className="text-[12px] text-[#434652] mt-0.5">
              Dès publication, l&apos;article alimente simultanément la lettre d&apos;information
              aux membres et les réseaux académiques.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-[#115cba] text-[24px]">archive</span>
          <div>
            <h4 className="font-bold text-[14px] text-[#0d1c30]">Conservation Pérenne</h4>
            <p className="text-[12px] text-[#434652] mt-0.5">
              Chaque publication d&apos;événement clôturé est dotée d&apos;une clé d&apos;archivage
              indexable par le Comité National.
            </p>
          </div>
        </div>
      </div>

      {/* Article Editor Modal */}
      {editorArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditor}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-5 bg-[#233145] text-white flex items-center justify-between">
              <h3 className="font-headline-xs font-bold">Éditeur d&apos;Article Scientifique</h3>
              <button
                type="button"
                onClick={() => setEditorArticle(null)}
                className="cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[12px] font-bold mb-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={editorArticle.title}
                  onChange={(e) => setEditorArticle({ ...editorArticle, title: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-bold mb-1">Catégorie</label>
                  <select
                    value={editorArticle.category}
                    onChange={(e) =>
                      setEditorArticle({
                        ...editorArticle,
                        category: e.target.value as ArticleCategory,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                  >
                    <option value="Annonces officielles">Annonces officielles</option>
                    <option value="Résultats de recherche">Résultats de recherche</option>
                    <option value="Retours sur événements">Retours sur événements</option>
                    <option value="Partenariats">Partenariats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1">Statut</label>
                  <select
                    value={editorArticle.status}
                    onChange={(e) =>
                      setEditorArticle({
                        ...editorArticle,
                        status: e.target.value as ArticleStatus,
                      })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="en_revue">En revue</option>
                    <option value="publie">Publié</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold mb-1">Auteur</label>
                  <input
                    type="text"
                    value={editorArticle.author}
                    onChange={(e) =>
                      setEditorArticle({ ...editorArticle, author: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Résumé</label>
                <textarea
                  rows={2}
                  value={editorArticle.summary}
                  onChange={(e) =>
                    setEditorArticle({ ...editorArticle, summary: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold mb-1">Contenu complet</label>
                <textarea
                  rows={5}
                  value={editorArticle.content}
                  onChange={(e) =>
                    setEditorArticle({ ...editorArticle, content: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-[#f0f3ff] text-[13px]"
                />
              </div>
            </div>
            <div className="p-4 bg-[#f0f3ff] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditorArticle(null)}
                className="px-4 py-2 rounded-lg bg-white text-[#434652] font-semibold text-[13px] cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#003082] text-white font-semibold text-[13px] cursor-pointer"
              >
                Enregistrer l&apos;article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Article Reader Modal */}
      {readerArticle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="relative h-56">
              <SafeImage
                src={readerArticle.imageUrl}
                fallback={LOCAL_FALLBACK_IMAGES.conference}
                alt={readerArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setReaderArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-[#dee9ff] text-[#003082] text-[11px] font-bold">
                {readerArticle.category}
              </span>
              <h3 className="font-headline-sm text-[20px] font-bold text-[#0d1c30]">
                {readerArticle.title}
              </h3>
              <p className="text-[12px] text-[#747684]">
                Par {readerArticle.author} • {readerArticle.publishedLabel}
              </p>
              <p className="text-[14px] text-[#434652] whitespace-pre-line leading-relaxed pt-2">
                {readerArticle.content || readerArticle.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-headline-sm font-bold text-[#0d1c30]">Supprimer l&apos;article</h3>
            <p className="text-[13px] text-[#434652]">
              Voulez-vous supprimer définitivement « <strong>{deleteTarget.title}</strong> » ?
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
                onClick={async () => {
                  await deleteArticleRecord(deleteTarget.id);
                  setDeleteTarget(null);
                  showToast('Article supprimé.', 'info');
                }}
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
