import React, { useState } from 'react';
import { MsrasiLogo } from './MsrasiLogo';
import type { RoutePath } from '../types/msrasi';

interface PublicLayoutProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  lang: 'FR' | 'AR' | 'EN';
  onChangeLang: (lang: 'FR' | 'AR' | 'EN') => void;
  isAdminLoggedIn: boolean;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentRoute,
  onNavigate,
  lang,
  onChangeLang,
  isAdminLoggedIn,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ label: string; route: RoutePath }> = [
    { label: 'Accueil', route: 'accueil' },
    { label: 'À propos', route: 'a-propos' },
    { label: 'Nos activités', route: 'nos-activites' },
    { label: 'Événements', route: 'evenements' },
    { label: 'Actualités', route: 'actualites' },
    { label: 'Contact', route: 'contact' },
  ];

  const isRouteActive = (route: RoutePath) => {
    if (route === 'evenements') {
      return (
        currentRoute === 'evenements' ||
        currentRoute === 'evenement-detail' ||
        currentRoute === 'inscription'
      );
    }
    return currentRoute === route;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <header className="fixed top-0 left-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {/* Tier 1: Institutional Utility Bar */}
        <div className="bg-inverse-surface text-inverse-on-surface text-label-sm font-label-sm">
          <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop h-9 flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim">
                  verified
                </span>
                Royaume du Maroc — Recherche &amp; Innovation
              </span>
              <span className="hidden md:inline-flex items-center gap-space-xs text-outline-variant">
                <span className="material-symbols-outlined text-[14px]">mail</span>
                contact@msrasi.ma
              </span>
            </div>

            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                {(['FR', 'AR', 'EN'] as const).map((code, index) => (
                  <React.Fragment key={code}>
                    {index > 0 && <span className="text-outline">|</span>}
                    <button
                      type="button"
                      onClick={() => onChangeLang(code)}
                      className={`px-space-xs py-0.5 rounded transition-colors cursor-pointer ${
                        lang === code
                          ? 'text-inverse-on-surface font-bold underline underline-offset-2'
                          : 'text-outline-variant hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <span className="text-outline hidden sm:inline">|</span>
              <button
                type="button"
                onClick={() =>
                  onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')
                }
                className="hidden sm:flex items-center gap-space-xs text-outline-variant hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Espace Membre / Admin
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Main Navigation Bar */}
        <div className="bg-surface/95 backdrop-blur-md">
          <div className="h-20 w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between gap-space-md">
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="text-left cursor-pointer"
            >
              <MsrasiLogo variant="light" />
            </button>

            <nav className="hidden xl:flex items-center gap-space-lg">
              {navItems.map((item) => {
                const active = isRouteActive(item.route);
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => onNavigate(item.route)}
                    className={`font-body-sm text-body-sm transition-colors py-2 cursor-pointer ${
                      active
                        ? 'text-primary font-semibold border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-space-md">
              <button
                type="button"
                onClick={() => onNavigate('nous-rejoindre')}
                className="relative inline-flex items-center justify-center px-space-md py-2.5 rounded bg-primary-container text-on-primary font-label-md text-label-md hover:bg-secondary transition-all shadow-[0_1px_3px_rgba(16,36,59,0.08)] cursor-pointer"
              >
                <span className="flex items-center gap-space-xs">Nous rejoindre</span>
                <span className="absolute -top-2 -right-2 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-surface-container-lowest">
                  POLE
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')
                }
                title="Accéder au Portail d'Administration"
                className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="xl:hidden p-2 rounded-lg bg-surface-container text-primary cursor-pointer"
                aria-label="Menu navigation"
              >
                <span className="material-symbols-outlined text-[22px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="xl:hidden bg-surface-container-lowest border-t border-surface-container px-gutter-mobile py-4 space-y-2 shadow-lg">
              {navItems.map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    onNavigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg font-label-md transition-colors ${
                    isRouteActive(item.route)
                      ? 'bg-primary-fixed text-primary font-bold'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-surface-container text-primary font-label-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Espace Membre / Admin
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="w-full pt-[116px] flex-1 bg-background">{children}</main>

      {/* 5-Column Institutional Footer */}
      <footer className="w-full bg-inverse-surface text-inverse-on-surface mt-auto">
        <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop pt-space-xl pb-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter mb-space-xl">
            <div className="lg:col-span-2 space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-[28px]">
                  star
                </span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm font-bold text-white">
                    MSRASI
                  </span>
                  <span className="font-label-sm text-label-sm text-outline-variant uppercase tracking-wider">
                    Royaume du Maroc
                  </span>
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-outline-variant pr-space-lg">
                Association Marocaine pour la Recherche en Sciences Appliquées et
                l&apos;Innovation. Fédérer les chercheurs, valoriser le capital scientifique
                national et catalyser l&apos;innovation technologique à impact
                socio-économique.
              </p>
              <div className="flex items-center gap-space-sm">
                <span className="px-space-sm py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-tertiary-fixed">
                  Édition Académique
                </span>
                <span className="px-space-sm py-1 rounded bg-surface-container/10 font-label-sm text-label-sm text-secondary-fixed">
                  Pôles Régionaux
                </span>
              </div>
            </div>

            <div className="space-y-space-sm">
              <h4 className="font-headline-xs text-headline-xs text-white">Navigation</h4>
              <ul className="space-y-space-xs font-body-sm text-body-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('accueil')}
                    className="text-outline-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('a-propos')}
                    className="text-outline-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Mission &amp; Conseil Scientifique
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('nos-activites')}
                    className="text-outline-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Programmes de Recherche
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('evenements')}
                    className="text-outline-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Symposiums &amp; Congrès
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('actualites')}
                    className="text-outline-variant hover:text-white transition-colors cursor-pointer"
                  >
                    Publications &amp; Revues
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-space-sm">
              <h4 className="font-headline-xs text-headline-xs text-white">
                Pôles d&apos;Excellence
              </h4>
              <ul className="space-y-space-xs font-body-sm text-body-sm text-outline-variant">
                <li>Intelligence Artificielle &amp; Data</li>
                <li>Énergies Renouvelables &amp; Eau</li>
                <li>Biotechnologies Médicales</li>
                <li>Génie des Matériaux Avancés</li>
                <li>Économie Circulaire &amp; Climat</li>
              </ul>
            </div>

            <div className="space-y-space-sm">
              <h4 className="font-headline-xs text-headline-xs text-white">
                Contact &amp; Siège
              </h4>
              <div className="space-y-space-xs font-body-sm text-body-sm text-outline-variant">
                <p className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed mt-1">
                    location_on
                  </span>
                  <span>
                    Campus Universitaire Al Irfane, Rabat &amp; Casablanca Technopark, Maroc
                  </span>
                </p>
                <p className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                    mail
                  </span>
                  <span>secretariat@msrasi.ma</span>
                </p>
                <p className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">
                    call
                  </span>
                  <span>+212 (0) 537 00 00 00</span>
                </p>
              </div>
              <div className="pt-space-sm">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')
                  }
                  className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary-fixed-dim hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    admin_panel_settings
                  </span>
                  Portail d&apos;Administration
                </button>
              </div>
            </div>
          </div>

          <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-md text-label-sm font-label-sm text-outline border-t border-white/10">
            <p>
              © 2025 MSRASI - Association Marocaine pour la Recherche en Sciences
              Appliquées et l&apos;Innovation. Tous droits réservés.
            </p>
            <div className="flex items-center gap-space-md">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Mentions légales
              </button>
              <button
                type="button"
                onClick={() => onNavigate('a-propos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Politique scientifique &amp; Éthique
              </button>
              <button
                type="button"
                onClick={() => onNavigate('actualites')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Charte de publication
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
