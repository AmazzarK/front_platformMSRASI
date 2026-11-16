import React, { useState } from 'react';
import { MsrasiLogo } from './MsrasiLogo';
import type { RoutePath } from '../types/msrasi';

interface AdminLayoutProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  adminDisplayName: string;
  adminEmail: string;
  isFirebaseVerified: boolean;
  onSignOut: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  adminDisplayName,
  adminEmail,
  isFirebaseVerified,
  onSignOut,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks: Array<{
    label: string;
    icon: string;
    route: RoutePath;
    matches: RoutePath[];
  }> = [
    {
      label: 'Vue Globale',
      icon: 'dashboard',
      route: 'admin-dashboard',
      matches: ['admin-dashboard'],
    },
    {
      label: 'Colloques & Événements',
      icon: 'event',
      route: 'admin-events',
      matches: ['admin-events', 'admin-event-wizard', 'admin-event-preview'],
    },
    {
      label: 'Actualités & Publications',
      icon: 'menu_book',
      route: 'admin-news',
      matches: ['admin-news'],
    },
    {
      label: 'Membres & Inscriptions',
      icon: 'groups',
      route: 'admin-members',
      matches: ['admin-members'],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar (288px / w-72) */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between p-space-md transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-space-lg">
          <div className="flex items-center justify-between px-space-xs">
            <button
              type="button"
              onClick={() => onNavigate('admin-dashboard')}
              className="flex items-center gap-space-sm text-left cursor-pointer"
            >
              <MsrasiLogo variant="dark" compact />
              <div className="flex flex-col">
                <span className="font-headline-xs text-headline-xs font-bold text-white">
                  Portail Scientifique
                </span>
                <span className="font-label-sm text-label-sm text-tertiary-fixed">
                  Console Administrative
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-outline-variant hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const active = item.matches.includes(currentRoute);
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    onNavigate(item.route);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-space-sm px-space-sm py-2.5 rounded text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary-container text-on-primary font-semibold border-l-[3px] border-[#F58200]'
                      : 'text-outline-variant hover:bg-surface-container/10 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="text-body-sm font-medium">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  onNavigate('admin-event-wizard');
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-space-sm px-space-sm py-2.5 rounded text-tertiary-fixed hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span className="text-body-sm font-semibold">
                  Nouveau Modèle Événement
                </span>
              </button>
            </div>
          </nav>
        </div>

        <div className="p-space-sm rounded bg-surface-container/10 space-y-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                person
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-body-sm text-body-sm text-white font-medium leading-tight truncate">
                {adminDisplayName}
              </span>
              <span className="font-label-sm text-label-sm text-outline-variant truncate">
                {adminEmail || 'Comité Scientifique'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs">
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="inline-flex items-center gap-space-xs text-label-sm text-tertiary-fixed hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Portail public
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1 text-label-sm text-outline-variant hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Quitter
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 min-w-0">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded bg-surface-container text-primary cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <MsrasiLogo variant="light" compact />
            <span className="font-headline-xs text-headline-xs text-primary font-bold">
              MSRASI Administration
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full font-label-sm text-label-sm ${
                isFirebaseVerified
                  ? 'bg-[#E6F5EE] text-[#087A4B]'
                  : 'bg-surface-container-high text-primary'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFirebaseVerified ? 'bg-[#087A4B]' : 'bg-secondary'
                }`}
              />
              {isFirebaseVerified
                ? 'Firebase Cloud Synchronisé'
                : 'Session Administrative Locale'}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('accueil')}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">public</span>
              Voir le site
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </header>

        <main className="relative pt-16 w-full min-h-screen bg-background px-gutter-mobile lg:px-gutter py-space-lg">
          {children}
        </main>
      </div>
    </div>
  );
};
