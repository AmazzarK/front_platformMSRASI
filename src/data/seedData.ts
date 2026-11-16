import type {
  ActivityLog,
  EventRegistration,
  EventSpeaker,
  NewsArticle,
  ProgramDay,
  ScientificEvent,
  TariffTier,
} from '../types/msrasi';

export const LOCAL_FALLBACK_IMAGES = {
  lab: '/assets/aistudio/Image_23_8124dc2d.jpeg',
  conference: '/assets/aistudio/Image_24_dc9ce0c5.jpeg',
  energy: '/assets/aistudio/Image_25_a2c5b3a6.jpeg',
};

export const HOTLINK_IMAGES = {
  heroLab:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD4SPq8TedhJU3hgJ0IHuTeWMmltng7pl6lyFBs_4kgHQ5V9gP1-CURvvBfh6Z8O9eQUVzsx_UZMYPIkjS2xmRCvdOQlyAxINo13v9CyifWIbbOO7bH8f1vuKtNVUKmvMiFWGKzICQveMuqMooba4UpvBL7UmUlQ-CH5uzjntxVirURZJlfRxTStAXAM8RbxPlMxeLL0AnEwuZQcgli-hJCHTKdXLT51TialMhiUk4',
  cisaAmphitheater:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcw1J_Cv7jYnKFmsoMQeAFWBPuEoZKIWoF4Vu5pHNv9BEhXf4ysuH6lqRAQtuMIYcSIxrL6t4kRALPYuhQmAWJaVDJKqbQfOe64L08HJS18OlK964lPd7lCqMn02u-rSlr-Rh37CZwmPU4285VzFOUXYNZRNDQDaBSeS75WOaC2B3Y-cSGWU4Ek9b8gcRgsU2gklRQbhqYD1Q4SVrneguw2x0TyHCzCXz1kyymrqU',
  cisaDetailHero:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlx6V_Pc6MpzZ9KN4fP-ULTxikbcj7ApgTnwyLV1CBBRErWjCmWtYFipg5kWQNeYH6CSMK_hUBmr09c8EXEEu_XwlQ5zZRmXmYVs8lQ_h57U74fo27BgIYD690tFrc3MNFYFPqATnw3aIP6YXuGgznCaTXQCRijI47ptKfJFVDn10Z6QnXFGIBCONu9lBUD6Wf2W1j1OM6FmXYfPzWT6iHm2dvj0YqNA9klihXys',
  cisaSpotlight:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYYxT36X0EF4Znqx68mP24HKZA-oDX7xoNEVLbu2et1hFaQCaf--YqUzXJ60Ct7-fPTG-1jXFwTmGxJB5zYIUC-ulGrVQris69m1mDcnEDi0vy-vURVjnmdN9N-kctCGaM0FG4jPGm-FluDmv0X-tjZNisNEU21t8FmrtBTqM12c_5EJwPb7FH0qpjqhy309mU4bo-J14oBBfk_73DLYuYa5SuP9SdtEInbRWRIgc',
  roboticsWorkshop:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuByecvU2ZNQirfVAPDpq2bEzg1heSrHoVj6RsapTCJVxtz5afs0zyqcfB7zNef9FJ9753N87kjwGiTX6QWwxLGRmCLnZGtARkViwzfq4yAcM5FBgCaGYMYtIZJKyQViJaXC6k5n7sNz4uSMwwcGUefyfttnNZnSsCVPMt7cFvS76OsLhY6kh-rx-NHUVrfPxjpWDMS8CrJmCAzUJXsVfouLL_xmqW1UZBLsWuwTCZA',
  hydrogenSymposium:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ-Qyi8ORhAYOTY1z-9GIMjrMYy49fXUq7iFy-TNg5yj-laMZuP-ZLLCfXR4ulYxh5fGMRzujjXHaHa-ec-DaxLbTewXr8rGr1sm3knNf4oyKsCN9ATNx0r7krpEHWvizbC_86rSZSXF3pCfNc_y-N1V7_-3KqQvkrkgEsoKIPDYScNR8f9LS444-GYgMykFn2rLHeVKu3dBBSlW9gQhJCVcL2yZFNOGG8eOUsaIc',
  hackathonAgri:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCdgDSCccL_IU5piTuS6FdB07GFRzAHL9bcknqI4jIDY2n3giBaKUWunX6Njchhh9bnra_0asMeDWPSHdRLwep_1xkIi8P5sT7uK1IZWg6HNQqsXfeJJf6ZC14nsG0xEtxcV64GebYbA5wjCGWtkirkj-BSBTDOQa-fMyaBmFmbRzoPptt2Xh4iv7B5Tef_4R6zaULvNw9EpG_yMcbj_Wp5Gua4Dqc6-4ju1a0qN94',
  hackathonMed:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Hvl9MyfnOXdRx0wjBqN6ANzhygmbRZDQXCRNKwxStumOR0YKaw87RI1zmXt_zgy2vQ2LMNM1fcOfi8INfC4vMReSnjeBmL5CQRBpH2tkd1rfB9MFKYb5TLx0CFdlE6-8oAykyEvolsHkgj0CXry4eDJaLYP2zOhiIuHFqTMtIcoSrt7fw7YPPkv6EgxRLXjbNWsoHSr13LLoAuX7Bh6EO5gJdTHZghTMoo9UGws',
  webinarStudio:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBMN3eMdvZcBDdEQBDB5SHNrEmp958yoef84bqNycM42bM-y4gvrRkcyGQjhGVBOouI0i4_6GyNUfSH-51SxBvtBnLN42Z7lOTPobvSlEYHIQmd6eqLFGzsEBYa6u-EdlwHPDIeTAygztz8lh4cNrE4ilte-dWVls3qXWR5iezr4OKj9a6jHQlp-rXAPfdg057hqf-xTSU9TKdkF9Fr5F0hxQGGTO-TOwtkxlUVoJ4',
  newsPartnership:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCegixn3fHL2hV-MoUFlUyOnaKjcj8TNGr7wAMAKA2gwWJgGMXaCg9HDkEm27JzftLBUGMm8JEDEPRnNeM9LMSKqhLXE2RMpteFpOEp36kJoBgDzpwTnUtpkOOiLr0Jzr4oLHgNbjXGPExzGzQZ1ztd0rOOlKXhTUb0HRcmVnT7xvgiXQlDlLyy0zMwNW4tXABlHXVYVfeu5PvbfI_aZLdAhxzTOrkBLOKYZIqu9ho',
  newsMascir:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC0fYjB92josHr3dGddZtLNWwvTFgIYSa8WgMeLYMYO2JMwbjjSrJlvB2yPsz6Ez-u8QymNTrJHqNpqaVdrVfdqR4n7TVowpw2YQQ2bTxis-ihtpvf-9JPkAQe3QwuKVKH8wQEBH1p43BwsoQ6skwdAdTH3a4NaSpoPeItcrCMXVQyAmvF4KxCxq6KRcqH_jZ9wHTg1sj4WYJqaP8Rx-EIQmQii7Nml_C5CS7O74Hg',
  newsCisaRecap:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6mLee8VHHNnuWfsiFG36CMx9mPWLujaDbi3Gf00wBcDhqikBFC3RtOmyEHjjIspSdHkJVgRagv39_i-0nocdKuSlmT7z5TCe6hTYwZ8t0CkaMkt7ZG7nBmDpghWZHCeE-b1-P9NZoJetYbfg_J9-mGNI51u_FXQ4qUXLFBG74VJ6KrZuSnCH7FKIuimh6DQmkk-U4Z6C2hn2sxzjA-VTeTQSnDyl3ohK7GjzW1as',
  newsWomenStem:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANgdQOnRAxyaPNiQGXx4sVp1VBuDwNWrgkn-3SuQFWCod3dWUTkgpK_jDjisFVJFDn_r2trUwX4RZEwEgr0WbKJ-6Ag5vx8su3PhFZkoe836C9ZtXhM9rMYFoBgaJPa4aJOvdVvVRuGl668Hdh5A0hRdBa_qBtB6H4NMzs3ITkeAPOM2cB59ydTD4KEZBab6FVk4kf3-oKT15_cCy_ldc4Aqe2RNuwtDlC0lZ5WxA',
  newsH2Call:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ4e-RPwUJTH8ufFeAqkZYsJDZdXy9bQ2cG9Skn1a9ATL2JDvbgTAcUHKs0LpRMWN3SdfoEhGgVAOvhkpavakG21VOi7qdthGZpM9AooqWb_N66fQn7_gFq2-UsjplsVFpZpDLjx9eV019fPvEZgo5LhfU0xfqvam_WSdSaxUE_voBA8LbBu8_NcQUMbyw37WhAs8FbRti2xkSuwM08IFHgH4Uc5Px6ofOAveqoqo',
  wizardCover:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBI0mp2XjzMUoZAVUWzAnqgck2sez8tiDsU-PPW1OXgCoYiNMchJ5lelSiFQFeHMsf39k4cDpsrlEnSOZqZXLcikCUq1l2vLxaH8YR04B2C-7zz0owDMwQ8UZyAbIfniIa-IHabNKWmQobEdT35CAju37g0dxTzde-O7JsLU_GMVNjLXAaSnAjwmHOa_EZAJFfgIu-LbNAc14rImWUxGEX75PFQSK8qVoldIy0qG3Q',
  wizardPoster:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuApH2cfxwt4VEP_pR1mnDWJqkYhZFx5RvrWvl-xLeuUYIvCASGjGURMdxyH8Xp4XcyobqRc5gu0tKVTmMM7M1_J_J0WYYauuK5QOWtbtIlMSGNzUj-W30cOBP9oFjDXz791rZ4E9S17F1ApqEZnqOiWy5cOWtW9SqkPZDcLQmbhOtKshObBnk3PjlBkIOlO_dpU7pN2mtYWR1qlBbn8ItCfntkZan8Dsawz-DyHrfo',
  rabatMap:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCec5_ElvTfCOE6Rovlt10tFj7YBUb7lj0nzIE6L5RMQtMQ92obRxnjm0foV_W0QDr1VlZi64e940b2-6mrVWGfiPJIDBjK0pEPXGA5ag8R-E10IrW87Lkwd0-bMjrUC8X45RDbvtYKjSj0BqPT5y_WBft0J9W8nUgHlphIa4TczxB_-67VZQdSQuqCFha61D_dioHNUnAN6FsDMPTGUyOCpwg5dO1rSLTz3S39TIE',
  marrakechMap:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDjSC5jH9Y8GC-Y8QFEai_ECGQhl-SS4edjZAcYWZqQA3tIMzqPVSdPFuemnL5S_jQ34diREJfBjQ34ho5CnVqkrJGZcp3imMA6umETNffa27g_aIfLorhheV-kI4NDl71awG_Tp6fEVdW1hMjI8P6JMsLFxGcPLSgAWjLG3CNuL4WTD31pERlYOSQxGW_wBL_YW4tSfQ23pOqP4DzykHaZyl2A6AMu6LWxZKYcSs8',
  speaker1:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCbMppROEDMsq7Vl11ykgTuKpLHs5IJMJoloqPkjOgIml6pYaAvQ9mok5p267iNU58zAwpRz6yh-vc4XQTRgjsMzXPqZpHdFaZ0xU-I7ErzEv7b3CumWuDBgjTSmBX6VMEbsBxHe1JAd2HE-IH9-UHLPxlGbovY0WNvH1l5eMv6fGtM36AYc7tNfvSXAORF-aiOiCzfznWB2uNlaySz7nuRBxZVYZHvmzK2-gPyZ8Q',
  speaker2:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDszn2PLJGsGbEBXx9rKR5gLI6P0yliXsNdOHlSE0aYvWBEzkG6UJYDmtgnBFfeUb1WQjlIgBm2IPk_CXXZt93oGDVzTzZff0T-rGYxWzDDvH4BCVoi155E3NL4FSyTk0kHcJV8BxhInXZVv3RQhSnKXhwja9qJZr00fogZ1wKTL6KSCgQZMtn2h41OGmKKXKD0Yyl2gdNkbQrLNjAOANfHisWSq7WOqE8EVlEpnQw',
  speaker3:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCzwB20NlRfuns6jIZA9xylibTieheg67t_zjJNTP9AMdCc1LrA-dy9beOZLMYtNvSZRkofJ48Rq_XxBZJpOqspri3tNfu269g6l11L8_-_0LY_Uh82dAjWySNC5jQYDhw7KKjpOKm6BLA85YbUTISqNOis7bs7mQli2WgEV8Mf1bfNStnOFbgb5V-r_ge4T40U78GAKqtH7RNIV-zH-R8xKm8jH8WFe7nbWGz2ggY',
  speaker4:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCTgj5p2_E77Uhr9qiHg6A5pYRiAkJv17rb_teUKKDd8N3naREBAX-3l-IbzduQXcGUJam5-6WHzFhAz86ZacAL4fw1cHr2nqVSkeJ02CkhJUREuqL0q6D4yIhMj3P4QTPGxqsiDQ-iWrjOdeZpSm3Nkj6ysI2IpzWWFhu0ZH4uJAEPzju7npHM0t0Oq5uu7nufWLCse6q3p7_3oYqDKJHshnJ4TYRdI8pULTDi0CY',
  retro1:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBCq9z-QZPBhT5YMw_EnPIflcyMwXQ5cNb40soysDinCaVCdSCzGzGuE1aPC3QzQ_6d5lA5Ts7I9MHj7sLq-nvYKrvrDfitObyWN0NNxxFIVgaiPGf2Tdmlu_64axqnF7PhjMkmwXHJiUk4SeeDNJbNHeH0wMOVxWAlEtLOMlcZk-2y0Xe9WvUa2rKL1vCv-lYZQC_ycUA6DZi0f-Bhcl3hhfZFf1UJIZfZY8gDGaA',
  retro2:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAQaVPB8xQ8NwyTpXDmwUldqg4HugSmpCYgBs5LaKmy92B2iggloIkez4XV--jdDL_6tgbjF_KXUCRM8xWf_kuRhElIpYmBs9D-jupelgulItMbK4jXdOQ5Ng4HSGI_HJNns4jzvIxwA4Qi0JtyO5PXnr3McyP0yfC1AZfoUa-mK4Ac8t0yEM83CQMwxdqG9x3niG1ODIQqq3IUW7xUgCSfZ9iQgOPqr1OFr8uXmHg',
  retro3:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBbQxNIAphAzueFK8uXSTzvI3nch66kpjnP_8iCJLz_EYgaLj8jEWIQT-kmPThrKHdPg_Uk1J0LUEp5nkRrRo4PSBLY5AT7pVkUIKCLyPnHlrW5GV3jgvBMa5Zo970aWDGmMzgSmJfQxvVKulfrgEz2T0xMqFcUn1YtCIXsAhVOALeaS_pDzgsXmN1pqrcYH3MiWDubiAS_qcGE41xU0NIRqL2bv-DHDVr2bkPTQFA',
  dashLab:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDN8S1qK4Aa-l_TaxcoBwn0VDE2UE2ZM0_BwbI6Ftvi5Vyvdh-CNkDvxxC8AxwQQji79tkuuk_vMOU11TvVv9Tsl4uyXMu8alOkJ_adaYQbVgTbanTn7ViJ4yTdJspYWGg7eqi9p8kSM6Fo8LGIivKaFLJv3z08S56eqVKmmaXhyD8Ng0SU3QnaOeCAvWMGzOmq4AooPoD-VJedDNZJVJPwRdf1mlKM8JzuAl-3rUo',
};

