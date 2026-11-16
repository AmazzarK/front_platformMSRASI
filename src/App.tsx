/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, PRIMARY_ADMIN_EMAIL, testConnection } from './firebase';
import {
  DEFAULT_TARIFF_TIERS,
  HOTLINK_IMAGES,
  SEED_ACTIVITY_LOGS,
  SEED_ARTICLES,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
} from './data/seedData';
import {
  seedInitialFirestoreDataIfEmpty,
  subscribeActivityLogs,
  subscribeArticles,
  subscribeEvents,
  subscribeNewsletterSubscribers,
  subscribeRegistrations,
} from './services/msrasiService';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContext';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { HomePage } from './pages/public/HomePage';
import { EventsAgendaPage } from './pages/public/EventsAgendaPage';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { EventRegistrationPage } from './pages/public/EventRegistrationPage';
import {
  AboutPage,
  ActivitiesPage,
  ContactPage,
  JoinUsPage,
  NewsPublicPage,
} from './pages/public/SecondaryPublicPages';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminEventWizardPage } from './pages/admin/AdminEventWizardPage';
import { AdminEventPreviewPage } from './pages/admin/AdminEventPreviewPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import type {
  ActivityLog,
  EventRegistration,
  NewsArticle,
  NewsletterSubscriber,
  RoutePath,
  ScientificEvent,
  TariffTier,
} from './types/msrasi';

function createFreshEventTemplate(): ScientificEvent {
  return {
    id: `evt-${Date.now()}`,
    code: `EVT-2026-${Math.floor(10 + Math.random() * 89)}`,
    title: 'Symposium Africain sur la Souveraineté Énergétique et les Nouvelles Technologies',
    shortSummary:
      "Rendez-vous scientifique réunissant laboratoires d'excellence, doctorants et partenaires industriels autour de la recherche appliquée.",
    description:
      "Grand rendez-vous panafricain réunissant les laboratoires d'excellence, les délégations ministérielles et les pionniers de la transition technologique au Maroc.",
    archetype: 'conf',
    category: 'Conférences',
    discipline: 'energie',
    format: 'hybride',
    dateLabel: '14 - 17 Mai 2026',
    startDate: '2026-05-14',
    location: 'Campus CNRST, Rabat',
    city: 'Rabat',
    capacity: 350,
    registeredCount: 0,
    status: 'brouillon',
    featured: false,
    imageUrl: HOTLINK_IMAGES.wizardCover,
    doi: '10.5842/msrasi.2026.01',
    languages: ['Français', 'Anglais', 'Arabe (العربية)'],
    tags: ['#HydrogèneVert', '#Nanomatériaux', '#SmartGrids'],
    createdBy: 'admin-wizard',
  };
}

