import React, { useRef, useState } from 'react';
import { DEFAULT_TARIFF_TIERS, HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import { saveEventRecord } from '../../services/msrasiService';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import type {
  EventArchetype,
  EventFormat,
  EventStatus,
  RoutePath,
  ScientificEvent,
} from '../../types/msrasi';

interface AdminEventWizardPageProps {
  draftEvent: ScientificEvent;
  onChangeDraft: (event: ScientificEvent) => void;
  onNavigate: (route: RoutePath) => void;
}

const ARCHETYPES: Array<{
  key: EventArchetype;
  category: string;
  title: string;
  desc: string;
  badge: string;
  icon: string;
}> = [
  {
    key: 'conf',
    category: 'Conférences',
    title: 'Conférence Internationale',
    desc: 'Format multi-sessions, appels à communications, comité scientifique & actes.',
    badge: 'Scopus & DOI Ready',
    icon: 'podium',
  },
  {
    key: 'workshop',
    category: 'Ateliers',
    title: 'Atelier Technique / Workshop',
    desc: 'Capacité restreinte, sessions pratiques en laboratoire ou FabLab.',
    badge: 'Attestation incluse',
    icon: 'precision_manufacturing',
  },
  {
    key: 'hackathon',
    category: 'Compétitions & Hackathons',
    title: 'Hackathon / Compétition',
    desc: 'Défis de 48h, constitution d’équipes, mentorat et dotations R&D.',
    badge: 'Jury & Prix MSRASI',
    icon: 'trophy',
  },
  {
    key: 'symposium',
    category: 'Séminaires',
    title: 'Symposium Thématique',
    desc: 'Tables rondes ministérielles, partenaires industriels et transferts.',
    badge: 'Format B2B & Académique',
    icon: 'hub',
  },
];

const WIZARD_STEPS = [
  { num: 1, label: 'Infos Générales' },
  { num: 2, label: 'Médias & Affiches' },
  { num: 3, label: 'Dates & Lieux' },
  { num: 4, label: 'Programme & Jury' },
  { num: 5, label: 'Inscriptions & Tarifs' },
  { num: 6, label: 'Indexation & Live' },
];

const COVER_PRESETS = [
  { label: 'Campus & Solaire (Rabat)', url: HOTLINK_IMAGES.wizardCover },
  { label: 'Amphithéâtre CISA', url: HOTLINK_IMAGES.cisaAmphitheater },
  { label: 'Laboratoire Robotique', url: HOTLINK_IMAGES.roboticsWorkshop },
  { label: 'Hydrogène & Énergie', url: HOTLINK_IMAGES.hydrogenSymposium },
  { label: 'Hackathon Agritech', url: HOTLINK_IMAGES.hackathonAgri },
];

export const AdminEventWizardPage: React.FC<AdminEventWizardPageProps> = ({
  draftEvent,
  onChangeDraft,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [tagInput, setTagInput] = useState('');
  const [zoomScale, setZoomScale] = useState(100);
  const [posterLightbox, setPosterLightbox] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState('https://stream.msrasi.ma/live/cisa-2025');
  const [annexFiles, setAnnexFiles] = useState<Array<{ name: string; size: string; status: string }>>([
    { name: 'Protocole_Partenariat_MASEN.pdf', size: '1.2 Mo', status: 'Validé' },
    { name: 'Amphitheatre_Principal_Rabat.jpg', size: '3.8 Mo', status: 'Prêt' },
  ]);
  const [saving, setSaving] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateField = <K extends keyof ScientificEvent>(key: K, value: ScientificEvent[K]) => {
    onChangeDraft({ ...draftEvent, [key]: value });
  };

  const handleSelectArchetype = (arch: (typeof ARCHETYPES)[number]) => {
    onChangeDraft({
      ...draftEvent,
      archetype: arch.key,
      category: arch.category,
    });
  };

  const handleToggleLanguage = (langLabel: string) => {
    const exists = draftEvent.languages.includes(langLabel);
    const next = exists
      ? draftEvent.languages.filter((l) => l !== langLabel)
      : [...draftEvent.languages, langLabel];
    updateField('languages', next.length > 0 ? next : ['Français']);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = tagInput.trim();
      if (!raw) return;
      const formatted = raw.startsWith('#') ? raw : `#${raw}`;
      if (!draftEvent.tags.includes(formatted)) {
        updateField('tags', [...draftEvent.tags, formatted]);
      }
      setTagInput('');
    }
  };

  const applyFormatMarker = (prefix: string, suffix = '') => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = draftEvent.description || '';
    const selected = current.slice(start, end) || 'texte scientifique';
    const next = current.slice(0, start) + prefix + selected + suffix + current.slice(end);
    updateField('description', next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added = Array.from(files).map((f) => ({
      name: f.name,
      size: `${Math.max(0.1, Number((f.size / (1024 * 1024)).toFixed(1)))} Mo`,
      status: 'Prêt',
    }));
    setAnnexFiles((prev) => [...added, ...prev]);
    showToast(`${added.length} document(s) ajouté(s) au dossier.`, 'success');
  };

  const handleSave = async (targetStatus?: EventStatus, redirectTo?: RoutePath) => {
    if (!draftEvent.title.trim()) {
      showToast('Veuillez saisir un titre officiel pour cet événement.', 'warning');
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const updated = await saveEventRecord({
        ...draftEvent,
        status: targetStatus || draftEvent.status,
      });
      onChangeDraft(updated);
      showToast(
        targetStatus === 'publie'
          ? `Événement « ${updated.code} » publié sur le portail !`
          : 'Modifications enregistrées.',
        'success'
      );
      if (redirectTo) onNavigate(redirectTo);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Page Title & Quick Exit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-[#434652] mb-1">
            <span>Événements</span>
            <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            <span className="text-[#003082] font-semibold">Assistant de Configuration</span>
          </div>
          <h1 className="font-headline-lg text-[26px] font-bold text-[#0d1c30] tracking-tight">
            {draftEvent.title || 'Nouvel Événement Scientifique MSRASI'}
          </h1>
          <p className="text-[13px] text-[#434652]">
            Code : <span className="font-mono font-bold text-[#003082]">{draftEvent.code}</span> •
            Statut actuel : <strong className="uppercase">{draftEvent.status}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave(undefined, 'admin-events')}
          className="px-4 py-2 rounded-lg bg-[#dee9ff] hover:bg-[#d5e3fe] text-[#003082] font-semibold text-[13px] cursor-pointer"
        >
          Enregistrer &amp; Quitter
        </button>
      </div>

      {/* 1. Archetype Selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#434652]">
            1. Sélectionnez l&apos;archétype scientifique
          </h2>
          <span className="text-[12px] text-[#115cba] font-semibold">
            Synchronise automatiquement la structure publique
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {ARCHETYPES.map((arch) => {
            const selected = draftEvent.archetype === arch.key;
            return (
              <button
                key={arch.key}
                type="button"
                onClick={() => handleSelectArchetype(arch)}
                className={`text-left p-4 rounded-xl bg-white transition-all border-l-4 cursor-pointer ${
                  selected
                    ? 'border-l-[#003082] shadow-md'
                    : 'border-l-transparent opacity-80 hover:opacity-100 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#f0f3ff] text-[#003082] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{arch.icon}</span>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[#003082]">
                    {selected ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <h3 className="font-bold text-[14px] text-[#0d1c30]">{arch.title}</h3>
                <p className="text-[12px] text-[#434652] mt-1 line-clamp-2">{arch.desc}</p>
                <span className="inline-block mt-2.5 px-2 py-0.5 rounded bg-[#e7eeff] text-[#003082] text-[10px] font-bold">
                  {arch.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 6-Step Progress Navigation Bar */}
      <div className="bg-white rounded-xl p-2 shadow-sm flex overflow-x-auto gap-1.5">
        {WIZARD_STEPS.map((st) => {
          const active = step === st.num;
          const completed = step > st.num;
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setStep(st.num)}
              className={`flex-1 min-w-[145px] py-2.5 px-3 rounded-lg flex items-center gap-2 text-left transition-all cursor-pointer ${
                active
                  ? 'bg-[#003082] text-white shadow-sm'
                  : completed
                    ? 'bg-[#E6F5EE] text-[#087A4B]'
                    : 'hover:bg-[#f0f3ff] text-[#434652]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  active
                    ? 'bg-white text-[#003082]'
                    : completed
                      ? 'bg-[#087A4B] text-white'
                      : 'bg-[#e7eeff] text-[#434652]'
                }`}
              >
                {completed ? '✓' : st.num}
              </span>
              <span className="text-[12px] font-semibold truncate">{st.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Step Content */}
      {step === 1 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Titre Officiel du Colloque / Événement *
              </label>
              <input
                type="text"
                value={draftEvent.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff] text-[14px] text-[#0d1c30] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
              />
            </div>
            <div className="md:col-span-4">
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Code Référence Interne
              </label>
              <input
                type="text"
                value={draftEvent.code}
                onChange={(e) => updateField('code', e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg bg-[#f0f3ff] font-mono text-[13px] text-[#003082] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
              Accroche &amp; Résumé Exécutif (Carte Portail)
            </label>
            <textarea
              rows={2}
              value={draftEvent.shortSummary}
              onChange={(e) => updateField('shortSummary', e.target.value)}
              className="w-full p-3.5 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
            />
          </div>

          {/* WYSIWYG Description Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-bold text-[#0d1c30]">
                Argumentaire Scientifique Détaillé
              </label>
              <div className="flex items-center gap-1 bg-[#f0f3ff] p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => applyFormatMarker('**', '**')}
                  className="px-2 py-0.5 rounded hover:bg-white font-bold text-[12px] cursor-pointer"
                  title="Gras"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatMarker('*', '*')}
                  className="px-2 py-0.5 rounded hover:bg-white italic text-[12px] cursor-pointer"
                  title="Italique"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatMarker('\n• ')}
                  className="px-2 py-0.5 rounded hover:bg-white text-[12px] cursor-pointer"
                  title="Liste à puces"
                >
                  • Liste
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatMarker('[', '](https://msrasi.ma)')}
                  className="px-2 py-0.5 rounded hover:bg-white text-[12px] text-[#115cba] cursor-pointer"
                  title="Lien"
                >
                  Lien
                </button>
              </div>
            </div>
            <textarea
              ref={descriptionRef}
              rows={5}
              value={draftEvent.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full p-3.5 rounded-lg bg-[#f0f3ff] text-[13px] text-[#0d1c30] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#115cba]"
            />
          </div>

          {/* Discipline, Languages, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-2">
                Langues de Travail
              </label>
              <div className="flex flex-wrap gap-2">
                {['Français', 'Anglais', 'Arabe (العربية)'].map((l) => {
                  const active = draftEvent.languages.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleToggleLanguage(l)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#003082] text-white'
                          : 'bg-[#dee9ff] text-[#0d1c30] hover:bg-[#d5e3fe]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {active ? 'check' : 'add'}
                      </span>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-2">
                Mots-clés &amp; Descripteurs (#Tags — Entrée pour ajouter)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-[#f0f3ff]">
                {draftEvent.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#d5e3fe] text-[#003082] text-[12px] font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'tags',
                          draftEvent.tags.filter((t) => t !== tag)
                        )
                      }
                      className="hover:text-[#ba1a1a] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ #SouverainetéTech"
                  className="bg-transparent text-[12px] px-2 py-1 focus:outline-none min-w-[140px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 16:9 Focal Crop Cover Picker */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-xs text-[16px] font-bold text-[#0d1c30]">
                Visuel Bannière 16:9 &amp; Cadrage
              </h3>
              <span className="text-[12px] font-mono text-[#003082]">Zoom {zoomScale}%</span>
            </div>

            <div className="aspect-video rounded-xl overflow-hidden bg-[#0d1c30] relative">
              <div
                className="w-full h-full transition-transform duration-200"
                style={{ transform: `scale(${zoomScale / 100})` }}
              >
                <SafeImage
                  src={draftEvent.imageUrl}
                  fallback={LOCAL_FALLBACK_IMAGES.conference}
                  alt={draftEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#434652] text-[18px]">zoom_in</span>
              <input
                type="range"
                min={100}
                max={140}
                value={zoomScale}
                onChange={(e) => setZoomScale(Number(e.target.value))}
                className="flex-1 accent-[#003082]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-[#0d1c30]">
                Sélectionner une illustration institutionnelle ou saisir une URL
              </label>
              <div className="flex flex-wrap gap-2">
                {COVER_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => updateField('imageUrl', p.url)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                      draftEvent.imageUrl === p.url
                        ? 'bg-[#003082] text-white'
                        : 'bg-[#f0f3ff] text-[#434652] hover:bg-[#dee9ff]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={draftEvent.imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[12px] font-mono text-[#0d1c30]"
              />
            </div>
          </div>

          {/* Poster A4 & Annex Upload */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-xs text-[15px] font-bold text-[#0d1c30]">
                  Affiche Officielle (Format A3 / A4)
                </h3>
                <button
                  type="button"
                  onClick={() => setPosterLightbox(true)}
                  className="text-[12px] font-semibold text-[#115cba] hover:underline cursor-pointer"
                >
                  Agrandir
                </button>
              </div>
              <div className="h-44 rounded-lg overflow-hidden bg-[#f0f3ff]">
                <SafeImage
                  src={HOTLINK_IMAGES.wizardPoster}
                  fallback={LOCAL_FALLBACK_IMAGES.energy}
                  alt="Affiche officielle MSRASI"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-xs text-[15px] font-bold text-[#0d1c30]">
                  Dossier Documentaire &amp; Annexes
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#003082] text-white text-[12px] font-semibold cursor-pointer"
                >
                  + Importer PDF / ZIP
                </button>
              </div>
              <div className="space-y-2">
                {annexFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#f0f3ff]"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#0d1c30] truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-[#747684]">
                        {file.size} • {file.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAnnexFiles((prev) => prev.filter((f) => f.name !== file.name))
                      }
                      className="text-[#747684] hover:text-[#ba1a1a] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[17px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
            Calendrier, Lieu d&apos;Accueil &amp; Modalités Hybrides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Date de début (ISO)
              </label>
              <input
                type="date"
                value={draftEvent.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Libellé Date Affiché
              </label>
              <input
                type="text"
                value={draftEvent.dateLabel}
                onChange={(e) => updateField('dateLabel', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Modalité d&apos;organisation
              </label>
              <select
                value={draftEvent.format}
                onChange={(e) => updateField('format', e.target.value as EventFormat)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              >
                <option value="hybride">Hybride (Présentiel &amp; Streaming)</option>
                <option value="presentiel">Présentiel Uniquement</option>
                <option value="virtuel">100% Distanciel (Virtuel)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">Ville</label>
              <input
                type="text"
                value={draftEvent.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Campus / Palais des Congrès
              </label>
              <input
                type="text"
                value={draftEvent.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              />
            </div>
          </div>

          {draftEvent.format !== 'presentiel' && (
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                URL Salle de Diffusion Streaming MSRASI
              </label>
              <input
                type="url"
                value={streamingUrl}
                onChange={(e) => setStreamingUrl(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] font-mono text-[12px]"
              />
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
            Discipline Scientifique &amp; Comité de Lecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Pôle / Discipline Principale
              </label>
              <select
                value={draftEvent.discipline}
                onChange={(e) => updateField('discipline', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              >
                <option value="ia">Intelligence Artificielle &amp; Data Science</option>
                <option value="energie">Énergies Renouvelables &amp; Hydrogène Vert</option>
                <option value="biotech">Biotechnologies &amp; Santé Digitale</option>
                <option value="agritech">AgriTech &amp; Gestion Hydrique</option>
                <option value="materiaux">Matériaux Avancés &amp; Nanotechnologies</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Catégorie Portail
              </label>
              <input
                type="text"
                value={draftEvent.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#f0f3ff] text-[13px] text-[#434652]">
            Le programme type en 3 journées et les 4 conférenciers pléniers MSRASI sont prêts à
            être personnalisés dans l&apos;aperçu public.
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
            Capacité d&apos;Accueil &amp; Grille Tarifaire
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Capacité Maximale (Places)
              </label>
              <input
                type="number"
                min={10}
                max={10000}
                value={draftEvent.capacity}
                onChange={(e) => updateField('capacity', Number(e.target.value) || 50)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[14px] font-bold"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Inscrits Actuels
              </label>
              <input
                type="number"
                min={0}
                value={draftEvent.registeredCount}
                onChange={(e) => updateField('registeredCount', Number(e.target.value) || 0)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[14px] font-bold"
              />
            </div>
            <div className="flex items-end">
              <label className="w-full h-11 px-4 rounded-lg bg-[#f0f3ff] flex items-center justify-between cursor-pointer">
                <span className="text-[13px] font-semibold text-[#0d1c30]">
                  Mettre à la Une (Accueil)
                </span>
                <input
                  type="checkbox"
                  checked={draftEvent.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-4 h-4 accent-[#003082]"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {DEFAULT_TARIFF_TIERS.map((tier) => (
              <div key={tier.id} className="p-4 rounded-xl bg-[#f9f9ff] space-y-1">
                <span className="text-[13px] font-bold text-[#0d1c30] block">{tier.title}</span>
                <span className="text-[11px] text-[#434652] block">{tier.subtitle}</span>
                <span className="text-[15px] font-extrabold text-[#003082] block pt-1">
                  {tier.priceLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
            Indexation Scientifique (DOI) &amp; Publication Portail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Identifiant DOI des Actes
              </label>
              <input
                type="text"
                value={draftEvent.doi || ''}
                onChange={(e) => updateField('doi', e.target.value)}
                placeholder="ex: 10.5842/msrasi.2025.01"
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] font-mono text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0d1c30] mb-1.5">
                Statut de Diffusion
              </label>
              <select
                value={draftEvent.status}
                onChange={(e) => updateField('status', e.target.value as EventStatus)}
                className="w-full h-11 px-3 rounded-lg bg-[#f0f3ff] text-[13px] font-semibold"
              >
                <option value="brouillon">Brouillon interne</option>
                <option value="en_attente">En attente de validation bureau</option>
                <option value="publie">Publié (Visible sur le portail public)</option>
                <option value="cloture">Clôturé (Archives &amp; Actes)</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#E6F5EE] text-[#087A4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold">
              <span className="material-symbols-outlined">verified</span>
              <span>
                Toutes les métadonnées requises pour l&apos;indexation MSRASI sont renseignées.
              </span>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publie', 'admin-events')}
              className="px-4 py-2 rounded-lg bg-[#087A4B] hover:opacity-90 text-white text-[13px] font-bold cursor-pointer"
            >
              Publier immédiatement
            </button>
          </div>
        </div>
      )}

      {/* Persistent Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-6 py-3 z-30 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('brouillon')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f0f3ff] hover:bg-[#dee9ff] text-[#0d1c30] font-semibold text-[13px] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">save</span>
          <span>Enregistrer comme brouillon</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={step <= 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#e7eeff] text-[#0d1c30] disabled:opacity-40 font-semibold text-[13px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            <span className="hidden sm:inline">Étape précédente</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin-event-preview')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#f0f3ff] hover:bg-[#dee9ff] text-[#115cba] font-semibold text-[13px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">visibility</span>
            <span className="hidden md:inline">Aperçu en direct</span>
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(6, s + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003082] hover:bg-[#115cba] text-white font-semibold text-[13px] shadow-md cursor-pointer"
            >
              <span>Étape suivante</span>
              <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('publie', 'admin-events')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#087A4B] hover:opacity-90 text-white font-semibold text-[13px] shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">rocket_launch</span>
              <span>Sauvegarder &amp; Publier</span>
            </button>
          )}
        </div>
      </div>

      {/* Poster Zoom Modal */}
      {posterLightbox && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-4 flex items-center justify-between bg-[#233145] text-white">
              <span className="font-bold text-[14px]">Aperçu Affiche Officielle</span>
              <button
                type="button"
                onClick={() => setPosterLightbox(false)}
                className="cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 bg-[#f0f3ff]">
              <SafeImage
                src={HOTLINK_IMAGES.wizardPoster}
                fallback={LOCAL_FALLBACK_IMAGES.energy}
                alt="Affiche officielle"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
