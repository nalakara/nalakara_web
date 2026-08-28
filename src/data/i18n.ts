import { Language } from '@/types';

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
    skipToContent: string;
  };
  header: {
    logoAria: string;
    status: string;
    nav: {
      initiatives: string;
      registry: string;
      philosophy: string;
      about: string;
    };
    languageToggleAria: string;
  };
  hero: {
    tag: string;
    headline: string;
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    lifecycleTitle: string;
    stages: {
      idea: string;
      lab: string;
      project: string;
      product: string;
      commercial: string;
    };
  };
  foundryField: {
    fieldTag: string;
    stagesTag: string;
    ariaLabel: string;
    stages: {
      idea: string;
      lab: string;
      project: string;
      product: string;
      commercial: string;
    };
  };
  initiatives: {
    tag: string;
    title: string;
    lead: string;
  };
  registry: {
    tag: string;
    title: string;
    lead: string;
    tabs: {
      all: { label: string; description: string; aria: string };
      building: { label: string; description: string; aria: string };
      usable: { label: string; description: string; aria: string };
      commercial: { label: string; description: string; aria: string };
    };
    emptyState: string;
  };
  itemCard: {
    inFoundry: string;
    visit: string;
    stagePrefix: string;
    categories: {
      software: string;
      'digital-system': string;
      'physical-good': string;
      service: string;
      experimental: string;
    };
    accessModels: {
      concept: string;
      'private-alpha': string;
      'public-beta': string;
      production: string;
      commercial: string;
    };
    commercialCandidate: string;
  };
  philosophy: {
    tag: string;
    title: string;
    lead: string;
  };
  footer: {
    desc: string;
    originFootnote: string;
    colCoordinates: string;
    locationLabel: string;
    locationValue: string;
    emailLabel: string;
    colInitiatives: string;
    colSystem: string;
    backToTop: string;
    rights: string;
    tagline: string;
  };
}

