import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { SEED_ACTIVITY_LOGS, SEED_ARTICLES, SEED_EVENTS, SEED_REGISTRATIONS } from '../data/seedData';
import { auth, db, handleFirestoreError, OperationType, PRIMARY_ADMIN_EMAIL } from '../firebase';
import type {
  ActivityLog,
  EventRegistration,
  NewsArticle,
  NewsletterSubscriber,
  ScientificEvent,
} from '../types/msrasi';

const LS_KEYS = {
  events: 'msrasi_events_v1',
  articles: 'msrasi_articles_v1',
  registrations: 'msrasi_registrations_v1',
  subscribers: 'msrasi_subscribers_v1',
  logs: 'msrasi_logs_v1',
};

export function isCurrentUserAdmin(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return Boolean(user.emailVerified && user.email === PRIMARY_ADMIN_EMAIL);
}

export function loadLocalEvents(): ScientificEvent[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.events);
    if (raw) {
      const parsed = JSON.parse(raw) as ScientificEvent[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore storage parse error
  }
  return SEED_EVENTS;
}

function emitLocalSync() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('msrasi-local-sync'));
  }
}

export function saveLocalEvents(events: ScientificEvent[]): void {
  try {
    localStorage.setItem(LS_KEYS.events, JSON.stringify(events));
    emitLocalSync();
  } catch {
    // ignore
  }
}

