import React, { useMemo, useState } from 'react';
import { SafeImage } from '../../components/SafeImage';
import { useToast } from '../../components/ToastContext';
import { HOTLINK_IMAGES, LOCAL_FALLBACK_IMAGES } from '../../data/seedData';
import type { NewsArticle, RoutePath } from '../../types/msrasi';

interface SecondaryPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AboutPage: React.FC<SecondaryPageProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl space-y-12">
      <div className="bg-inverse-surface text-white rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
        <div className="lg:w-7/12 space-y-4">
          <span className="px-3 py-1 rounded-full bg-white/10 text-tertiary-fixed font-label-sm uppercase">
            Institution Nationale • Loi 75-00
          </span>
          <h1 className="font-headline-xl text-white">
            À propos de l&apos;Association MSRASI
          </h1>
          <p className="font-body-lg text-slate-300 leading-relaxed">
            L&apos;Association Marocaine pour la Recherche en Sciences Appliquées et
            l&apos;Innovation fédère les laboratoires universitaires, la diaspora
            scientifique et les partenaires industriels autour d&apos;une ambition commune :
            faire du Maroc un pôle d&apos;excellence technologique et de souveraineté
            scientifique.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('nous-rejoindre')}
              className="px-6 py-3 rounded-lg bg-[#F58200] hover:bg-[#ff9924] text-white font-label-md font-bold cursor-pointer"
            >
              Adhérer à l&apos;association
            </button>
            <button
              type="button"
              onClick={() => onNavigate('evenements')}
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-label-md cursor-pointer"
            >
              Agenda Scientifique
            </button>
          </div>
        </div>
        <div className="lg:w-5/12 w-full">
          <SafeImage
            src={HOTLINK_IMAGES.heroLab}
            fallback={LOCAL_FALLBACK_IMAGES.lab}
            alt="Laboratoire MSRASI"
            className="w-full h-64 object-cover rounded-xl shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Conseil Scientifique National',
            role: 'Composé de 24 professeurs émérites et directeurs de laboratoires',
            icon: 'account_balance',
          },
          {
            title: 'Charte Éthique & Intégrité',
            role: 'Évaluation rigoureuse en double aveugle et conformité CNDP Maroc',
            icon: 'verified_user',
          },
          {
            title: 'Réseaux Internationaux',
            role: 'Conventions avec CNRS, UM6P, CNRST, MAScIR et partenaires africains',
            icon: 'public',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-3"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
            </div>
            <h3 className="font-headline-sm text-on-surface">{card.title}</h3>
            <p className="font-body-sm text-on-surface-variant">{card.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ActivitiesPage: React.FC<SecondaryPageProps> = ({ onNavigate }) => {
  const programs = [
    {
      code: 'PROG-01',
      title: 'Bourses Doctorales & Mobilité Internationale',
      desc: "Financement d'équipements, accès aux plateformes analytiques et bourses de stage dans les laboratoires partenaires.",
      tag: '20 Bourses / an',
    },
    {
      code: 'PROG-02',
      title: 'Labellisation des Laboratoires & FabLabs',
      desc: 'Campagne annuelle de certification qualité et mise en réseau des espaces de prototypage rapide à Rabat, Casablanca et Fès.',
      tag: 'Campagne 2025 Ouverte',
    },
    {
      code: 'PROG-03',
      title: 'Transfert Technologique & Brevetabilité OMPIC',
      desc: "Accompagnement des chercheurs dans la rédaction de brevets, l'étude d'antériorité et la maturation pré-industrielle.",
      tag: '18 Brevets accompagnés',
    },
    {
      code: 'PROG-04',
      title: 'Écoles Doctorales & Publications Q1',
      desc: "Cycle de formations certifiantes en rédaction scientifique IEEE/Elsevier, intégrité académique et traitement des données.",
      tag: '650 Certifiés',
    },
  ];

  return (
    <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm uppercase">
            Nos Activités &amp; Pôles Opérationnels
          </span>
          <h1 className="font-headline-xl text-on-surface mt-2">
            Programmes de Recherche &amp; Transfert Technologique
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('evenements')}
          className="px-5 py-2.5 rounded-lg bg-primary text-white font-label-md hover:bg-secondary cursor-pointer self-start"
        >
          Voir l&apos;agenda des événements
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((p) => (
          <div
            key={p.code}
            className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary bg-surface-container px-2.5 py-1 rounded">
                  {p.code}
                </span>
                <span className="font-label-sm text-[#087a4b] bg-[#E6F5EE] px-2.5 py-1 rounded-full">
                  {p.tag}
                </span>
              </div>
              <h3 className="font-headline-md text-on-surface pt-2">{p.title}</h3>
              <p className="font-body-md text-on-surface-variant">{p.desc}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate('nous-rejoindre')}
                className="inline-flex items-center gap-1 font-label-md text-primary hover:text-secondary cursor-pointer"
              >
                <span>Participer à ce programme</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface NewsPublicPageProps {
  articles: NewsArticle[];
  onNavigate: (route: RoutePath) => void;
}

export const NewsPublicPage: React.FC<NewsPublicPageProps> = ({ articles }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const published = useMemo(() => {
    return articles.filter((a) => {
      if (a.status !== 'publie') return false;
      if (selectedCategory !== 'Toutes' && a.category !== selectedCategory) return false;
      return true;
    });
  }, [articles, selectedCategory]);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm uppercase">
            Revue &amp; Communiqués Officiels
          </span>
          <h1 className="font-headline-xl text-on-surface mt-2">
            Actualités Scientifiques MSRASI
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            'Toutes',
            'Annonces officielles',
            'Résultats de recherche',
            'Retours sur événements',
            'Partenariats',
          ].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-label-sm transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {published.map((art) => (
          <article
            key={art.id}
            onClick={() => setReadingArticle(art)}
            className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <SafeImage
                  src={art.imageUrl}
                  fallback={LOCAL_FALLBACK_IMAGES.conference}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-white font-label-sm">
                  {art.category}
                </span>
              </div>
              <div className="p-6 space-y-2">
                <div className="text-xs text-outline">
                  {art.publishedLabel} • {art.author}
                </div>
                <h3 className="font-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="font-body-sm text-on-surface-variant line-clamp-3">
                  {art.summary}
                </p>
              </div>
            </div>
            <div className="px-6 pb-5 flex items-center justify-between text-primary font-label-md">
              <span>Lire le communiqué</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </div>
          </article>
        ))}
      </div>

      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="relative h-56">
              <SafeImage
                src={readingArticle.imageUrl}
                fallback={LOCAL_FALLBACK_IMAGES.conference}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-xs text-outline">
                {readingArticle.publishedLabel} • {readingArticle.department}
              </div>
              <h2 className="font-headline-md text-on-surface">
                {readingArticle.title}
              </h2>
              <p className="font-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
                {readingArticle.content || readingArticle.summary}
              </p>
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  className="px-5 py-2 rounded-lg bg-primary text-white font-label-md cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContactPage: React.FC<SecondaryPageProps> = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Partenariat Scientifique & Labellisation');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Votre message a bien été transmis au Secrétariat Général MSRASI (Rabat).'
    );
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm uppercase">
            Secrétariat Général
          </span>
          <h1 className="font-headline-xl text-on-surface">
            Contacter l&apos;Association MSRASI
          </h1>
          <p className="font-body-md text-on-surface-variant">
            Pour toute demande de convention de recherche, labellisation de colloque ou
            information relative aux adhésions institutionnelles.
          </p>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div>
                <h4 className="font-headline-xs">Siège National</h4>
                <p className="text-sm text-on-surface-variant">
                  Campus Universitaire Al Irfane, Rabat &amp; Casablanca Technopark, Maroc
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">mail</span>
              <div>
                <h4 className="font-headline-xs">Courrier Électronique</h4>
                <p className="text-sm text-on-surface-variant">
                  secretariat@msrasi.ma • contact@msrasi.ma
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">call</span>
              <div>
                <h4 className="font-headline-xs">Ligne Directe</h4>
                <p className="text-sm text-on-surface-variant">+212 (0) 537 00 00 00</p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-4"
        >
          <h2 className="font-headline-md text-on-surface">
            Formulaire de Correspondance Officielle
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md mb-1">Nom &amp; Titre *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prof. Karim El Amrani"
                className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block font-label-md mb-1">Email Institutionnel *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="k.elamrani@univ.ma"
                className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block font-label-md mb-1">Objet de la demande</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Partenariat Scientifique &amp; Labellisation</option>
              <option>Adhésion &amp; Cotisation Membre</option>
              <option>Information Congrès CISA-2025</option>
              <option>Presse &amp; Publications</option>
            </select>
          </div>
          <div>
            <label className="block font-label-md mb-1">Message *</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Précisez votre demande scientifique ou administrative..."
              className="w-full p-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-primary hover:bg-secondary text-white font-label-md font-bold cursor-pointer"
          >
            Transmettre au Secrétariat
          </button>
        </form>
      </div>
    </div>
  );
};

export const JoinUsPage: React.FC<SecondaryPageProps> = () => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [pole, setPole] = useState('Intelligence Artificielle & Data');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      `Candidature d'adhésion reçue pour ${fullName} (${pole}). Le bureau exécutif vous contactera sous 48h.`
    );
    setFullName('');
    setEmail('');
    setAffiliation('');
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-gutter-mobile lg:px-gutter-desktop py-space-xl">
      <form
        onSubmit={handleApply}
        className="bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-md space-y-6"
      >
        <div>
          <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm uppercase">
            Pôle Régional d&apos;Excellence
          </span>
          <h1 className="font-headline-xl text-on-surface mt-2">
            Rejoindre la Communauté MSRASI
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Devenez membre actif pour bénéficier de la gratuité aux colloques, du mentorat
            doctoral et des appels à projets cofinancés.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-md mb-1">Nom Complet &amp; Titre *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Salma Berrada"
              className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block font-label-md mb-1">Email Institutionnel *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="s.berrada@um5.ac.ma"
              className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block font-label-md mb-1">
              Université / Laboratoire *
            </label>
            <input
              type="text"
              required
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="UM6P / CNRST / École d'Ingénieurs"
              className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block font-label-md mb-1">Pôle Scientifique Visé</label>
            <select
              value={pole}
              onChange={(e) => setPole(e.target.value)}
              className="w-full h-11 px-3 rounded bg-surface-bright focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option>Intelligence Artificielle &amp; Data</option>
              <option>Énergies Renouvelables &amp; Hydrogène</option>
              <option>Biotechnologies &amp; Santé</option>
              <option>Génie des Matériaux &amp; Nanotech</option>
              <option>Agritech &amp; Gestion de l&apos;Eau</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-lg bg-primary hover:bg-secondary text-white font-label-md font-bold cursor-pointer"
        >
          Soumettre ma demande d&apos;adhésion
        </button>
      </form>
    </div>
  );
};
