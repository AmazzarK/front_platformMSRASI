export type RoutePath =
  | 'accueil'
  | 'a-propos'
  | 'nos-activites'
  | 'evenements'
  | 'evenement-detail'
  | 'inscription'
  | 'actualites'
  | 'contact'
  | 'nous-rejoindre'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-events'
  | 'admin-event-wizard'
  | 'admin-event-preview'
  | 'admin-news'
  | 'admin-members';

export type EventArchetype = 'conf' | 'workshop' | 'hackathon' | 'symposium';
export type EventFormat = 'presentiel' | 'virtuel' | 'hybride';
export type EventStatus = 'publie' | 'brouillon' | 'en_attente' | 'cloture' | 'archive';

export interface ScientificEvent {
  id: string;
  code: string;
  title: string;
  shortSummary: string;
  description: string;
  archetype: EventArchetype;
  category: string;
  discipline: string;
  format: EventFormat;
  dateLabel: string;
  startDate: string;
  location: string;
  city: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  featured: boolean;
  imageUrl: string;
  doi?: string;
  languages: string[];
  tags: string[];
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EventRegistration {
  id: string;
  refCode: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  institution: string;
  laboratory?: string;
  academicStatus: string;
  modality: 'onsite' | 'online';
  participationRole: 'auditeur' | 'auteur_oral' | 'auteur_poster';
  paperTitle?: string;
  track?: string;
  submissionCode?: string;
  tariffLabel?: string;
  dietaryPreference?: string;
  certificateType?: string;
  consentCNDP: boolean;
  consentMedia?: boolean;
  status: 'valide' | 'en_attente' | 'annule';
  createdAt?: unknown;
}

export type ArticleCategory =
  | 'Annonces officielles'
  | 'Résultats de recherche'
  | 'Retours sur événements'
  | 'Partenariats';

export type ArticleStatus = 'publie' | 'brouillon' | 'en_revue' | 'archive';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  department: string;
  category: ArticleCategory;
  publishedLabel: string;
  views: number;
  sharesLabel: string;
  linkedEventCode?: string;
  status: ArticleStatus;
  featured: boolean;
  imageUrl: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  immediateCfpAlerts: boolean;
  source?: string;
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  type: 'registration' | 'article' | 'event' | 'export';
  message: string;
  detail: string;
  actorUid: string;
  createdAt?: unknown;
}

export interface EventSpeaker {
  name: string;
  role: string;
  affiliation: string;
  metric: string;
  countryCode?: string;
  photoUrl: string;
  fallbackPhoto: string;
}

export interface ProgramSlot {
  time: string;
  room: string;
  badge: string;
  title: string;
  speaker: string;
  accent?: 'primary' | 'secondary' | 'tertiary';
}

export interface ProgramDay {
  id: string;
  label: string;
  subtitle: string;
  slots: ProgramSlot[];
}

export interface TariffTier {
  id: string;
  title: string;
  subtitle: string;
  priceLabel: string;
  badge?: string;
  accent?: 'primary' | 'secondary' | 'dark';
}