export function loadLocalArticles(): NewsArticle[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.articles);
    if (raw) {
      const parsed = JSON.parse(raw) as NewsArticle[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_ARTICLES;
}

export function saveLocalArticles(articles: NewsArticle[]): void {
  try {
    localStorage.setItem(LS_KEYS.articles, JSON.stringify(articles));
    emitLocalSync();
  } catch {
    // ignore
  }
}

export function loadLocalRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.registrations);
    if (raw) {
      const parsed = JSON.parse(raw) as EventRegistration[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_REGISTRATIONS;
}

export function saveLocalRegistrations(items: EventRegistration[]): void {
  try {
    localStorage.setItem(LS_KEYS.registrations, JSON.stringify(items));
    emitLocalSync();
  } catch {
    // ignore
  }
}

export function loadLocalLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.logs);
    if (raw) {
      const parsed = JSON.parse(raw) as ActivityLog[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SEED_ACTIVITY_LOGS;
}

export function saveLocalLogs(items: ActivityLog[]): void {
  try {
    localStorage.setItem(LS_KEYS.logs, JSON.stringify(items));
    emitLocalSync();
  } catch {
    // ignore
  }
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `id-${Date.now()}`;
}

function buildEventPayload(event: ScientificEvent, isNew: boolean, actorUid: string) {
  const payload: Record<string, unknown> = {
    id: sanitizeId(event.id),
    code: event.code.slice(0, 40) || 'EVT-2025',
    title: event.title.slice(0, 220),
    shortSummary: (event.shortSummary || '').slice(0, 400),
    description: (event.description || '').slice(0, 8000),
    archetype: event.archetype,
    category: (event.category || 'Conférences').slice(0, 80),
    discipline: (event.discipline || 'ia').slice(0, 80),
    format: event.format,
    dateLabel: (event.dateLabel || 'À définir').slice(0, 80),
    startDate: (event.startDate || '2025-10-14').slice(0, 30),
    location: (event.location || 'Rabat').slice(0, 160),
    city: (event.city || 'Rabat').slice(0, 80),
    capacity: Math.max(1, Math.min(50000, Math.round(Number(event.capacity) || 100))),
    registeredCount: Math.max(
      0,
      Math.min(50000, Math.round(Number(event.registeredCount) || 0))
    ),
    status: event.status,
    featured: Boolean(event.featured),
    imageUrl: (event.imageUrl || '').slice(0, 1000),
    languages: (event.languages || ['Français']).slice(0, 6),
    tags: (event.tags || []).slice(0, 10),
    updatedAt: serverTimestamp(),
  };

  if (event.doi && event.doi.trim().length > 0) {
    payload.doi = event.doi.trim().slice(0, 120);
  }

  if (isNew) {
    payload.createdBy = actorUid;
    payload.createdAt = serverTimestamp();
  }
  return payload;
}

function buildArticlePayload(article: NewsArticle, isNew: boolean, actorUid: string) {
  const payload: Record<string, unknown> = {
    id: sanitizeId(article.id),
    title: article.title.slice(0, 240),
    summary: (article.summary || article.title).slice(0, 600),
    content: (article.content || article.summary || '').slice(0, 12000),
    author: (article.author || 'Secrétariat Général MSRASI').slice(0, 120),
    department: (article.department || 'Conseil Scientifique').slice(0, 120),
    category: article.category,
    publishedLabel: (article.publishedLabel || 'Aujourd’hui').slice(0, 60),
    views: Math.max(0, Math.min(10000000, Math.round(Number(article.views) || 0))),
    sharesLabel: (article.sharesLabel || '0 partages pro').slice(0, 80),
    status: article.status,
    featured: Boolean(article.featured),
    imageUrl: (article.imageUrl || '').slice(0, 1000),
    updatedAt: serverTimestamp(),
  };

  if (article.linkedEventCode && article.linkedEventCode.trim().length > 0) {
    payload.linkedEventCode = article.linkedEventCode.trim().slice(0, 60);
  }

  if (isNew) {
    payload.createdBy = actorUid;
    payload.createdAt = serverTimestamp();
  }
  return payload;
}

export async function seedInitialFirestoreDataIfEmpty(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !isCurrentUserAdmin()) return;

  try {
    // Ensure admin record exists
    const adminRef = doc(db, 'admins', user.uid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || PRIMARY_ADMIN_EMAIL,
        displayName: user.displayName || 'Dr. Responsable MSRASI',
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }

    const eventsSnap = await getDocs(collection(db, 'events'));
    if (eventsSnap.empty) {
      for (const evt of SEED_EVENTS) {
        const ref = doc(db, 'events', evt.id);
        await setDoc(ref, buildEventPayload(evt, true, user.uid));
      }
    }

    const articlesSnap = await getDocs(collection(db, 'articles'));
    if (articlesSnap.empty) {
      for (const art of SEED_ARTICLES) {
        const ref = doc(db, 'articles', art.id);
        await setDoc(ref, buildArticlePayload(art, true, user.uid));
      }
    }

    const logsSnap = await getDocs(collection(db, 'activity_logs'));
    if (logsSnap.empty) {
      for (const log of SEED_ACTIVITY_LOGS) {
        const ref = doc(db, 'activity_logs', log.id);
        await setDoc(ref, {
          id: log.id,
          type: log.type,
          message: log.message,
          detail: log.detail,
          actorUid: user.uid,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seedInitialFirestoreDataIfEmpty');
  }
}

export function subscribeEvents(
  isAdmin: boolean,
  onData: (events: ScientificEvent[]) => void
): Unsubscribe {
  const canQueryAllRemote = isAdmin && isCurrentUserAdmin();
  const colRef = collection(db, 'events');
  const q = canQueryAllRemote
    ? query(colRef)
    : query(colRef, where('status', 'in', ['publie', 'cloture']));

  const handleLocal = () => {
    if (!canQueryAllRemote) {
      const local = loadLocalEvents();
      onData(
        isAdmin
          ? local
          : local.filter((e) => e.status === 'publie' || e.status === 'cloture')
      );
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('msrasi-local-sync', handleLocal);
  }

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        const local = loadLocalEvents();
        onData(
          isAdmin
            ? local
            : local.filter((e) => e.status === 'publie' || e.status === 'cloture')
        );
        return;
      }
      const docs = snapshot.docs.map((d) => d.data() as ScientificEvent);
      if (canQueryAllRemote) {
        saveLocalEvents(docs);
        onData(docs);
      } else {
        onData(isAdmin ? mergeWithLocalDrafts(docs) : docs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    }
  );

  return () => {
    unsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('msrasi-local-sync', handleLocal);
    }
  };
}

function mergeWithLocalDrafts(remotePublic: ScientificEvent[]): ScientificEvent[] {
  const local = loadLocalEvents();
  const map = new Map<string, ScientificEvent>();
  remotePublic.forEach((item) => map.set(item.id, item));
  local.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function mergeArticlesWithLocalDrafts(remotePublic: NewsArticle[]): NewsArticle[] {
  const local = loadLocalArticles();
  const map = new Map<string, NewsArticle>();
  remotePublic.forEach((item) => map.set(item.id, item));
  local.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export function subscribeArticles(
  isAdmin: boolean,
  onData: (articles: NewsArticle[]) => void
): Unsubscribe {
  const canQueryAllRemote = isAdmin && isCurrentUserAdmin();
  const colRef = collection(db, 'articles');
  const q = canQueryAllRemote
    ? query(colRef)
    : query(colRef, where('status', '==', 'publie'));

  const handleLocal = () => {
    if (!canQueryAllRemote) {
      const local = loadLocalArticles();
      onData(isAdmin ? local : local.filter((a) => a.status === 'publie'));
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('msrasi-local-sync', handleLocal);
  }

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        const local = loadLocalArticles();
        onData(isAdmin ? local : local.filter((a) => a.status === 'publie'));
        return;
      }
      const docs = snapshot.docs.map((d) => d.data() as NewsArticle);
      if (canQueryAllRemote) {
        onData(docs);
      } else {
        onData(isAdmin ? mergeArticlesWithLocalDrafts(docs) : docs);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    }
  );

  return () => {
    unsub();
    if (typeof window !== 'undefined') {
      window.removeEventListener('msrasi-local-sync', handleLocal);
    }
  };
}

export function subscribeRegistrations(
  onData: (regs: EventRegistration[]) => void
): Unsubscribe {
  if (!isCurrentUserAdmin()) {
    const syncLocal = () => onData(loadLocalRegistrations());
    syncLocal();
    if (typeof window !== 'undefined') {
      window.addEventListener('msrasi-local-sync', syncLocal);
      return () => window.removeEventListener('msrasi-local-sync', syncLocal);
    }
    return () => {};
  }
  const q = query(collection(db, 'registrations'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(loadLocalRegistrations());
        return;
      }
      const docs = snapshot.docs.map((d) => d.data() as EventRegistration);
      onData(docs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    }
  );
}

export function subscribeActivityLogs(
  onData: (logs: ActivityLog[]) => void
): Unsubscribe {
  if (!isCurrentUserAdmin()) {
    const syncLocal = () => onData(loadLocalLogs());
    syncLocal();
    if (typeof window !== 'undefined') {
      window.addEventListener('msrasi-local-sync', syncLocal);
      return () => window.removeEventListener('msrasi-local-sync', syncLocal);
    }
    return () => {};
  }
  const q = query(collection(db, 'activity_logs'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(loadLocalLogs());
        return;
      }
      const docs = snapshot.docs.map((d) => d.data() as ActivityLog);
      onData(docs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activity_logs');
    }
  );
}

export function subscribeNewsletterSubscribers(
  onData: (subs: NewsletterSubscriber[]) => void
): Unsubscribe {
  if (!isCurrentUserAdmin()) {
    onData([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, 'newsletter_subscribers')),
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data() as NewsletterSubscriber));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'newsletter_subscribers');
    }
  );
}