export const DICTIONARY: Record<Language, TranslationDictionary> = {
  en: {
    meta: {
      title: 'NALAKARA · Studio & Foundry',
      description: 'A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.',
      skipToContent: 'Skip to main content'
    },
    header: {
      logoAria: 'Nalakara · Home',
      status: 'Foundry Active',
      nav: {
        initiatives: 'Initiatives',
        registry: 'Registry',
        philosophy: 'Philosophy',
        about: 'About'
      },
      languageToggleAria: 'Select language'
    },
    hero: {
      tag: 'Ecosystem & Discovery',
      headline: 'A studio and foundry that turns ideas into useful things.',
      subhead: 'Nalakara is an autonomous ecosystem where ideas, experiments, systems, and products evolve across different domains: from intelligence frameworks and specialty instruments to domain operating systems.',
      primaryCta: 'Explore Registry',
      secondaryCta: 'Studio Philosophy',
      lifecycleTitle: 'Lifecycle Stages:',
      stages: {
        idea: '01 Idea',
        lab: '02 Lab',
        project: '03 Project',
        product: '04 Product',
        commercial: '05 Commercial'
      }
    },
    foundryField: {
      fieldTag: 'FOUNDRY FIELD',
      stagesTag: 'LIFECYCLE / 05 STAGES',
      ariaLabel: 'Foundry Tensor Field: Interactive structural visualization of ecosystem lifecycle states.',
      stages: {
        idea: '01 Idea',
        lab: '02 Lab',
        project: '03 Project',
        product: '04 Product',
        commercial: '05 Commercial'
      }
    },
    initiatives: {
      tag: 'In The Foundry',
      title: 'Current Initiatives',
      lead: 'Curated active developments, stable utilities, and commercial systems across the ecosystem.'
    },
    registry: {
      tag: 'Ecosystem Index',
      title: 'The Registry',
      lead: 'A unified taxonomy of ideas, experiments, software, and commercial offerings.',
      tabs: {
        all: {
          label: 'All Items',
          description: 'Complete ecosystem registry spanning all lifecycle stages.',
          aria: 'Show all initiatives'
        },
        building: {
          label: "Things We're Building",
          description: 'Exploratory ideas, internal lab experiments, and projects under active development.',
          aria: 'Show in-development initiatives'
        },
        usable: {
          label: 'Things You Can Use',
          description: 'Stable, public utilities ready for direct end-user deployment and access.',
          aria: 'Show production-ready products'
        },
        commercial: {
          label: 'Things You Can Buy',
          description: 'Commercial platforms, production licenses, and professional studio offerings.',
          aria: 'Show commercially available offerings'
        }
      },
      emptyState: 'No initiatives currently indexed under this filter.'
    },
    itemCard: {
      inFoundry: 'In Foundry',
      visit: 'Visit Initiative',
      stagePrefix: 'Stage:',
      categories: {
        software: 'software',
        'digital-system': 'digital system',
        'physical-good': 'physical good',
        service: 'service',
        experimental: 'experimental'
      },
      accessModels: {
        concept: 'concept',
        'private-alpha': 'private alpha',
        'public-beta': 'public beta',
        production: 'production',
        commercial: 'commercial'
      },
      commercialCandidate: 'Commercial Candidate'
    },
    philosophy: {
      tag: 'Foundational Axioms',
      title: 'Studio Principles',
      lead: 'The architectural, design, and operational values that govern how we build.'
    },
    footer: {
      desc: 'A studio and foundry that turns ideas into useful things across software, physical instruments, and digital systems.',
      originFootnote: 'Rooted in the Sanskrit terms Nala (consciousness, intellect) and Kara (maker, crafter), Nalakara represents conscious creation—building technology that expands human agency and intuition.',
      colCoordinates: 'Coordinates',
      locationLabel: 'Location',
      locationValue: 'Studio / Decentralized',
      emailLabel: 'Email',
      colInitiatives: 'Initiatives',
      colSystem: 'System',
      backToTop: 'Back to Top',
      rights: '© 2026 NALAKARA. All rights reserved.',
      tagline: 'Autonomous Foundry Architecture'
    }
  },
  id: {
    meta: {
      title: 'NALAKARA · Studio & Ruang Cipta',
      description: 'Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata pada perangkat lunak, instrumen fisik, dan sistem digital.',
      skipToContent: 'Lompat ke konten utama'
    },
    header: {
      logoAria: 'Nalakara · Beranda',
      status: 'Studio Aktif',
      nav: {
        initiatives: 'Inisiatif',
        registry: 'Katalog',
        philosophy: 'Filosofi',
        about: 'Tentang'
      },
      languageToggleAria: 'Pilih bahasa'
    },
    hero: {
      tag: 'Ekosistem & Penjelajahan',
      headline: 'Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata berdaya guna.',
      subhead: 'Nalakara adalah ekosistem mandiri tempat bertumbuhnya ide, eksperimen, sistem, dan produk lintas ranah: mulai dari kerangka kecerdasan buatan dan instrumen khusus hingga sistem operasi industri.',
      primaryCta: 'Jelajahi Katalog',
      secondaryCta: 'Filosofi Studio',
      lifecycleTitle: 'Tahapan Siklus Hidup:',
      stages: {
        idea: '01 Gagasan',
        lab: '02 Lab',
        project: '03 Proyek',
        product: '04 Produk',
        commercial: '05 Komersial'
      }
    },
    foundryField: {
      fieldTag: 'MEDAN CIPTA (FOUNDRY FIELD)',
      stagesTag: 'SIKLUS HIDUP / 05 TAHAP',
      ariaLabel: 'Medan Cipta (Foundry Field): Visualisasi interaktif struktur tahapan siklus hidup ekosistem.',
      stages: {
        idea: '01 Gagasan',
        lab: '02 Lab',
        project: '03 Proyek',
        product: '04 Produk',
        commercial: '05 Komersial'
      }
    },
    initiatives: {
      tag: 'Dalam Ruang Cipta',
      title: 'Inisiatif Saat Ini',
      lead: 'Karya pilihan dalam pengembangan aktif, sistem operasional, dan teknologi komersial di seluruh ekosistem.'
    },
    registry: {
      tag: 'Daftar Inventaris Ekosistem',
      title: 'Katalog Ekosistem',
      lead: 'Taksonomi terpadu yang memetakan gagasan, riset lab, perangkat lunak, dan karya komersial.',
      tabs: {
        all: {
          label: 'Semua Karya',
          description: 'Katalog ekosistem menyeluruh yang mencakup seluruh tahapan siklus hidup.',
          aria: 'Tampilkan semua inisiatif'
        },
        building: {
          label: 'Dalam Perancangan',
          description: 'Gagasan eksploratif, eksperimen internal lab, dan proyek dalam tahap pengembangan aktif.',
          aria: 'Tampilkan inisiatif dalam tahap perancangan'
        },
        usable: {
          label: 'Siap Digunakan',
          description: 'Karya dan utilitas publik yang stabil, siap diakses dan digunakan langsung.',
          aria: 'Tampilkan produk siap pakai'
        },
        commercial: {
          label: 'Layanan Komersial',
          description: 'Platform komersial, lisensi produksi, dan penawaran profesional dari studio.',
          aria: 'Tampilkan layanan komersial'
        }
      },
      emptyState: 'Belum ada inisiatif yang terdaftar dalam kategori ini.'
    },
    itemCard: {
      inFoundry: 'Dalam Perancangan',
      visit: 'Kunjungi Inisiatif',
      stagePrefix: 'Tahap:',
      categories: {
        software: 'perangkat lunak',
        'digital-system': 'sistem digital',
        'physical-good': 'produk fisik',
        service: 'layanan',
        experimental: 'eksperimental'
      },
      accessModels: {
        concept: 'konsep',
        'private-alpha': 'akses terbatas (alpha)',
        'public-beta': 'beta publik',
        production: 'produksi',
        commercial: 'komersial'
      },
      commercialCandidate: 'Kandidat Komersial'
    },
    philosophy: {
      tag: 'Aksioma Dasar',
      title: 'Prinsip Studio',
      lead: 'Nilai-nilai arsitektural, desain, dan operasional yang mendasari cara kami berkarya.'
    },
    footer: {
      desc: 'Studio dan ruang cipta yang mewujudkan gagasan menjadi karya nyata pada perangkat lunak, instrumen fisik, dan sistem digital.',
      originFootnote: 'Berakar dari kata Sanskerta Nala (kesadaran, akal) dan Kara (pembentuk, pencipta), Nalakara bermakna menciptakan teknologi secara sadar dan bermakna untuk memperluas daya cipta serta intuisi manusia.',
      colCoordinates: 'Koordinat',
      locationLabel: 'Lokasi',
      locationValue: 'Studio / Terdesentralisasi',
      emailLabel: 'Email',
      colInitiatives: 'Inisiatif',
      colSystem: 'Sistem',
      backToTop: 'Kembali ke Atas',
      rights: '© 2026 NALAKARA. Hak cipta dilindungi.',
      tagline: 'Arsitektur Ruang Cipta Mandiri'
    }
  }
};
