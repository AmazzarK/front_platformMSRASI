import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, PRIMARY_ADMIN_EMAIL } from '../../firebase';
import { seedInitialFirestoreDataIfEmpty } from '../../services/msrasiService';
import { MsrasiLogo } from '../../components/MsrasiLogo';
import { useToast } from '../../components/ToastContext';
import type { RoutePath } from '../../types/msrasi';

interface AdminLoginPageProps {
  onNavigate: (route: RoutePath) => void;
  onFirebaseAdminAuthenticated: (displayName: string, email: string) => void;
  onDemoAdminLogin: (email: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onFirebaseAdminAuthenticated,
  onDemoAdminLogin,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('coordination@msrasi.ma');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorBanner(null);
    setIsLoadingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user.email !== PRIMARY_ADMIN_EMAIL) {
        await signOut(auth);
        setErrorBanner(
          `Compte non autorisé (${user.email || 'inconnu'}). L'accès Cloud est réservé à l'administrateur principal (${PRIMARY_ADMIN_EMAIL}). Vous pouvez utiliser le mode Démonstration Locale ci-dessous.`
        );
        return;
      }
      await seedInitialFirestoreDataIfEmpty();
      showToast('Authentification Firebase Admin vérifiée.', 'success');
      onFirebaseAdminAuthenticated(
        user.displayName || 'Dr. Responsable MSRASI',
        user.email || PRIMARY_ADMIN_EMAIL
      );
      onNavigate('admin-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de connexion Google';
      if (message.includes('popup-closed-by-user')) {
        setErrorBanner('Fenêtre de connexion fermée avant validation.');
      } else {
        setErrorBanner(
          'Connexion Google indisponible dans ce contexte ou annulée. Utilisez le portail local ci-dessous pour explorer la console.'
        );
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handlePortalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    const trimmed = email.trim();
    if (!trimmed || !password.trim()) {
      setErrorBanner('Veuillez renseigner votre identifiant institutionnel et mot de passe.');
      return;
    }
    showToast('Session administrative locale ouverte.', 'success');
    onDemoAdminLogin(trimmed);
    onNavigate('admin-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#0d1c30] relative overflow-hidden flex flex-col justify-between px-4 py-8">
      {/* Subtle Constellation Vector Lattice Backdrop */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-55">
        <svg className="w-[820px] h-[820px] text-[#c4c6d4]" fill="none" viewBox="0 0 800 800">
          <circle
            cx="400"
            cy="400"
            r="260"
            stroke="currentColor"
            strokeDasharray="6 8"
            strokeWidth="1"
          />
          <circle
            cx="400"
            cy="400"
            r="350"
            stroke="currentColor"
            strokeDasharray="4 10"
            strokeWidth="0.9"
          />
          <ellipse
            cx="400"
            cy="400"
            rx="390"
            ry="170"
            transform="rotate(-28 400 400)"
            stroke="currentColor"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
          <ellipse
            cx="400"
            cy="400"
            rx="390"
            ry="170"
            transform="rotate(28 400 400)"
            stroke="currentColor"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
          <circle cx="140" cy="400" r="4" fill="#9fb2d8" />
          <circle cx="660" cy="400" r="4" fill="#9fb2d8" />
          <circle cx="400" cy="140" r="4" fill="#9fb2d8" />
        </svg>
      </div>

      <div className="relative z-10 max-w-md w-full mx-auto my-auto space-y-4">
        {/* Top Utility Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onNavigate('accueil')}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#115cba] hover:text-[#003082] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">arrow_back</span>
            Retour au site public MSRASI
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7eeff] text-[#003082] font-bold text-[10px] tracking-[0.06em] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#115cba]" />
            SERVEUR INSTITUTIONNEL
          </span>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-2xl shadow-[0_18px_48px_rgba(13,28,48,0.08)] overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#003082] via-[#115cba] to-[#b56300]" />

          <div className="p-7 sm:p-9 space-y-6">
            {/* Logo & Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <MsrasiLogo variant="light" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f3ff] text-[#003082] text-[10px] font-bold tracking-[0.06em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F58200]" />
                PORTAIL DE GESTION ADMINISTRATIVE &amp; SCIENTIFIQUE
              </div>
              <div className="space-y-1">
                <h1 className="font-headline-md text-[24px] font-extrabold text-[#0d1c30] tracking-tight">
                  Espace d&apos;Administration MSRASI
                </h1>
                <p className="text-[13px] text-[#434652] leading-relaxed max-w-xs mx-auto">
                  Bienvenue dans votre espace sécurisé de gestion des événements scientifiques,
                  inscriptions et publications.
                </p>
              </div>
            </div>

            {errorBanner && (
              <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12px] leading-relaxed flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Firebase Google Auth Primary Action */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoadingGoogle}
                className="w-full py-2.5 px-4 rounded-lg border border-[#c4c6d4] bg-[#f9f9ff] hover:bg-[#e7eeff] text-[#0d1c30] font-semibold text-[13px] flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px] text-[#003082]">
                  verified_user
                </span>
                {isLoadingGoogle
                  ? 'Connexion Google en cours...'
                  : 'Connexion Google Administrateur (Cloud)'}
              </button>
              <div className="flex items-center gap-3 text-[11px] text-[#747684] uppercase tracking-wider">
                <span className="flex-1 h-px bg-[#e7eeff]" />
                <span>ou accès portail coordination</span>
                <span className="flex-1 h-px bg-[#e7eeff]" />
              </div>
            </div>

            {/* Institutional Credentials Form */}
            <form onSubmit={handlePortalFormSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#0d1c30]">
                    Identifiant ou email professionnel
                  </label>
                  <span className="text-[11px] text-[#747684]">Domaine @msrasi.ma</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434652] text-[18px]">
                    badge
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coordination@msrasi.ma"
                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-[#e7eeff] text-[#0d1c30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#0d1c30]">Mot de passe</label>
                  <button
                    type="button"
                    onClick={() =>
                      setInfoModal(
                        'Pour réinitialiser vos accès institutionnels MSRASI, veuillez contacter la DSI à support-dsi@msrasi.ma ou utiliser votre compte Google administrateur autorisé.'
                      )
                    }
                    className="text-[12px] font-medium text-[#115cba] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434652] text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-lg bg-[#e7eeff] text-[#0d1c30] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#115cba]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#434652] hover:text-[#003082] cursor-pointer"
                    aria-label="Afficher ou masquer le mot de passe"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-[12px] text-[#434652] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#003082]"
                  />
                  <span>Se souvenir de ma session (30 j)</span>
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f0f3ff] text-[#434652] text-[11px] font-medium">
                  <span className="material-symbols-outlined text-[13px] text-[#003082]">
                    shield
                  </span>
                  TLS 1.3
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#003082] hover:bg-[#1646a8] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <span>Se connecter au portail</span>
                <span className="material-symbols-outlined text-[18px]">login</span>
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-[#f0f3ff] px-7 py-4 space-y-2.5">
            <div className="flex items-start gap-2 text-[12px] text-[#434652] leading-snug">
              <span className="material-symbols-outlined text-[16px] text-[#003082] shrink-0 mt-0.5">
                verified_user
              </span>
              <p>
                Accès strictement réservé aux membres du bureau exécutif et administrateurs
                autorisés de la <strong className="text-[#0d1c30]">MSRASI</strong>.
              </p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#747684] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#13804e]" />
                Chiffrement certifié SSL 256-bit
              </span>
              <span>Conforme CNDP Maroc • Loi 09-08</span>
            </div>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-center gap-3 text-[12px] text-[#434652]">
            <button
              type="button"
              onClick={() =>
                setInfoModal(
                  'Assistance Informatique MSRASI : Disponible du lundi au vendredi (08h30 - 18h00) au +212 5 37 77 12 34.'
                )
              }
              className="hover:text-[#003082] cursor-pointer"
            >
              Assistance Informatique
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() =>
                setInfoModal(
                  'Protocole de Sécurité : Accès chiffré TLS 1.3, authentification Firebase OAuth & audit des opérations administratives conforme à la Loi 09-08.'
                )
              }
              className="hover:text-[#003082] cursor-pointer"
            >
              Protocole de Sécurité
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="hover:text-[#003082] cursor-pointer"
            >
              Contact DSI
            </button>
          </div>
          <p className="text-[10px] tracking-[0.06em] uppercase text-[#747684]">
            © 2025 ASSOCIATION MAROCAINE DE LA RECHERCHE APPLIQUÉE &amp; DE L&apos;INNOVATION
            (MSRASI). TOUS DROITS RÉSERVÉS.
          </p>
        </div>
      </div>

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-xs font-bold text-[#0d1c30]">Information Sécurité DSI</h3>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="text-[#434652] hover:text-[#0d1c30] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[14px] text-[#434652] leading-relaxed">{infoModal}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 rounded-lg bg-[#003082] text-white text-[13px] font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
