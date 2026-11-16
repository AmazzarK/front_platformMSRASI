import React, { useMemo, useState } from 'react';
import { exportCsvFile, logAdminActivity } from '../../services/msrasiService';
import { useToast } from '../../components/ToastContext';
import type { EventRegistration, NewsletterSubscriber, ScientificEvent } from '../../types/msrasi';

interface AdminMembersPageProps {
  registrations: EventRegistration[];
  subscribers: NewsletterSubscriber[];
  events: ScientificEvent[];
}

export const AdminMembersPage: React.FC<AdminMembersPageProps> = ({
  registrations,
  subscribers,
  events,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'registrations' | 'subscribers'>('registrations');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [modalityFilter, setModalityFilter] = useState('all');
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, EventRegistration['status']>
  >({});
  const [badgeModalReg, setBadgeModalReg] = useState<EventRegistration | null>(null);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (eventFilter !== 'all' && reg.eventId !== eventFilter) return false;
      if (modalityFilter !== 'all' && reg.modality !== modalityFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const hay = `${reg.fullName} ${reg.email} ${reg.institution} ${reg.refCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, eventFilter, modalityFilter, searchQuery]);

  const handleExportRegistrationsCsv = async () => {
    exportCsvFile(
      'msrasi-inscriptions-participants.csv',
      ['Référence', 'Nom Complet', 'Email', 'Établissement', 'Événement', 'Modalité', 'Rôle', 'Statut'],
      filteredRegistrations.map((r) => [
        r.refCode,
        r.fullName,
        r.email,
        r.institution,
        r.eventTitle,
        r.modality === 'onsite' ? 'Présentiel' : 'Distanciel',
        r.participationRole,
        statusOverrides[r.id] || r.status,
      ])
    );
    await logAdminActivity(
      'export',
      `Export CSV de ${filteredRegistrations.length} inscriptions congressistes.`,
      'Annuaire Membres & Participants'
    );
    showToast('Annuaire des participants exporté en CSV.', 'success');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-[28px] font-bold text-[#0d1c30] tracking-tight">
            Membres, Congressistes &amp; Abonnés
          </h1>
          <p className="text-[14px] text-[#434652]">
            Consultez les inscriptions validées, générez les badges officiels et exportez les
            listes d&apos;émargement.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportRegistrationsCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[13px] shadow-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exporter CSV ({filteredRegistrations.length})
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-[#f0f3ff] p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab('registrations')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
            tab === 'registrations' ? 'bg-[#003082] text-white' : 'text-[#434652]'
          }`}
        >
          Inscriptions &amp; Participants ({registrations.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('subscribers')}
          className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
            tab === 'subscribers' ? 'bg-[#003082] text-white' : 'text-[#434652]'
          }`}
        >
          Abonnés Newsletter &amp; Alertes CFP ({subscribers.length})
        </button>
      </div>

      {tab === 'registrations' ? (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#747684] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher nom, email, établissement, référence..."
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#f0f3ff] text-[13px] focus:outline-none"
              />
            </div>
            <div className="md:col-span-4">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              >
                <option value="all">Tous les événements</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} — {e.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f0f3ff] text-[13px]"
              >
                <option value="all">Toutes modalités</option>
                <option value="onsite">Présentiel</option>
                <option value="online">Distanciel</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f3ff] text-[11px] font-bold uppercase tracking-wider text-[#747684]">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-3">Participant</th>
                    <th className="py-3 px-3">Établissement</th>
                    <th className="py-3 px-3">Événement</th>
                    <th className="py-3 px-3">Modalité &amp; Rôle</th>
                    <th className="py-3 px-3">Statut</th>
                    <th className="py-3 px-4 text-right">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7eeff] text-[13px]">
                  {filteredRegistrations.map((reg) => {
                    const currentStatus = statusOverrides[reg.id] || reg.status;
                    return (
                      <tr key={reg.id} className="hover:bg-[#f9f9ff]">
                        <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#003082] whitespace-nowrap">
                          {reg.refCode}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-[#0d1c30]">{reg.fullName}</div>
                          <div className="text-[11px] text-[#747684]">{reg.email}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-[#0d1c30]">{reg.institution}</div>
                          <div className="text-[11px] text-[#747684]">{reg.academicStatus}</div>
                        </td>
                        <td className="py-3.5 px-3 max-w-[220px]">
                          <p className="truncate font-medium text-[#0d1c30]">{reg.eventTitle}</p>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-[#e7eeff] text-[#003082] text-[11px] font-semibold">
                            {reg.modality === 'onsite' ? 'Présentiel' : 'Distanciel'}
                          </span>
                          <span className="ml-1.5 text-[11px] text-[#434652]">
                            {reg.participationRole === 'auteur_oral'
                              ? 'Auteur Oral'
                              : reg.participationRole === 'auteur_poster'
                                ? 'Poster'
                                : 'Auditeur'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={currentStatus}
                            onChange={(e) => {
                              setStatusOverrides((prev) => ({
                                ...prev,
                                [reg.id]: e.target.value as EventRegistration['status'],
                              }));
                              showToast(`Statut de ${reg.refCode} mis à jour.`, 'success');
                            }}
                            className="h-8 px-2 rounded bg-[#E6F5EE] text-[#087A4B] font-semibold text-[11px]"
                          >
                            <option value="valide">Validé</option>
                            <option value="en_attente">En attente</option>
                            <option value="annule">Annulé</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setBadgeModalReg(reg)}
                            className="px-3 py-1 rounded bg-[#f0f3ff] hover:bg-[#003082] hover:text-white text-[#003082] text-[12px] font-semibold cursor-pointer"
                          >
                            Badge PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-[#747684]">
                        Aucune inscription trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {subscribers.length === 0 ? (
            <div className="text-center py-8 text-[#747684] text-[14px]">
              Aucun abonné newsletter enregistré dans la session Cloud active pour le moment. Les
              nouvelles inscriptions depuis l&apos;accueil ou l&apos;agenda apparaîtront ici en
              temps réel.
            </div>
          ) : (
            <div className="divide-y divide-[#e7eeff]">
              {subscribers.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[14px] text-[#0d1c30]">{sub.email}</p>
                    <p className="text-[11px] text-[#747684]">Source : {sub.source || 'Portail'}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#dee9ff] text-[#003082] text-[11px] font-bold">
                    {sub.immediateCfpAlerts ? 'Alertes CFP Immédiates' : 'Lettre Mensuelle'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Badge Modal */}
      {badgeModalReg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-[#003082] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffdcc4]">
                  Badge Nominatif MSRASI
                </span>
                <h3 className="font-bold text-[16px] mt-0.5">{badgeModalReg.eventTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setBadgeModalReg(null)}
                className="cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-headline-sm text-[20px] font-bold text-[#0d1c30]">
                  {badgeModalReg.fullName}
                </p>
                <p className="text-[13px] text-[#115cba] font-medium">
                  {badgeModalReg.institution}
                </p>
                {badgeModalReg.paperTitle && (
                  <p className="text-[12px] text-[#434652] mt-2 italic">
                    Communication : « {badgeModalReg.paperTitle} »
                  </p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-[#f0f3ff] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#747684] block">
                    Code d&apos;Accès
                  </span>
                  <span className="font-mono font-bold text-[13px] text-[#003082]">
                    {badgeModalReg.refCode}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#087A4B] text-white text-[11px] font-bold">
                  ACCÈS VALIDÉ
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#003082] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Imprimer le badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
