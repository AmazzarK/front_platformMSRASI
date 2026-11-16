import React, { useState } from 'react';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import {
  createRegistrationRecord,
  downloadIcsForEvent,
} from '../../services/msrasiService';
import type {
  EventRegistration,
  RoutePath,
  ScientificEvent,
  TariffTier,
} from '../../types/msrasi';

interface EventRegistrationPageProps {
  event: ScientificEvent;
  selectedTariff: TariffTier;
  onNavigate: (route: RoutePath) => void;
}

export const EventRegistrationPage: React.FC<EventRegistrationPageProps> = ({
  event,
  selectedTariff,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const [fullName, setFullName] = useState('Dr. Youssef BENKIRANE');
  const [email, setEmail] = useState('y.benkirane@um5.ac.ma');
  const [phone, setPhone] = useState('+212 661 48 92 10');
  const [city, setCity] = useState('Rabat');
  const [country, setCountry] = useState('Royaume du Maroc');
  const [institution, setInstitution] = useState('Université Mohammed V de Rabat');
  const [laboratory, setLaboratory] = useState(
    "Laboratoire d'Informatique & Modélisation Appliquée (LIMA)"
  );
  const [academicStatus, setAcademicStatus] = useState('enseignant');
  const [modality, setModality] = useState<'onsite' | 'online'>('onsite');
  const [participationRole, setParticipationRole] = useState<
    'auditeur' | 'auteur_oral' | 'auteur_poster'
  >('auteur_oral');
  const [paperTitle, setPaperTitle] = useState(
    'Deep Learning Optimization for Precision Irrigation in Arid Zones of Southern Morocco'
  );
  const [track, setTrack] = useState('Axe 1: IA, Modélisation & Vision Artificielle');
  const [submissionCode, setSubmissionCode] = useState('CISA-2025-SUB-194');
  const [dietaryPreference, setDietaryPreference] = useState(
    'Standard (Gastronomie Marocaine & Internationale)'
  );
  const [certificateType, setCertificateType] = useState(
    'Attestation de Présentation Orale & Participation'
  );
  const [consentCNDP, setConsentCNDP] = useState(true);
  const [consentMedia, setConsentMedia] = useState(true);

  const [confirmedRecord, setConfirmedRecord] = useState<EventRegistration | null>(null);

  const displayName = confirmedRecord?.fullName || fullName;
  const displayRef = confirmedRecord?.refCode || 'REF-MSRASI-2025-0842';
  const displayModality = confirmedRecord?.modality || modality;
  const displayRoleLabel =
    (confirmedRecord?.academicStatus || academicStatus) === 'doctorant'
      ? 'Doctorant / Post-Doc'
      : (confirmedRecord?.academicStatus || academicStatus) === 'membre_msrasi'
      ? 'Membre Actif MSRASI'
      : 'Enseignant-Chercheur';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentCNDP) {
      showToast('Veuillez accepter la clause de confidentialité CNDP Loi 09-08.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createRegistrationRecord({
        eventId: event.id,
        eventTitle: event.title,
        fullName,
        email,
        phone,
        city,
        country,
        institution,
        laboratory,
        academicStatus,
        modality,
        participationRole,
        paperTitle: participationRole === 'auditeur' ? undefined : paperTitle,
        track: participationRole === 'auditeur' ? undefined : track,
        submissionCode:
          participationRole === 'auditeur' ? undefined : submissionCode,
        tariffLabel: `${selectedTariff.title} (${selectedTariff.priceLabel})`,
        dietaryPreference,
        certificateType,
        consentCNDP: true,
        consentMedia,
      });
      setConfirmedRecord(created);
      showToast(
        `Félicitations ${created.fullName}, votre inscription ${event.code} est validée (${created.refCode}) !`
      );
      setViewMode('success');
    } catch {
      showToast(
        'Inscription enregistrée localement. Votre badge de session est prêt.',
        'info'
      );
      setViewMode('success');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBadgeHtml = () => {
    const htmlBadge = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Badge MSRASI - ${displayRef}</title></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f0f3ff;padding:40px;display:flex;justify-content:center;">
  <div style="width:420px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(16,36,59,0.14);border:1px solid #dbe1ff;">
    <div style="background:#003082;color:#fff;padding:24px;">
      <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#b3c5ff;">Royaume du Maroc • MSRASI</div>
      <h1 style="margin:6px 0 0;font-size:20px;">${event.title}</h1>
      <div style="margin-top:6px;font-size:13px;color:#dbe1ff;">${event.dateLabel} • ${event.location}</div>
    </div>
    <div style="padding:24px;">
      <div style="font-size:11px;color:#747684;text-transform:uppercase;font-weight:700;">Participant Accrédité</div>
      <div style="font-size:22px;font-weight:800;color:#0d1c30;margin-top:4px;">${displayName}</div>
      <div style="font-size:13px;color:#434652;margin-top:4px;">${institution}</div>
      <div style="margin-top:16px;padding:12px;background:#f0f3ff;border-radius:8px;font-family:monospace;font-weight:700;color:#003082;">${displayRef}</div>
      <div style="margin-top:14px;font-size:13px;color:#0d1c30;">
        <strong>Modalité :</strong> ${displayModality === 'onsite' ? 'Présentiel' : 'Distanciel HD'}<br/>
        <strong>Tarif :</strong> ${selectedTariff.title} (${selectedTariff.priceLabel})
      </div>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlBadge], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Badge-${displayRef}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Badge e-accès ${displayRef} téléchargé.`);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Context Strip */}
      <div className="w-full bg-surface-container-low py-space-sm px-gutter-mobile lg:px-gutter-desktop shadow-sm">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs font-code-citation text-code-citation text-on-surface-variant"
          >
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">home</span>
              Accueil
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNavigate('evenements')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Événements
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNavigate('evenement-detail')}
              className="text-on-surface font-semibold hover:text-primary cursor-pointer"
            >
              {event.code}
            </button>
            <span>/</span>
            <span className="text-secondary font-bold">Inscription &amp; Validation</span>
          </nav>

          <div className="flex items-center gap-space-sm text-label-sm font-label-sm">
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-tertiary">
                lock
              </span>
              Portail Sécurisé CNDP Maroc
            </span>
            <span className="h-3 w-px bg-outline-variant/40" />
            <span className="px-space-xs py-0.5 rounded bg-surface-variant text-primary font-bold">
              Tarif: {selectedTariff.priceLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-lg lg:py-space-xl">
        {/* Hero Strip */}
        <div className="relative overflow-hidden rounded-xl bg-primary p-space-md lg:p-space-lg text-on-primary shadow-md mb-space-lg">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-surface-tint/20 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
            <div className="space-y-space-xs max-w-3xl">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="px-space-sm py-0.5 rounded-full bg-surface-container-lowest/15 text-primary-fixed text-label-sm font-label-sm uppercase tracking-wider">
                  {event.category}
                </span>
                <span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-bold">
                  Clôture des inscriptions : 30 Septembre
                </span>
                <span className="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">
                  Indexé Scopus &amp; Springer
                </span>
              </div>
              <h1 className="font-headline-lg lg:font-headline-xl text-headline-lg lg:text-headline-xl text-white tracking-tight leading-tight">
                {event.title}
              </h1>
              <p className="font-body-md text-body-md text-primary-fixed-dim flex flex-wrap items-center gap-x-space-md gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">
                    calendar_month
                  </span>
                  {event.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">
                    location_on
                  </span>
                  {event.location}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                  {event.capacity} Chercheurs &amp; Industriels attendus
                </span>
              </p>
            </div>

            <div className="bg-primary-container p-1 rounded-lg flex items-center gap-1 self-start lg:self-center shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className={`px-space-sm py-1.5 rounded font-label-md text-label-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'form'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-primary-container hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Formulaire Actif
              </button>
              <button
                type="button"
                onClick={() => setViewMode('success')}
                className={`px-space-sm py-1.5 rounded font-label-md text-label-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'success'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-primary-container hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Aperçu Confirmation
              </button>
            </div>
          </div>
        </div>

        {/* Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* FORM COLUMN */}
          {viewMode === 'form' && (
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
              <form
                onSubmit={handleSubmit}
                className="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-sm space-y-space-xl"
              >
                {/* STEP 1 */}
                <section className="space-y-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xs text-headline-xs">
                        1
                      </span>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Informations Personnelles
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Données académiques d&apos;identification pour l&apos;émargement
                          officiel
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                      Étape 1/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="space-y-1 sm:col-span-2">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-fullname"
                      >
                        Nom Complet &amp; Titre Académique{' '}
                        <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          badge
                        </span>
                        <input
                          id="reg-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-email"
                      >
                        Email Professionnel / Universitaire{' '}
                        <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          alternate_email
                        </span>
                        <input
                          id="reg-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-phone"
                      >
                        Téléphone Mobile <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          phone_iphone
                        </span>
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-city"
                      >
                        Ville de Résidence <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          location_city
                        </span>
                        <input
                          id="reg-city"
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-country"
                      >
                        Pays <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          flag
                        </span>
                        <select
                          id="reg-country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full h-11 pl-10 pr-8 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary appearance-none"
                        >
                          <option>Royaume du Maroc</option>
                          <option>France</option>
                          <option>Sénégal</option>
                          <option>Tunisie</option>
                          <option>Canada</option>
                          <option>Émirats Arabes Unis</option>
                          <option>Autre délégation internationale</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] pointer-events-none text-outline">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* STEP 2 */}
                <section className="space-y-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xs text-headline-xs">
                        2
                      </span>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Affiliation &amp; Statut Académique
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Rattachement institutionnel pour la délivrance des actes du
                          congrès
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                      Étape 2/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-inst"
                      >
                        Université / Entreprise <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          account_balance
                        </span>
                        <input
                          id="reg-inst"
                          type="text"
                          required
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="reg-lab"
                      >
                        Laboratoire / Équipe de Recherche
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">
                          biotech
                        </span>
                        <input
                          id="reg-lab"
                          type="text"
                          value={laboratory}
                          onChange={(e) => setLaboratory(e.target.value)}
                          className="w-full h-11 pl-10 pr-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface mb-2">
                        Statut du Participant <span className="text-error">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                        {[
                          { val: 'enseignant', label: 'Enseignant-Chercheur' },
                          { val: 'doctorant', label: 'Doctorant / Post-Doc' },
                          { val: 'master', label: 'Étudiant Master / Ingénieur' },
                          { val: 'rd', label: 'Ingénieur R&D Privé' },
                          { val: 'industriel', label: 'Industriel / Partenaire Tech' },
                          { val: 'membre_msrasi', label: 'Membre Actif MSRASI' },
                        ].map((item) => (
                          <label
                            key={item.val}
                            className={`flex items-center gap-space-sm p-3 rounded-lg cursor-pointer transition-all ${
                              academicStatus === item.val
                                ? 'bg-surface-container ring-1 ring-primary'
                                : 'bg-surface-bright hover:bg-surface-container'
                            }`}
                          >
                            <input
                              type="radio"
                              name="academicStatus"
                              value={item.val}
                              checked={academicStatus === item.val}
                              onChange={() => setAcademicStatus(item.val)}
                              className="w-4 h-4 text-primary"
                            />
                            <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* STEP 3 */}
                <section className="space-y-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xs text-headline-xs">
                        3
                      </span>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Modalité de Participation &amp; Travaux
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Présence physique au campus ou suivi distant en streaming
                          académique
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                      Étape 3/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <button
                      type="button"
                      onClick={() => setModality('onsite')}
                      className={`text-left p-space-md rounded-xl flex flex-col justify-between cursor-pointer shadow-sm transition-all ${
                        modality === 'onsite'
                          ? 'bg-surface-container ring-2 ring-primary'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-primary text-[28px]">
                            apartment
                          </span>
                          <div>
                            <h3 className="font-headline-xs text-headline-xs text-on-surface">
                              Présentiel à {event.city}
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {event.location}
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={modality === 'onsite'}
                          readOnly
                          className="w-4 h-4 text-primary mt-1"
                        />
                      </div>
                      <div className="mt-space-sm pt-space-xs flex flex-wrap gap-1">
                        {['Badges nominatifs', 'Déjeuners inclus', 'Accès ateliers'].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[11px] rounded bg-surface-container-lowest text-on-surface"
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModality('online')}
                      className={`text-left p-space-md rounded-xl flex flex-col justify-between cursor-pointer shadow-sm transition-all ${
                        modality === 'online'
                          ? 'bg-surface-container ring-2 ring-primary'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-space-sm">
                          <span className="material-symbols-outlined text-secondary text-[28px]">
                            cast_for_education
                          </span>
                          <div>
                            <h3 className="font-headline-xs text-headline-xs text-on-surface">
                              En Ligne / Hybride
                            </h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Plateforme interactive MSRASI Live Streaming
                            </p>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={modality === 'online'}
                          readOnly
                          className="w-4 h-4 text-primary mt-1"
                        />
                      </div>
                      <div className="mt-space-sm pt-space-xs flex flex-wrap gap-1">
                        {['Replay 90 jours', 'Chat Q&R en direct', 'E-Attestation'].map(
                          (tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[11px] rounded bg-surface-container-lowest text-on-surface"
                            >
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Role */}
                  <div className="space-y-space-xs">
                    <label className="block font-label-md text-label-md text-on-surface">
                      Rôle dans la conférence <span className="text-error">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                      {[
                        {
                          val: 'auditeur' as const,
                          title: 'Auditeur Libre',
                          sub: 'Accès plénières & sessions',
                        },
                        {
                          val: 'auteur_oral' as const,
                          title: 'Communicant Oral',
                          sub: 'Présentation en session parallèle',
                        },
                        {
                          val: 'auteur_poster' as const,
                          title: 'Poster Scientifique',
                          sub: 'Exposition hall & e-poster',
                        },
                      ].map((r) => (
                        <label
                          key={r.val}
                          className={`p-3 rounded-lg flex items-center gap-space-sm cursor-pointer transition-all ${
                            participationRole === r.val
                              ? 'bg-surface-container ring-1 ring-primary'
                              : 'bg-surface-bright hover:bg-surface-container'
                          }`}
                        >
                          <input
                            type="radio"
                            name="participationRole"
                            checked={participationRole === r.val}
                            onChange={() => setParticipationRole(r.val)}
                            className="w-4 h-4 text-primary"
                          />
                          <div>
                            <span className="block font-label-md text-label-md text-on-surface font-bold">
                              {r.title}
                            </span>
                            <span className="text-[12px] text-on-surface-variant">
                              {r.sub}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {participationRole !== 'auditeur' && (
                    <div className="p-space-md rounded-lg bg-surface-container-low space-y-space-sm">
                      <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
                        <span className="material-symbols-outlined text-[18px]">
                          article
                        </span>
                        Détails de la communication acceptée
                      </div>
                      <div className="space-y-1">
                        <label
                          className="block font-label-md text-label-md text-on-surface"
                          htmlFor="paperTitle"
                        >
                          Titre de la Communication / Article{' '}
                          <span className="text-error">*</span>
                        </label>
                        <input
                          id="paperTitle"
                          type="text"
                          required
                          value={paperTitle}
                          onChange={(e) => setPaperTitle(e.target.value)}
                          className="w-full h-11 px-3 rounded bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-1">
                        <div className="space-y-1">
                          <label
                            className="block font-label-md text-label-md text-on-surface"
                            htmlFor="trackId"
                          >
                            Axe Thématique
                          </label>
                          <select
                            id="trackId"
                            value={track}
                            onChange={(e) => setTrack(e.target.value)}
                            className="w-full h-11 px-3 rounded bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                          >
                            <option>
                              Axe 1: IA, Modélisation &amp; Vision Artificielle
                            </option>
                            <option>
                              Axe 2: Énergies Vertes, Climat &amp; Stress Hydrique
                            </option>
                            <option>
                              Axe 3: Génie Biomédical &amp; Biotechnologies
                            </option>
                            <option>
                              Axe 4: Matériaux Avancés &amp; Nanotechnologies
                            </option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label
                            className="block font-label-md text-label-md text-on-surface"
                            htmlFor="cmtCode"
                          >
                            Numéro de Soumission (CMT / EasyChair)
                          </label>
                          <input
                            id="cmtCode"
                            type="text"
                            value={submissionCode}
                            onChange={(e) => setSubmissionCode(e.target.value)}
                            className="w-full h-11 px-3 rounded bg-surface-container-lowest font-code-citation text-code-citation text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* STEP 4 */}
                <section className="space-y-space-md">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xs text-headline-xs">
                        4
                      </span>
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Logistique &amp; Consentement Légal
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Organisation sur site et conformité loi marocaine 09-08 (CNDP)
                        </p>
                      </div>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                      Étape 4/4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="diet"
                      >
                        Régime Alimentaire (Déjeuners Officiels)
                      </label>
                      <select
                        id="diet"
                        value={dietaryPreference}
                        onChange={(e) => setDietaryPreference(e.target.value)}
                        className="w-full h-11 px-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option>
                          Standard (Gastronomie Marocaine &amp; Internationale)
                        </option>
                        <option>Végétarien / Sans Viande</option>
                        <option>Régime Sans Gluten</option>
                        <option>Non applicable (Participation en ligne)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="block font-label-md text-label-md text-on-surface"
                        htmlFor="certificate"
                      >
                        Attestation Spécifique Demandée
                      </label>
                      <select
                        id="certificate"
                        value={certificateType}
                        onChange={(e) => setCertificateType(e.target.value)}
                        className="w-full h-11 px-3 rounded bg-surface-bright text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option>
                          Attestation de Présentation Orale &amp; Participation
                        </option>
                        <option>Attestation de Participation Simple (Auditeur)</option>
                        <option>Certificat de Prise en Charge Ordre de Mission</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-space-sm pt-space-xs">
                    <label className="flex items-start gap-space-sm p-3 rounded-lg bg-surface-bright cursor-pointer hover:bg-surface-container transition-all">
                      <input
                        type="checkbox"
                        checked={consentCNDP}
                        onChange={(e) => setConsentCNDP(e.target.checked)}
                        required
                        className="mt-1 w-4 h-4 rounded text-primary"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-snug">
                        Je certifie l&apos;exactitude des informations fournies et
                        j&apos;accepte que les données soient traitées par le secrétariat
                        général de la <strong>MSRASI</strong> conformément à la loi
                        marocaine n° 09-08 (CNDP).
                      </span>
                    </label>
                    <label className="flex items-start gap-space-sm p-3 rounded-lg bg-surface-bright cursor-pointer hover:bg-surface-container transition-all">
                      <input
                        type="checkbox"
                        checked={consentMedia}
                        onChange={(e) => setConsentMedia(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-primary"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface leading-snug">
                        J&apos;autorise la prise de vues photographiques et
                        l&apos;enregistrement vidéo lors des plénières pour les actes et
                        publications de l&apos;association.
                      </span>
                    </label>
                  </div>
                </section>

                {/* Submit CTA */}
                <div className="pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm font-label-sm">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      info
                    </span>
                    <span>
                      Tarif appliqué : <strong>{selectedTariff.title}</strong> (
                      {selectedTariff.priceLabel})
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-space-xl py-3 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-bold shadow-md transition-all flex items-center justify-center gap-space-sm cursor-pointer disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      how_to_reg
                    </span>
                    <span>
                      {submitting
                        ? 'Enregistrement...'
                        : 'Confirmer et valider mon inscription'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Keynote Context Card */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col md:flex-row gap-space-md items-center">
                <SafeImage
                  src={HOTLINK_IMAGES.cisaAmphitheater}
                  fallback={LOCAL_FALLBACK_IMAGES.conference}
                  alt="Session Plénière Inaugurale"
                  className="w-full md:w-56 h-40 object-cover rounded-lg shadow-inner shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-tertiary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px]">
                      podium
                    </span>
                    Session Plénière Inaugurale
                  </div>
                  <h4 className="font-headline-xs text-headline-xs text-on-surface">
                    &quot;IA &amp; Biotechnologies : Catalyseurs du Nouveau Modèle de
                    Développement&quot;
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                    Conférence d&apos;ouverture prononcée au Grand Amphithéâtre en
                    présence des délégations ministérielles et du Conseil Scientifique
                    MSRASI.
                  </p>
                  <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-semibold pt-1">
                    Accès garanti pour tous les inscrits validés
                    <span className="material-symbols-outlined text-[14px]">
                      chevron_right
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMATION COLUMN */}
          <div
            className={`${
              viewMode === 'success' ? 'lg:col-span-12 max-w-3xl mx-auto w-full' : 'lg:col-span-5 xl:col-span-4'
            } flex flex-col gap-space-lg`}
          >
            <div className="bg-surface-container-lowest rounded-xl p-space-md lg:p-space-lg shadow-md">
              <div className="flex items-start gap-space-sm pb-space-md">
                <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                    <span className="material-symbols-outlined text-[20px] font-bold">
                      check
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-label-sm font-label-sm font-bold uppercase tracking-wider">
                      État : {confirmedRecord ? 'Enregistré' : 'Aperçu Validé'}
                    </span>
                    <span className="text-on-surface-variant text-[12px] font-code-citation">
                      Ref: Auto-Générée
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">
                    {confirmedRecord
                      ? 'Inscription confirmée avec succès !'
                      : 'Votre pass & badge d’accréditation'}
                  </h3>
                </div>
              </div>

              <div className="p-space-md rounded-lg bg-surface-container-low space-y-space-xs mb-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Numéro d&apos;enregistrement
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified_user
                  </span>
                </div>
                <div className="font-headline-xs text-headline-xs text-primary font-mono font-bold tracking-wide">
                  {displayRef}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant pt-1 leading-relaxed">
                  Votre inscription à <strong>{event.code}</strong> est liée à ce numéro
                  de référence. Utilisez le QR-Code ci-dessous aux bornes d&apos;émargement.
                </p>
              </div>

              <div className="space-y-space-sm mb-space-md font-body-sm text-body-sm">
                <div className="flex items-center justify-between py-1 bg-surface-bright px-3 rounded">
                  <span className="text-on-surface-variant">Participant</span>
                  <span className="font-semibold text-on-surface">{displayName}</span>
                </div>
                <div className="flex items-center justify-between py-1 bg-surface-bright px-3 rounded">
                  <span className="text-on-surface-variant">Statut Académique</span>
                  <span className="font-semibold text-on-surface">
                    {displayRoleLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 bg-surface-bright px-3 rounded">
                  <span className="text-on-surface-variant">Modalité</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-secondary">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    {displayModality === 'onsite'
                      ? `Présentiel (${event.city})`
                      : 'Distanciel (Webinaire HD)'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 bg-surface-bright px-3 rounded">
                  <span className="text-on-surface-variant">Lieu</span>
                  <span className="font-semibold text-on-surface truncate max-w-[200px]">
                    {event.location}
                  </span>
                </div>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container flex items-center gap-space-md mb-space-md">
                <div className="w-16 h-16 bg-white p-1 rounded shadow-inner flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v2h-4v-2zm2-2h2v2h-2v-2zm-4-4h2v2h-2v-2zm6 0h2v2h-2v-2zM6 6h2v2H6V6zm12 0h2v2h-2V6zm-12 12h2v2H6v-2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold">
                    Badge E-Accès Rapide
                  </span>
                  <p className="text-[12px] text-on-surface-variant">
                    Présentez ce QR Code lors de l&apos;enregistrement aux bornes du Hall
                    Central.
                  </p>
                </div>
              </div>

              <div className="space-y-space-xs">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(true)}
                  className="w-full py-2.5 px-space-md rounded bg-primary hover:bg-secondary text-on-primary font-label-md text-label-md font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download_for_offline
                  </span>
                  Aperçu &amp; Téléchargement Badge d&apos;accès
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadIcsForEvent(event);
                      showToast('Invitation calendrier (.ics) téléchargée.');
                    }}
                    className="py-2 px-space-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      calendar_add_on
                    </span>
                    Ajouter Agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('evenements')}
                    className="py-2 px-space-xs rounded bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      arrow_back
                    </span>
                    Nos Événements
                  </button>
                </div>
              </div>

              <div className="pt-space-md mt-space-md flex items-center justify-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  support_agent
                </span>
                Besoin d&apos;assistance ?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="text-primary underline ml-1 cursor-pointer"
                >
                  secretariat@msrasi.ma
                </button>
              </div>
            </div>

            {viewMode === 'form' && (
              <>
                <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-xs text-headline-xs text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        pin_drop
                      </span>
                      Lieu de Tenue du Congrès
                    </h4>
                    <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded">
                      {event.city}, Maroc
                    </span>
                  </div>
                  <div className="w-full h-44 rounded-lg shadow-inner relative overflow-hidden">
                    <SafeImage
                      src={HOTLINK_IMAGES.rabatMap}
                      fallback={LOCAL_FALLBACK_IMAGES.conference}
                      alt={event.location}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-3">
                      <p className="text-white text-body-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary-container">
                          navigation
                        </span>
                        {event.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container text-on-surface flex items-start gap-space-sm shadow-sm">
                  <span className="material-symbols-outlined text-primary text-[28px] shrink-0">
                    verified
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-headline-xs text-headline-xs">
                      Label d&apos;Excellence MSRASI
                    </h5>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Les communications orales présentées feront l&apos;objet d&apos;une
                      sélection par les pairs pour publication dans le{' '}
                      <em>
                        Journal Marocain des Sciences Appliquées &amp; Technologies
                      </em>
                      .
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Printable/Downloadable Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-primary text-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-primary-fixed uppercase tracking-widest">
                  Badge Officiel MSRASI
                </span>
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h3 className="font-headline-sm text-white mt-2">{event.title}</h3>
              <p className="text-xs text-primary-fixed-dim mt-1">
                {event.dateLabel} • {event.location}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-outline">
                  Participant Accrédité
                </span>
                <div className="font-headline-md text-on-surface font-bold">
                  {displayName}
                </div>
                <div className="text-sm text-on-surface-variant">{institution}</div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase text-outline font-bold">
                    Référence
                  </span>
                  <div className="font-mono font-bold text-primary">{displayRef}</div>
                  <div className="text-xs text-secondary font-semibold mt-1">
                    {displayModality === 'onsite' ? 'Accès Présentiel' : 'Accès Distanciel'}
                  </div>
                </div>
                <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v2h-4v-2zm2-2h2v2h-2v-2zm-4-4h2v2h-2v-2zm6 0h2v2h-2v-2zM6 6h2v2H6V6zm12 0h2v2h-2V6zm-12 12h2v2H6v-2z" />
                </svg>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBadgeHtml}
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-secondary text-white font-label-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Télécharger le Badge
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-lg bg-surface-container text-primary font-label-md hover:bg-surface-container-high cursor-pointer"
                >
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
