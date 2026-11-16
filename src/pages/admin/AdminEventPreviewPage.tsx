import React, { useState } from 'react';
import {
  DEFAULT_PROGRAM_DAYS,
  DEFAULT_SPEAKERS,
  DEFAULT_TARIFF_TIERS,
  HOTLINK_IMAGES,
  LOCAL_FALLBACK_IMAGES,
} from '../../data/seedData';
import { saveEventRecord } from '../../services/msrasiService';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import type { RoutePath, ScientificEvent } from '../../types/msrasi';

interface AdminEventPreviewPageProps {
  event: ScientificEvent;
  onNavigate: (route: RoutePath) => void;
  onUpdateDraft: (event: ScientificEvent) => void;
}

export const AdminEventPreviewPage: React.FC<AdminEventPreviewPageProps> = ({
  event,
  onNavigate,
  onUpdateDraft,
}) => {
  const { showToast } = useToast();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewLang, setPreviewLang] = useState<'FR' | 'EN' | 'AR'>('FR');
  const [activeDayId, setActiveDayId] = useState(DEFAULT_PROGRAM_DAYS[0].id);
  const [selectedTierId, setSelectedTierId] = useState(DEFAULT_TARIFF_TIERS[1].id);
  const [saving, setSaving] = useState(false);

  const viewportWidthClass =
    viewport === 'desktop'
      ? 'max-w-[1360px]'
      : viewport === 'tablet'
        ? 'max-w-[768px]'
        : 'max-w-[420px]';

  const activeDay =
    DEFAULT_PROGRAM_DAYS.find((d) => d.id === activeDayId) || DEFAULT_PROGRAM_DAYS[0];

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saved = await saveEventRecord(event);
      onUpdateDraft(saved);
      showToast('Brouillon sauvegardé.', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNow = async () => {
    setSaving(true);
    try {
      const published = await saveEventRecord({ ...event, status: 'publie' });
      onUpdateDraft(published);
      showToast(`Événement « ${published.code} » publié sur le portail public !`, 'success');
      onNavigate('admin-events');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Administrative Live Preview Sticky Bar */}
      <div className="sticky top-16 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[#233145] text-[#ebf1ff] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#793d00] text-[#ffdcc4] text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span>
              Mode Prévisualisation Directe (
              {event.status === 'publie' ? 'Publié' : 'Non Publié'})
            </span>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 text-[#c4c6d4] text-[13px]">
            <span className="material-symbols-outlined text-[16px] text-[#ffdcc4]">
              architecture
            </span>
            <span>
              Gabarit actif :{' '}
              <strong className="text-white font-semibold">
                {event.category} • Format {event.format}
              </strong>
            </span>
          </div>
        </div>

        {/* Viewport & Language Toggles */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1 rounded-lg flex items-center gap-0.5">
            {(
              [
                { id: 'desktop', icon: 'desktop_windows', label: 'Desktop' },
                { id: 'tablet', icon: 'tablet_mac', label: 'Tablette' },
                { id: 'mobile', icon: 'smartphone', label: 'Mobile' },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewport(v.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewport === v.id
                    ? 'text-white bg-[#003082]'
                    : 'text-[#c4c6d4] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{v.icon}</span>
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[11px]">
            {(['FR', 'EN', 'AR'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setPreviewLang(code)}
                className={`px-2 py-1 rounded font-bold transition-colors cursor-pointer ${
                  previewLang === code
                    ? 'bg-[#115cba] text-white'
                    : 'text-[#c4c6d4] hover:text-white'
                }`}
              >
                {code === 'AR' ? 'عربي' : code}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('admin-event-wizard')}
            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden md:inline">Retourner à l&apos;éditeur</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="px-3 py-1.5 rounded-lg bg-[#dee9ff] text-[#003082] hover:bg-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span className="hidden lg:inline">Enregistrer</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handlePublishNow}
            className="px-4 py-1.5 rounded-lg bg-[#793d00] hover:bg-[#572a00] text-white text-[13px] font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            <span>Valider &amp; Publier maintenant</span>
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="w-full flex justify-center py-6 transition-all duration-300">
        <div
          className={`w-full ${viewportWidthClass} bg-[#f9f9ff] rounded-xl shadow-2xl transition-all duration-300 overflow-hidden relative`}
        >
          {/* Inspector Bar */}
          <div className="bg-[#003082]/5 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-[#003082] text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>
                Balises dynamiques MSRASI actives ({previewLang}) : simulation fidèle du portail
                public.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#dbe1ff] text-[#00184a] font-mono text-[11px] font-semibold">
              ID_CONGRES: #{event.code}
            </span>
          </div>

          {/* Hero Banner */}
          <section className="relative w-full overflow-hidden bg-[#0d1c30] text-white">
            <div className="relative w-full h-[400px] md:h-[460px]">
              <SafeImage
                src={event.imageUrl || HOTLINK_IMAGES.cisaSpotlight}
                fallback={LOCAL_FALLBACK_IMAGES.conference}
                alt={event.title}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c30] via-[#0d1c30]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#003082]/70 via-transparent to-[#0d1c30]/90" />

              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 mb-2 rounded bg-[#793d00] text-white text-[11px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">code</span>
                  <span>[Champ dynamique : Titre &amp; Thématiques]</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#115cba] text-white text-[11px] font-bold uppercase">
                    {event.category}
                  </span>
                  {event.doi && (
                    <span className="px-3 py-1 rounded-full bg-[#d5e3fe] text-[#003082] text-[11px] font-bold uppercase">
                      DOI {event.doi}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[11px] font-semibold capitalize">
                    Format {event.format}
                  </span>
                </div>
                <h1 className="font-headline-xl text-[26px] md:text-[38px] text-white font-extrabold max-w-4xl leading-tight">
                  {event.title}
                </h1>
                <p className="text-[15px] text-[#dee9ff] max-w-3xl mt-2 line-clamp-2">
                  {event.shortSummary}
                </p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div>
                    <span className="block text-[10px] text-[#c4c6d4] uppercase font-bold">
                      Date du colloque
                    </span>
                    <span className="text-[14px] font-semibold text-white">{event.dateLabel}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#c4c6d4] uppercase font-bold">
                      Lieu
                    </span>
                    <span className="text-[14px] font-semibold text-white">{event.location}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#c4c6d4] uppercase font-bold">
                      Comité MSRASI
                    </span>
                    <span className="text-[14px] font-semibold text-white">
                      Double Évaluation Aveugle
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#c4c6d4] uppercase font-bold">
                      Capacité
                    </span>
                    <span className="text-[14px] font-semibold text-[#ffdcc4]">
                      {event.capacity} places
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Preview Grid */}
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Speakers */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-[22px] font-bold text-[#0d1c30]">
                    Conférenciers Pléniers Invités
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#dee9ff] text-[#003082] text-[11px] font-bold">
                    [Bloc dynamique : Keynotes]
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DEFAULT_SPEAKERS.slice(0, 3).map((spk) => (
                    <div
                      key={spk.name}
                      className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center text-center"
                    >
                      <div className="relative w-20 h-20 mb-2">
                        <SafeImage
                          src={spk.photoUrl}
                          fallback={spk.fallbackPhoto}
                          alt={spk.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#003082] text-white text-[10px] font-bold flex items-center justify-center">
                          {spk.countryCode || 'MA'}
                        </span>
                      </div>
                      <h3 className="font-bold text-[14px] text-[#0d1c30]">{spk.name}</h3>
                      <span className="text-[12px] text-[#115cba] font-medium">
                        {spk.affiliation}
                      </span>
                      <span className="mt-2 px-2 py-0.5 rounded bg-[#e7eeff] text-[11px] text-[#434652]">
                        {spk.metric}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Schedule */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-[22px] font-bold text-[#0d1c30]">
                    Programme Préliminaire des Séances
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#dbe1ff] text-[#003082] text-[11px] font-bold">
                    [Bloc dynamique : Programme]
                  </span>
                </div>

                <div className="flex gap-2 bg-[#dee9ff]/60 p-1 rounded-xl">
                  {DEFAULT_PROGRAM_DAYS.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setActiveDayId(day.id)}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                        activeDay.id === day.id
                          ? 'bg-white shadow-sm text-[#003082]'
                          : 'text-[#434652] hover:text-[#003082]'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {activeDay.slots.map((slot) => (
                    <div
                      key={slot.title}
                      className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-4"
                    >
                      <div className="bg-[#f0f3ff] px-3 py-2 rounded-lg text-center shrink-0">
                        <span className="block text-[13px] font-bold text-[#003082]">
                          {slot.time}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-[#dee9ff] text-[#003082] text-[11px] font-bold">
                            {slot.badge}
                          </span>
                          <span className="text-[12px] text-[#747684]">{slot.room}</span>
                        </div>
                        <h4 className="font-bold text-[15px] text-[#0d1c30]">{slot.title}</h4>
                        <p className="text-[13px] text-[#434652] mt-0.5">{slot.speaker}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 4 Columns: Registration Widget Preview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#793d00] text-white text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">widgets</span>
                  [Composant : Inscription instantanée]
                </div>
                <h3 className="font-headline-sm text-[18px] font-bold text-[#0d1c30]">
                  Sélectionnez Votre Tarif
                </h3>
                <div className="space-y-2">
                  {DEFAULT_TARIFF_TIERS.map((tier) => (
                    <label
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTierId === tier.id
                          ? 'bg-[#dee9ff] ring-1 ring-[#003082]'
                          : 'bg-[#f0f3ff] hover:bg-[#e7eeff]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          checked={selectedTierId === tier.id}
                          onChange={() => setSelectedTierId(tier.id)}
                          className="accent-[#003082]"
                        />
                        <div>
                          <span className="block font-bold text-[13px] text-[#0d1c30]">
                            {tier.title}
                          </span>
                          <span className="block text-[11px] text-[#434652]">{tier.subtitle}</span>
                        </div>
                      </div>
                      <span className="font-bold text-[13px] text-[#003082]">
                        {tier.priceLabel}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('inscription')}
                  className="w-full py-2.5 rounded-lg bg-[#003082] hover:bg-[#115cba] text-white font-semibold text-[13px] cursor-pointer"
                >
                  Tester le parcours d&apos;inscription →
                </button>
              </div>
            </div>
          </div>

          <footer className="p-6 bg-[#233145] text-[#ebf1ff] flex flex-wrap items-center justify-between gap-4 text-[12px]">
            <span>MSRASI • Aperçu Portail Scientifique ({event.code})</span>
            <span>Secrétariat : contact@msrasi.ma</span>
          </footer>
        </div>
      </div>
    </div>
  );
};