export async function logAdminActivity(
  type: ActivityLog['type'],
  message: string,
  detail: string
): Promise<void> {
  const newLog: ActivityLog = {
    id: sanitizeId(`log-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
    type,
    message: message.slice(0, 280),
    detail: detail.slice(0, 180),
    actorUid: auth.currentUser?.uid || 'local-admin',
  };

  const current = loadLocalLogs();
  saveLocalLogs([newLog, ...current].slice(0, 40));

  if (!isCurrentUserAdmin() || !auth.currentUser) return;
  try {
    await setDoc(doc(db, 'activity_logs', newLog.id), {
      ...newLog,
      actorUid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `activity_logs/${newLog.id}`);
  }
}

export async function saveEventRecord(event: ScientificEvent): Promise<ScientificEvent> {
  const cleanId = sanitizeId(event.id || `evt-${Date.now()}`);
  const normalized: ScientificEvent = {
    ...event,
    id: cleanId,
  };

  const current = loadLocalEvents();
  const idx = current.findIndex((item) => item.id === cleanId);
  const next =
    idx >= 0
      ? current.map((item) => (item.id === cleanId ? normalized : item))
      : [normalized, ...current];
  saveLocalEvents(next);

  if (isCurrentUserAdmin() && auth.currentUser) {
    const ref = doc(db, 'events', cleanId);
    try {
      const existing = await getDoc(ref);
      if (existing.exists()) {
        const updatePayload = buildEventPayload(normalized, false, auth.currentUser.uid);
        delete updatePayload.id;
        await updateDoc(ref, updatePayload);
      } else {
        await setDoc(ref, buildEventPayload(normalized, true, auth.currentUser.uid));
      }
      await logAdminActivity(
        'event',
        `${existing.exists() ? 'Événement mis à jour' : 'Nouvel événement créé'} : ${normalized.title}`,
        `${normalized.code} • Statut ${normalized.status}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${cleanId}`);
    }
  }
  return normalized;
}

export async function deleteEventRecord(eventId: string): Promise<void> {
  const cleanId = sanitizeId(eventId);
  const next = loadLocalEvents().filter((item) => item.id !== cleanId);
  saveLocalEvents(next);

  if (isCurrentUserAdmin()) {
    try {
      await deleteDoc(doc(db, 'events', cleanId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${cleanId}`);
    }
  }
}