export const SEED_EVENTS: ScientificEvent[] = [
  {
    id: 'evt-cisa-2025',
    code: 'CONF-2025-CISA',
    title: 'Congrès International des Sciences Appliquées & IA (CISA 2025)',
    shortSummary:
      "Le plus grand rassemblement de la communauté scientifique marocaine et internationale dédiée aux percées de l'intelligence artificielle générative dans les sciences du vivant, l'ingénierie énergétique et les matériaux durables.",
    description:
      "Placé sous le haut patronage académique national, le CISA-2025 offre un carrefour d'émulation intellectuelle pour faire converger la recherche fondamentale en bio-ingénierie et les modèles prédictifs d'intelligence artificielle avancée. Trois journées immersives dédiées à la valorisation de la propriété intellectuelle marocaine et à la publication d'actes à fort impact citationnel.",
    archetype: 'conf',
    category: 'Conférences',
    discipline: 'ia',
    format: 'hybride',
    dateLabel: '14 - 16 Oct 2025',
    startDate: '2025-10-14',
    location: 'Université Mohammed V, Rabat',
    city: 'Rabat',
    capacity: 500,
    registeredCount: 408,
    status: 'publie',
    featured: true,
    imageUrl: HOTLINK_IMAGES.cisaAmphitheater,
    doi: '10.5842/msrasi.cisa.2025',
    languages: ['Français', 'Anglais', 'Arabe (العربية)'],
    tags: ['#IAExplicable', '#Biotechnologies', '#ActesScopus', '#SouverainetéTech'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-robot-2025',
    code: 'WS-2025-ROBOT',
    title: 'Atelier Pratique: Prototypage de Microsystèmes & Robotique Médicale',
    shortSummary:
      'Session pratique intensive pour doctorants et ingénieurs concevant des dispositifs biomédicaux, microcapteurs et actionneurs automatisés.',
    description:
      'FabLab Casablanca — Hands-on STM32, LoRaWAN & Edge-AI. Formation intensive de 8 heures dédiée au prototypage rapide de systèmes embarqués et micro-capteurs médicaux avec encadrement par le Pôle Mécatronique MSRASI.',
    archetype: 'workshop',
    category: 'Ateliers',
    discipline: 'ia',
    format: 'presentiel',
    dateLabel: '28 Nov 2025',
    startDate: '2025-11-28',
    location: 'Casablanca Technopark',
    city: 'Casablanca',
    capacity: 50,
    registeredCount: 45,
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.roboticsWorkshop,
    doi: '10.5842/msrasi.ws.2025.04',
    languages: ['Français', 'Anglais'],
    tags: ['#RobotiqueMédicale', '#STM32', '#EdgeAI', '#FabLab'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-h2-2025',
    code: 'SYMP-2025-H2',
    title: "Symposium National sur l'Hydrogène Vert & Matériaux Avancés",
    shortSummary:
      "État de l'art sur la catalyse électrochimique, stockage solide et perspectives de la filière Power-to-X dans le cadre de la transition énergétique marocaine.",
    description:
      "Partenariat IRESEN & UM6P — Réunissant chimistes, ingénieurs et opérateurs d'infrastructures pour faire le point sur la filière d'électrolyse solaire nationale et les matériaux membranaires sans métaux nobles.",
    archetype: 'symposium',
    category: 'Séminaires',
    discipline: 'energie',
    format: 'presentiel',
    dateLabel: '12 Déc 2025',
    startDate: '2025-12-12',
    location: 'Université Cadi Ayyad, Marrakech',
    city: 'Marrakech',
    capacity: 150,
    registeredCount: 138,
    status: 'en_attente',
    featured: false,
    imageUrl: HOTLINK_IMAGES.hydrogenSymposium,
    doi: '10.5842/msrasi.h2.2025',
    languages: ['Français', 'Anglais'],
    tags: ['#HydrogèneVert', '#PowerToX', '#TransitionÉnergétique'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-hack-agri-2026',
    code: 'HACK-2026-AGRI',
    title: "Hackathon MSRASI: DeepTech & Solutions pour l'Agriculture Résiliente",
    shortSummary:
      '48 heures de prototypage technologique: capteurs IoT basse consommation, prédiction de stress hydrique et valorisation des sols arides du Souss-Massa.',
    description:
      'Compétition interdisciplinaire réunissant ingénieurs agronomes, data scientists et développeurs IoT autour de défis réels de gestion hydrique et télédétection satellitaire avec dotation de 60 000 MAD.',
    archetype: 'hackathon',
    category: 'Compétitions & Hackathons',
    discipline: 'agritech',
    format: 'presentiel',
    dateLabel: '08 Jan 2026',
    startDate: '2026-01-08',
    location: 'Complexe Horticole, Agadir',
    city: 'Agadir',
    capacity: 100,
    registeredCount: 70,
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.hackathonAgri,
    languages: ['Français', 'Arabe (العربية)'],
    tags: ['#AgriTech', '#IoT', '#StressHydrique'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-hack-med-2026',
    code: 'HACK-2026-MED',
    title: 'Hackathon DeepTech & Santé Digitale 2026',
    shortSummary:
      "48h Non-Stop • Concours interdisciplinaire jumelant internes en médecine et développeurs d'IA avec un prix d'amorçage de 60 000 MAD pour prototypes.",
    description:
      'Édition hivernale au Technopark de Fès dédiée au diagnostic médical assisté par vision artificielle et analyse des dossiers cliniques.',
    archetype: 'hackathon',
    category: 'Compétitions & Hackathons',
    discipline: 'biotech',
    format: 'presentiel',
    dateLabel: '15 - 17 Jan 2026',
    startDate: '2026-01-15',
    location: 'Fès • Technopark',
    city: 'Fès',
    capacity: 100,
    registeredCount: 0,
    status: 'brouillon',
    featured: false,
    imageUrl: HOTLINK_IMAGES.hackathonMed,
    languages: ['Français', 'Anglais'],
    tags: ['#SantéDigitale', '#DeepTech', '#Hackathon'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-form-q1-2026',
    code: 'FORM-2026-PUB',
    title: 'Rédaction Scientifique & Soumission dans les Revues Q1',
    shortSummary:
      "Méthodologie rigoureuse, réponses aux pairs évaluateurs, éthique de l'IA générative dans les manuscrits et critères d'indexation Scopus/WoS.",
    description:
      'Intervention de rédacteurs en chef associés IEEE & Elsevier. Attestation officielle délivrée aux doctorants inscrits.',
    archetype: 'workshop',
    category: 'Formations',
    discipline: 'ia',
    format: 'virtuel',
    dateLabel: '22 Jan 2026',
    startDate: '2026-01-22',
    location: 'Plateforme Virtuelle MSRASI (Rabat & Distanciel)',
    city: 'En ligne',
    capacity: 200,
    registeredCount: 112,
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.webinarStudio,
    languages: ['Français', 'Anglais'],
    tags: ['#PublicationQ1', '#Scopus', '#Méthodologie'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-nano-eau-2026',
    code: 'COLL-2026-EAU',
    title: 'Nanotechnologies et Traitement des Eaux au Maroc',
    shortSummary:
      'Membranes biomimétiques, désalinisation solaire et décontamination des effluents industriels par nanomatériaux actifs.',
    description:
      'Colloque International Eau & Nanotechnologies au Palais des Congrès de Tanger. Date limite des résumés : 10 Janvier 2026. Indexation dans Proceeding Scopus.',
    archetype: 'conf',
    category: 'Conférences',
    discipline: 'materiaux',
    format: 'hybride',
    dateLabel: '15 Fév 2026',
    startDate: '2026-02-15',
    location: 'Palais des Congrès, Tanger',
    city: 'Tanger',
    capacity: 250,
    registeredCount: 105,
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.wizardCover,
    doi: '10.5842/msrasi.eau.2026',
    languages: ['Français', 'Anglais'],
    tags: ['#Nanomatériaux', '#Dessalement', '#Eau'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-ompic-2026',
    code: 'B2B-2026-OMPIC',
    title: 'Rencontre Chercheurs - Industriels: Brevetabilité & Transfert',
    shortSummary:
      "Plateforme d'échanges directs B2B entre les laboratoires universitaires et les fleurons industriels nationaux pour valoriser les innovations brevetées.",
    description:
      "Sessions de Pitch, tables rondes investisseurs et atelier propriété intellectuelle co-animé avec les experts de l'OMPIC.",
    archetype: 'symposium',
    category: 'Séminaires',
    discipline: 'materiaux',
    format: 'presentiel',
    dateLabel: '05 Mars 2026',
    startDate: '2026-03-05',
    location: 'Siège OMPIC / Technopark Casablanca',
    city: 'Casablanca',
    capacity: 50,
    registeredCount: 35,
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.newsMascir,
    languages: ['Français'],
    tags: ['#Brevets', '#TransfertTech', '#OMPIC'],
    createdBy: 'msrasi-seed',
  },
  {
    id: 'evt-cisa-2024-closed',
    code: 'CISA-2024',
    title: 'CISA 2024 — Congrès International des Systèmes Avancés (Rabat)',
    shortSummary:
      'Édition 2024 clôturée avec succès : 450 congressistes, 12 orateurs internationaux et 32 doctorants primés.',
    description:
      'Actes publiés et indexés. Disponible pour consultation dans les archives scientifiques MSRASI.',
    archetype: 'conf',
    category: 'Conférences',
    discipline: 'ia',
    format: 'hybride',
    dateLabel: '12 - 14 Juin 2024',
    startDate: '2024-06-12',
    location: 'Auditorium Al Irfane, Rabat',
    city: 'Rabat',
    capacity: 450,
    registeredCount: 450,
    status: 'cloture',
    featured: false,
    imageUrl: HOTLINK_IMAGES.newsCisaRecap,
    doi: '10.5842/msrasi.cisa.2024',
    languages: ['Français', 'Anglais', 'Arabe (العربية)'],
    tags: ['#CISA2024', '#ActesScopus', '#Archives'],
    createdBy: 'msrasi-seed',
  },
];

export const SEED_ARTICLES: NewsArticle[] = [
  {
    id: 'art-hassan2-2025',
    title:
      "Accord-cadre historique signé avec l'Académie Hassan II des Sciences et Techniques pour financer 20 thèses d'excellence",
    summary:
      "Le partenariat mobilise une enveloppe pluriannuelle destinée aux équipements de pointe et à la mobilité internationale des doctorants marocains spécialisés dans la modélisation hydrologique et l'agritech.",
    content:
      "Rabat — Le Conseil Scientifique de la MSRASI a officialisé la signature d'un accord-cadre pluriannuel visant à cofinancer 20 bourses doctorales d'excellence dans les domaines stratégiques de l'eau, de l'agritech et des matériaux durables. Ce programme permet aux lauréats d'accéder aux plateformes analytiques de l'UM6P, de MAScIR et de laboratoires européens partenaires.\n\nLes candidatures seront évaluées par un jury mixte selon la rigueur méthodologique, le potentiel de brevetabilité auprès de l'OMPIC et l'alignement avec la Stratégie Nationale 2030.",
    author: 'Secrétariat Général MSRASI',
    department: 'Conseil Scientifique National',
    category: 'Partenariats',
    publishedLabel: '18 Juin 2025',
    views: 4820,
    sharesLabel: '128 partages pro',
    status: 'publie',
    featured: true,
    imageUrl: HOTLINK_IMAGES.newsPartnership,
    createdBy: 'msrasi-seed',
  },
  {
    id: 'art-mascir-um6p',
    title: "Signature d'une convention de partenariat R&D avec MascIR et l'UM6P",
    summary:
      'Mutualisation des plateformes de caractérisation nanomatériaux et création de trois chaires conjointes dédiées aux énergies propres et capteurs intelligents.',
    content:
      "La Fondation MAScIR, l'UM6P et la MSRASI unissent leurs capacités d'instrumentation et de valorisation technologique afin d'accélérer le passage de la preuve de concept au prototype pré-industriel.",
    author: 'Pr. A. Chraibi',
    department: 'Pôle Nanomatériaux & Énergie',
    category: 'Partenariats',
    publishedLabel: '18 Juin 2024',
    views: 3420,
    sharesLabel: '84 partages pro',
    status: 'publie',
    featured: true,
    imageUrl: HOTLINK_IMAGES.newsMascir,
    createdBy: 'msrasi-seed',
  },
  {
    id: 'art-cisa-2024-recap',
    title:
      'Retour en images sur le Congrès International CISA 2024 : 450 congressistes à Rabat',
    summary:
      "Clôturée ce jeudi, la 6ème édition a rassemblé plus de 450 spécialistes en intelligence artificielle, microélectronique et énergies renouvelables venus de 14 pays.",
    content:
      "Pendant trois jours, chercheurs senior, doctorants et industriels ont partagé 118 communications scientifiques dont les actes complets sont désormais accessibles via notre dépôt institutionnel avec attribution DOI.",
    author: "Comité d'Organisation CISA",
    department: 'Conversion Automatique',
    category: 'Retours sur événements',
    publishedLabel: '14 Juin 2024',
    views: 5890,
    sharesLabel: '312 téléchargements Actes',
    linkedEventCode: 'CISA-2024',
    status: 'publie',
    featured: true,
    imageUrl: HOTLINK_IMAGES.newsCisaRecap,
    createdBy: 'msrasi-seed',
  },
  {
    id: 'art-bourses-femmes-stem',
    title:
      "Lancement du programme de bourses d'excellence pour jeunes chercheuses 2025",
    summary:
      'Cinq bourses post-doctorales de 150 000 MAD attribuées à de jeunes chercheuses marocaines travaillant en intelligence artificielle et bio-ingénierie.',
    content:
      "Dans le cadre de son initiative « L'Excellence au Féminin dans les STEM », la MSRASI accompagne cinq chercheuses prometteuses avec un mentorat international et une dotation équipement.",
    author: 'Secrétariat Général MSRASI',
    department: 'Bourses & Soutien',
    category: 'Annonces officielles',
    publishedLabel: '02 Juin 2024',
    views: 11200,
    sharesLabel: '840 candidatures initiées',
    status: 'publie',
    featured: true,
    imageUrl: HOTLINK_IMAGES.newsWomenStem,
    createdBy: 'msrasi-seed',
  },
  {
    id: 'art-h2-cfp',
    title:
      "Appel à communication : Symposium National sur l'Hydrogène Vert",
    summary:
      'Indexation Scopus confirmée pour les travaux sélectionnés autour de la catalyse électrochimique et des chaînes de valeur Power-to-X au Maroc.',
    content:
      "Les auteurs sont invités à soumettre leurs résumés étendus de 2 pages au format IEEE/MSRASI avant la date limite fixée par le comité scientifique.",
    author: 'Dr. M. Tazi',
    department: 'Commission Énergies Décarbonées',
    category: 'Résultats de recherche',
    publishedLabel: '28 Mai 2024',
    views: 2180,
    sharesLabel: '42 résumés soumis',
    linkedEventCode: 'SYMP-2025-H2',
    status: 'publie',
    featured: false,
    imageUrl: HOTLINK_IMAGES.newsH2Call,
    createdBy: 'msrasi-seed',
  },
  {
    id: 'art-agronomie-draft',
    title:
      'Bilan annuel des coopérations euro-méditerranéennes en agronomie',
    summary:
      'Synthèse préliminaire des essais multi-sites sur la résilience hydrique des cultures méditerranéennes et la valorisation des sols semi-arides.',
    content:
      'Document de travail en cours de relecture par la commission Agritech & Gestion de l’Eau avant diffusion publique.',
    author: 'Dr. S. Idrissi',
    department: 'Brouillon en relecture',
    category: 'Résultats de recherche',
    publishedLabel: 'En cours',
    views: 0,
    sharesLabel: 'Non mesuré (Interne)',
    status: 'en_revue',
    featured: false,
    imageUrl: HOTLINK_IMAGES.hackathonAgri,
    createdBy: 'msrasi-seed',
  },
];

export const SEED_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'reg-0842',
    refCode: 'REF-MSRASI-2025-0842',
    eventId: 'evt-cisa-2025',
    eventTitle: 'Congrès International des Sciences Appliquées & IA (CISA 2025)',
    fullName: 'Dr. Youssef BENKIRANE',
    email: 'y.benkirane@um5.ac.ma',
    phone: '+212 661 48 92 10',
    city: 'Rabat',
    country: 'Royaume du Maroc',
    institution: 'Université Mohammed V de Rabat',
    laboratory: "Laboratoire d'Informatique & Modélisation Appliquée (LIMA)",
    academicStatus: 'enseignant',
    modality: 'onsite',
    participationRole: 'auteur_oral',
    paperTitle:
      'Deep Learning Optimization for Precision Irrigation in Arid Zones of Southern Morocco',
    track: 'Axe 1: IA, Modélisation & Vision Artificielle',
    submissionCode: 'CISA-2025-SUB-194',
    tariffLabel: 'Chercheur & Enseignant (400 MAD)',
    dietaryPreference: 'Standard (Gastronomie Marocaine & Internationale)',
    certificateType: 'Attestation de Présentation Orale & Participation',
    consentCNDP: true,
    consentMedia: true,
    status: 'valide',
  },
  {
    id: 'reg-0843',
    refCode: 'REF-MSRASI-2025-0843',
    eventId: 'evt-cisa-2025',
    eventTitle: 'Congrès International des Sciences Appliquées & IA (CISA 2025)',
    fullName: 'Dr. Nadia MANSOURI',
    email: 'nadia.mansouri@um6p.ma',
    phone: '+212 662 19 30 44',
    city: 'Ben Guerir',
    country: 'Royaume du Maroc',
    institution: 'Université Mohammed VI Polytechnique (UM6P)',
    laboratory: 'Bio-IA & Génomique Computationnelle',
    academicStatus: 'membre_msrasi',
    modality: 'onsite',
    participationRole: 'auteur_oral',
    paperTitle: 'Foundation Models for Moroccan Phytochemical Screening',
    track: 'Axe 3: Génie Biomédical & Biotechnologies',
    submissionCode: 'CISA-2025-SUB-211',
    tariffLabel: 'Membre MSRASI (Inclus / 0 MAD)',
    dietaryPreference: 'Standard',
    certificateType: 'Attestation de Présentation Orale & Participation',
    consentCNDP: true,
    consentMedia: true,
    status: 'valide',
  },
  {
    id: 'reg-0844',
    refCode: 'REF-MSRASI-2025-0844',
    eventId: 'evt-robot-2025',
    eventTitle: 'Atelier Pratique: Prototypage de Microsystèmes & Robotique Médicale',
    fullName: 'Salma EL FASSI',
    email: 's.elfassi@ensam-casa.ma',
    phone: '+212 670 81 12 05',
    city: 'Casablanca',
    country: 'Royaume du Maroc',
    institution: 'ENSAM Casablanca',
    laboratory: 'Équipe Systèmes Embarqués & Mécatronique',
    academicStatus: 'doctorant',
    modality: 'onsite',
    participationRole: 'auditeur',
    tariffLabel: 'Doctorant & Étudiant (150 MAD)',
    consentCNDP: true,
    consentMedia: true,
    status: 'valide',
  },
];

export const SEED_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    type: 'registration',
    message: 'Nouvelle inscription validée : Dr. Nadia Mansouri (UM6P) pour CISA 2025.',
    detail: 'il y a 8 min • Confirmation automatique envoyée',
    actorUid: 'msrasi-seed',
  },
  {
    id: 'log-2',
    type: 'article',
    message: 'Article d’actualité publié : « Partenariat MSRASI - MascIR ».',
    detail: 'il y a 2h • Portail public & Réseaux',
    actorUid: 'msrasi-seed',
  },
  {
    id: 'log-3',
    type: 'event',
    message: 'Mise à jour du programme : Session IA & Santé ajoutée au track 2.',
    detail: 'il y a 5h • Modifié par Secrétariat',
    actorUid: 'msrasi-seed',
  },
  {
    id: 'log-4',
    type: 'export',
    message: 'Exportation de masse : 240 badges congressistes générés au format PDF.',
    detail: 'Hier à 17:42 • Archive sécurisée',
    actorUid: 'msrasi-seed',
  },
];

export const DEFAULT_SPEAKERS: EventSpeaker[] = [
  {
    name: 'Prof. Amina Benhida',
    role: 'Directrice Recherche Bio-IA',
    affiliation: 'Université Mohammed VI Polytechnique (UM6P)',
    metric: 'H-index: 38 • 92 Pubs',
    countryCode: 'MA',
    photoUrl: HOTLINK_IMAGES.speaker1,
    fallbackPhoto: LOCAL_FALLBACK_IMAGES.conference,
  },
  {
    name: 'Dr. Karim Tazi',
    role: 'Directeur Pôle Matériaux Avancés',
    affiliation: 'Fondation MAScIR, Rabat',
    metric: '14 Brevets Déposés',
    countryCode: 'MA',
    photoUrl: HOTLINK_IMAGES.speaker2,
    fallbackPhoto: LOCAL_FALLBACK_IMAGES.energy,
  },
  {
    name: 'Prof. Sarah Dubois',
    role: 'Chercheuse Émérite Génomique',
    affiliation: 'CNRS - Unité Mixte Internationale',
    metric: 'Membre Académie des Sciences',
    countryCode: 'FR',
    photoUrl: HOTLINK_IMAGES.speaker3,
    fallbackPhoto: LOCAL_FALLBACK_IMAGES.conference,
  },
  {
    name: 'Dr. Mehdi Alami',
    role: 'Lead Scientist Deep Learning',
    affiliation: 'École Polytechnique & DeepHealth AI',
    metric: 'Lauréat Prix Innovation 2024',
    countryCode: 'MA',
    photoUrl: HOTLINK_IMAGES.speaker4,
    fallbackPhoto: LOCAL_FALLBACK_IMAGES.lab,
  },
];

export const DEFAULT_PROGRAM_DAYS: ProgramDay[] = [
  {
    id: 'j1',
    label: 'Jour 1 • 14 Oct',
    subtitle: 'Plénières & Ouverture',
    slots: [
      {
        time: '08:30 - 09:30',
        room: 'Grand Hall',
        badge: 'Accueil',
        title: 'Émargement, remise des sacoches de congrès & café de bienvenue',
        speaker: "Installation des posters scientifiques dans l'aile sud.",
        accent: 'primary',
      },
      {
        time: '09:30 - 11:00',
        room: 'Amphi Principal',
        badge: 'Inauguration',
        title: "Cérémonie Officielle & Discours d'Orientation",
        speaker:
          'Allocution de bienvenue du Conseil Scientifique MSRASI et représentants ministériels.',
        accent: 'secondary',
      },
      {
        time: '11:30 - 13:00',
        room: 'Plénière A',
        badge: 'Keynote 1',
        title:
          "L'IA générative dans la découverte de nouveaux composés bio-actifs marocains",
        speaker: 'Prof. Amina Benhida (UM6P) — Modération : Dr. Mehdi Alami.',
        accent: 'tertiary',
      },
    ],
  },
  {
    id: 'j2',
    label: 'Jour 2 • 15 Oct',
    subtitle: 'Sessions & Industrie',
    slots: [
      {
        time: '09:00 - 12:30',
        room: 'Salles 1 à 4',
        badge: 'Sessions Parallèles',
        title: 'Communications Orales & Valorisation de Brevets',
        speaker:
          '42 présentations orales évaluées par le comité de lecture international.',
        accent: 'primary',
      },
      {
        time: '14:30 - 16:30',
        room: 'Amphi B',
        badge: 'Table Ronde',
        title: 'Synergie Universités - Industrie DeepTech en Afrique du Nord',
        speaker:
          'Débat avec la CGEM, MascIR et les directeurs de pôles technologiques.',
        accent: 'tertiary',
      },
    ],
  },
  {
    id: 'j3',
    label: 'Jour 3 • 16 Oct',
    subtitle: 'Posters & Prix MSRASI',
    slots: [
      {
        time: '10:00 - 12:30',
        room: 'Amphi Principal',
        badge: 'Gala & Prix',
        title: "Remise des Prix d'Excellence MSRASI & Thèses d'Or 2025",
        speaker:
          "Dotation totale de 150 000 MAD attribuée aux 3 meilleurs projets d'application brevétables.",
        accent: 'secondary',
      },
      {
        time: '14:00 - 15:30',
        room: 'Plénière',
        badge: 'Clôture',
        title: 'Lecture du Manifeste de Rabat & Feuille de route 2026',
        speaker:
          "Restitution des recommandations pour le Ministère de l'Enseignement Supérieur.",
        accent: 'primary',
      },
    ],
  },
];

export const DEFAULT_TARIFF_TIERS: TariffTier[] = [
  {
    id: 'membre',
    title: 'Membre MSRASI',
    subtitle: 'Cotisation 2025 à jour',
    priceLabel: 'Inclus / 0 MAD',
    accent: 'primary',
  },
  {
    id: 'chercheur',
    title: 'Chercheur & Enseignant',
    subtitle: 'Universités & Instituts',
    priceLabel: '400 MAD',
    accent: 'dark',
  },
  {
    id: 'doctorant',
    title: 'Doctorant & Étudiant',
    subtitle: 'Justificatif requis',
    priceLabel: '150 MAD',
    badge: '-50% Subventionné',
    accent: 'secondary',
  },
  {
    id: 'industriel',
    title: 'Industriel & Entreprise',
    subtitle: 'Plein tarif R&D',
    priceLabel: '1 000 MAD',
    accent: 'dark',
  },
];
