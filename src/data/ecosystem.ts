import { EcosystemItem, StudioPrinciple } from '@/types';

export const ECOSYSTEM_INITIATIVES: EcosystemItem[] = [
  {
    id: 'bros',
    name: 'B.R.O.S.',
    tagline: {
      en: 'Autonomous operations and system intelligence framework.',
      id: 'Kerangka kerja operasi mandiri dan kecerdasan sistem.'
    },
    description: {
      en: 'An operational backbone engineered for managing autonomous workflows, structured execution, and multi-agent coordination.',
      id: 'Fondasi operasional yang dirancang untuk mengelola alur kerja mandiri, eksekusi terstruktur, dan koordinasi multi-agen.'
    },
    status: 'project',
    category: 'software',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: true,
    order: 1,
    updatedAt: '2026-08-15'
  },
  {
    id: 'roast-navigator',
    name: 'Roast Navigator',
    tagline: {
      en: 'Sensory and roast curve tracking platform for specialty coffee.',
      id: 'Platform pelacakan kurva sangrai dan evaluasi sensorik kopi spesialti.'
    },
    description: {
      en: 'A specialized digital system designed to evaluate roast kinetics, thermal trajectories, and sensory profiles.',
      id: 'Sistem digital khusus untuk mengevaluasi kinetika sangrai, trajektori termal, dan profil sensorik rasa.'
    },
    status: 'project',
    category: 'digital-system',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: true,
    order: 2,
    updatedAt: '2026-08-20'
  },
  {
    id: 'beauty-batch-os',
    name: 'Beauty Batch OS',
    tagline: {
      en: 'Formulation, compliance, and batch management system.',
      id: 'Sistem manajemen formulasi, kepatuhan, dan produksi batch kosmetik.'
    },
    description: {
      en: 'An operating framework engineered for cosmetic formulation labs to manage recipes, batch records, and ingredient inventory.',
      id: 'Kerangka kerja operasional untuk laboratorium kosmetik dalam mengelola formula, catatan batch, dan inventaris bahan baku.'
    },
    status: 'project',
    category: 'software',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: true,
    commercial: {
      pricingType: 'custom',
      badgeLabel: {
        en: 'Commercial Candidate',
        id: 'Kandidat Komersial'
      }
    },
    order: 3,
    updatedAt: '2026-08-22'
  },
  {
    id: 'skill-factory',
    name: 'Nalakara Skill Factory',
    tagline: {
      en: 'Modular agent skill synthesis and capability training pipeline.',
      id: 'Alur sintesis kemampuan dan pelatihan keterampilan agen AI modular.'
    },
    description: {
      en: 'A systematic lab environment for creating, benchmarking, and distributing specialized agent capabilities and domain toolkits.',
      id: 'Lingkungan riset sistematis untuk merancang, menguji tolok ukur, dan mendistribusikan keahlian agen AI serta toolkit khusus.'
    },
    status: 'lab',
    category: 'experimental',
    accessModel: 'private-alpha',
    targetUrl: undefined,
    isExternal: false,
    featured: false,
    order: 4,
    updatedAt: '2026-08-10'
  }
];

export const STUDIO_PRINCIPLES: StudioPrinciple[] = [
  {
    number: '01',
    title: {
      en: 'Domain Independence',
      id: 'Independensi Lintas Ranah'
    },
    description: {
      en: 'Ideas are not restricted to a single industrial or technological vertical. We apply systemic thinking across digital software, physical instruments, and operational frameworks.',
      id: 'Gagasan tidak dibatasi oleh satu bidang industri atau teknologi tertentu. Kami menerapkan pola pikir sistemik pada perangkat lunak digital, instrumen fisik, dan kerangka kerja operasional.'
    }
  },
  {
    number: '02',
    title: {
      en: 'Utility Over Novelty',
      id: 'Fungsi di Atas Kebaruan Semu'
    },
    description: {
      en: 'We do not build purely decorative demonstrations. Every artifact originating from the foundry must perform real, verifiable work and solve concrete problems.',
      id: 'Kami tidak membuat karya yang sekadar demonstrasi dekoratif. Setiap karya yang lahir dari studio harus berfungsi nyata, teruji, dan memecahkan masalah konkret.'
    }
  },
  {
    number: '03',
    title: {
      en: 'Autonomous Product Identity',
      id: 'Identitas Produk yang Mandiri'
    },
    description: {
      en: 'Individual initiatives earn their own dedicated visual identities, distinct subdomains, and tailored user experiences rather than being forced into a uniform corporate template.',
      id: 'Setiap inisiatif memiliki identitas visual tersendiri, subdomain khusus, dan pengalaman pengguna yang disesuaikan—bukan dipaksakan ke dalam template korporat yang seragam.'
    }
  },
  {
    number: '04',
    title: {
      en: 'Disciplined Lifecycle Evolution',
      id: 'Evolusi Siklus Hidup yang Disiplin'
    },
    description: {
      en: 'Initiatives graduate deliberately through five verifiable states: Idea → Lab → Project → Product → Commercial. Progression requires stability, utility, and real-world validation.',
      id: 'Inisiatif bertumbuh secara bertahap melalui lima fase terukur: Gagasan → Lab → Proyek → Produk → Komersial. Setiap kemajuan membutuhkan stabilitas, kegunaan, dan validasi nyata.'
    }
  }
];

export const STUDIO_META = {
  name: 'NALAKARA',
  est: '2026',
  email: 'contact@nalakara.com',
  github: 'https://github.com/nalakara'
};