function AppShell() {
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('accueil');
  const [lang, setLang] = useState<'FR' | 'EN' | 'AR'>('FR');

  const [isFirebaseVerified, setIsFirebaseVerified] = useState(false);
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);
  const [adminDisplayName, setAdminDisplayName] = useState('Dr. Tazi');
  const [adminEmail, setAdminEmail] = useState('coordination@msrasi.ma');

  const [events, setEvents] = useState<ScientificEvent[]>(SEED_EVENTS);
  const [articles, setArticles] = useState<NewsArticle[]>(SEED_ARTICLES);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(SEED_REGISTRATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(SEED_ACTIVITY_LOGS);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);

  const [selectedEventId, setSelectedEventId] = useState<string>(SEED_EVENTS[0].id);
  const [selectedTariff, setSelectedTariff] = useState<TariffTier>(DEFAULT_TARIFF_TIERS[1]);
  const [wizardDraft, setWizardDraft] = useState<ScientificEvent>(() =>
    createFreshEventTemplate()
  );

  const isAdminSession = isFirebaseVerified || isDemoAdmin;

  useEffect(() => {
    void testConnection();
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified && user.email === PRIMARY_ADMIN_EMAIL) {
        setIsFirebaseVerified(true);
        setAdminDisplayName(user.displayName || 'Dr. Responsable MSRASI');
        setAdminEmail(user.email || PRIMARY_ADMIN_EMAIL);
        void seedInitialFirestoreDataIfEmpty();
      } else {
        setIsFirebaseVerified(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubEvents = subscribeEvents(isAdminSession, setEvents);
    const unsubArticles = subscribeArticles(isAdminSession, setArticles);
    const unsubRegs = subscribeRegistrations(setRegistrations);
    const unsubLogs = subscribeActivityLogs(setActivityLogs);
    const unsubSubs = subscribeNewsletterSubscribers(setSubscribers);
    return () => {
      unsubEvents();
      unsubArticles();
      unsubRegs();
      unsubLogs();
      unsubSubs();
    };
  }, [isAdminSession]);

  const navigate = (route: RoutePath) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0] || SEED_EVENTS[0],
    [events, selectedEventId]
  );

  const handleOpenEventDetail = (eventId: string, targetRoute: RoutePath = 'evenement-detail') => {
    setSelectedEventId(eventId);
    navigate(targetRoute);
  };

  const handleOpenAdminEdit = (evt: ScientificEvent) => {
    setWizardDraft(evt);
    navigate('admin-event-wizard');
  };

  const handleOpenAdminPreview = (evt: ScientificEvent) => {
    setWizardDraft(evt);
    navigate('admin-event-preview');
  };

  const handleCreateNewAdminEvent = () => {
    setWizardDraft(createFreshEventTemplate());
    navigate('admin-event-wizard');
  };

  const handleSignOut = async () => {
    setIsDemoAdmin(false);
    setIsFirebaseVerified(false);
    try {
      await signOut(auth);
    } catch {
      // ignore if local demo only
    }
    navigate('accueil');
  };

  // Route guard for Admin routes
  const isAdminRoute =
    currentRoute === 'admin-dashboard' ||
    currentRoute === 'admin-events' ||
    currentRoute === 'admin-event-wizard' ||
    currentRoute === 'admin-event-preview' ||
    currentRoute === 'admin-news' ||
    currentRoute === 'admin-members';

  if (currentRoute === 'admin-login' || (isAdminRoute && !isAdminSession)) {
    return (
      <AdminLoginPage
        onNavigate={navigate}
        onFirebaseAdminAuthenticated={(name, mail) => {
          setAdminDisplayName(name);
          setAdminEmail(mail);
          setIsFirebaseVerified(true);
        }}
        onDemoAdminLogin={(mail) => {
          setAdminEmail(mail);
          setAdminDisplayName('Dr. Tazi');
          setIsDemoAdmin(true);
        }}
      />
    );
  }

  if (isAdminRoute && isAdminSession) {
    return (
      <AdminLayout
        currentRoute={currentRoute}
        onNavigate={navigate}
        adminDisplayName={adminDisplayName}
        adminEmail={adminEmail}
        isFirebaseVerified={isFirebaseVerified}
        onSignOut={handleSignOut}
      >
        {currentRoute === 'admin-dashboard' && (
          <AdminDashboardPage
            adminDisplayName={adminDisplayName}
            events={events}
            articles={articles}
            registrations={registrations}
            activityLogs={activityLogs}
            onNavigate={navigate}
            onEditEvent={handleOpenAdminEdit}
            onPreviewEvent={handleOpenAdminPreview}
          />
        )}
        {currentRoute === 'admin-events' && (
          <AdminEventsPage
            events={events}
            onNavigate={navigate}
            onCreateNewEvent={handleCreateNewAdminEvent}
            onEditEvent={handleOpenAdminEdit}
            onPreviewEvent={handleOpenAdminPreview}
          />
        )}
        {currentRoute === 'admin-event-wizard' && (
          <AdminEventWizardPage
            draftEvent={wizardDraft}
            onChangeDraft={setWizardDraft}
            onNavigate={navigate}
          />
        )}
        {currentRoute === 'admin-event-preview' && (
          <AdminEventPreviewPage
            event={wizardDraft}
            onNavigate={navigate}
            onUpdateDraft={setWizardDraft}
          />
        )}
        {currentRoute === 'admin-news' && (
          <AdminNewsPage articles={articles} events={events} onNavigate={navigate} />
        )}
        {currentRoute === 'admin-members' && (
          <AdminMembersPage
            registrations={registrations}
            subscribers={subscribers}
            events={events}
          />
        )}
      </AdminLayout>
    );
  }

  // Public Portal Routes
  return (
    <PublicLayout
      currentRoute={currentRoute}
      onNavigate={navigate}
      lang={lang}
      onChangeLang={setLang}
      isAdminLoggedIn={isAdminSession}
    >
      {currentRoute === 'accueil' && (
        <HomePage
          events={events}
          articles={articles}
          onNavigate={navigate}
          onSelectEvent={handleOpenEventDetail}
        />
      )}
      {currentRoute === 'evenements' && (
        <EventsAgendaPage
          events={events}
          onNavigate={navigate}
          onSelectEvent={handleOpenEventDetail}
        />
      )}
      {currentRoute === 'evenement-detail' && (
        <EventDetailPage
          event={selectedEvent}
          selectedTariff={selectedTariff}
          onSelectTariff={setSelectedTariff}
          onNavigate={navigate}
        />
      )}
      {currentRoute === 'inscription' && (
        <EventRegistrationPage
          event={selectedEvent}
          selectedTariff={selectedTariff}
          onNavigate={navigate}
        />
      )}
      {currentRoute === 'a-propos' && <AboutPage onNavigate={navigate} />}
      {currentRoute === 'nos-activites' && <ActivitiesPage onNavigate={navigate} />}
      {currentRoute === 'actualites' && (
        <NewsPublicPage articles={articles} onNavigate={navigate} />
      )}
      {currentRoute === 'contact' && <ContactPage onNavigate={navigate} />}
      {currentRoute === 'nous-rejoindre' && <JoinUsPage onNavigate={navigate} />}
    </PublicLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </ErrorBoundary>
  );
}