export async function saveArticleRecord(article: NewsArticle): Promise<NewsArticle> {
  const cleanId = sanitizeId(article.id || `art-${Date.now()}`);
  const normalized: NewsArticle = {
    ...article,
    id: cleanId,
  };

  const current = loadLocalArticles();
  const idx = current.findIndex((item) => item.id === cleanId);
  const next =
    idx >= 0
      ? current.map((item) => (item.id === cleanId ? normalized : item))
      : [normalized, ...current];
  saveLocalArticles(next);

  if (isCurrentUserAdmin() && auth.currentUser) {
    const ref = doc(db, 'articles', cleanId);
    try {
      const existing = await getDoc(ref);
      if (existing.exists()) {
        const updatePayload = buildArticlePayload(normalized, false, auth.currentUser.uid);
        delete updatePayload.id;
        await updateDoc(ref, updatePayload);
      } else {
        await setDoc(ref, buildArticlePayload(normalized, true, auth.currentUser.uid));
      }
      await logAdminActivity(
        'article',
        `Article ${existing.exists() ? 'mis à jour' : 'créé'} : « ${normalized.title} »`,
        `${normalized.category} • ${normalized.status}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `articles/${cleanId}`);
    }
  }
  return normalized;
}

export async function deleteArticleRecord(articleId: string): Promise<void> {
  const cleanId = sanitizeId(articleId);
  const next = loadLocalArticles().filter((item) => item.id !== cleanId);
  saveLocalArticles(next);

  if (isCurrentUserAdmin()) {
    try {
      await deleteDoc(doc(db, 'articles', cleanId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `articles/${cleanId}`);
    }
  }
}

export async function createRegistrationRecord(
  reg: Omit<EventRegistration, 'id' | 'refCode' | 'status' | 'createdAt'>
): Promise<EventRegistration> {
  const id = sanitizeId(`reg-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`);
  const refNum = Math.floor(1000 + Math.random() * 8999);
  const fullRecord: EventRegistration = {
    ...reg,
    id,
    refCode: `REF-MSRASI-2025-${refNum}`,
    status: 'valide',
    consentCNDP: true,
    userId: auth.currentUser?.uid,
  };

  const current = loadLocalRegistrations();
  saveLocalRegistrations([fullRecord, ...current]);

  // Increment local event count
  const localEvents = loadLocalEvents();
  saveLocalEvents(
    localEvents.map((e) =>
      e.id === reg.eventId
        ? { ...e, registeredCount: Math.min(e.capacity, e.registeredCount + 1) }
        : e
    )
  );

  try {
    const eventDoc = await getDoc(doc(db, 'events', reg.eventId)).catch(() => null);
    if (eventDoc && eventDoc.exists()) {
      const payload: Record<string, unknown> = {
        id: fullRecord.id,
        refCode: fullRecord.refCode,
        eventId: fullRecord.eventId,
        eventTitle: fullRecord.eventTitle.slice(0, 220),
        fullName: fullRecord.fullName.slice(0, 140),
        email: fullRecord.email.slice(0, 150),
        phone: fullRecord.phone.slice(0, 40),
        institution: fullRecord.institution.slice(0, 180),
        academicStatus: fullRecord.academicStatus.slice(0, 60),
        modality: fullRecord.modality,
        participationRole: fullRecord.participationRole,
        consentCNDP: true,
        consentMedia: Boolean(fullRecord.consentMedia),
        status: 'valide',
        createdAt: serverTimestamp(),
      };
      if (auth.currentUser?.uid) payload.userId = auth.currentUser.uid;
      if (fullRecord.city) payload.city = fullRecord.city.slice(0, 80);
      if (fullRecord.country) payload.country = fullRecord.country.slice(0, 80);
      if (fullRecord.laboratory) payload.laboratory = fullRecord.laboratory.slice(0, 180);
      if (fullRecord.paperTitle) payload.paperTitle = fullRecord.paperTitle.slice(0, 300);
      if (fullRecord.track) payload.track = fullRecord.track.slice(0, 120);
      if (fullRecord.submissionCode)
        payload.submissionCode = fullRecord.submissionCode.slice(0, 60);
      if (fullRecord.tariffLabel) payload.tariffLabel = fullRecord.tariffLabel.slice(0, 80);
      if (fullRecord.dietaryPreference)
        payload.dietaryPreference = fullRecord.dietaryPreference.slice(0, 100);
      if (fullRecord.certificateType)
        payload.certificateType = fullRecord.certificateType.slice(0, 120);

      await setDoc(doc(db, 'registrations', fullRecord.id), payload);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `registrations/${fullRecord.id}`);
  }

  return fullRecord;
}

export async function createNewsletterSubscription(
  email: string,
  immediateCfpAlerts: boolean,
  source: string
): Promise<void> {
  const id = sanitizeId(`sub-${Date.now()}-${Math.floor(Math.random() * 999)}`);
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      id,
      email: email.trim().slice(0, 150),
      immediateCfpAlerts: Boolean(immediateCfpAlerts),
      source: source.slice(0, 60),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `newsletter_subscribers/${id}`);
  }
}

export function downloadIcsForEvent(event: ScientificEvent): void {
  const startClean = (event.startDate || '2025-10-14').replace(/-/g, '');
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MSRASI//Portail Scientifique//FR',
    'BEGIN:VEVENT',
    `UID:${event.id}@msrasi.ma`,
    `DTSTART;VALUE=DATE:${startClean}`,
    `SUMMARY:${event.title.replace(/[\r\n]/g, ' ')}`,
    `LOCATION:${event.location.replace(/[\r\n]/g, ' ')}`,
    `DESCRIPTION:${(event.shortSummary || '').replace(/[\r\n]/g, ' ')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.code || 'msrasi-event'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCsvFile(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean>>
): void {
  const escape = (val: string | number | boolean) =>
    `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join(
    '\r\n'
  );
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
