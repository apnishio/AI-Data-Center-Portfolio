import { UniverseCandidate } from '../types';

export const UNIVERSE_CANDIDATES: UniverseCandidate[] = [
  // 1. Optics & Networking (7 candidates)
  {
    ticker: 'GLW',
    company: 'Corning Inc.',
    cluster: 'Optics & Networking',
    role: 'Optical fiber and connectivity for datacenter interconnects',
  },
  {
    ticker: 'COHR',
    company: 'Coherent Corp.',
    cluster: 'Optics & Networking',
    role: 'Optical transceivers and photonics for AI networking',
  },
  {
    ticker: 'LITE',
    company: 'Lumentum Holdings',
    cluster: 'Optics & Networking',
    role: 'Optical components and lasers for datacom',
  },
  {
    ticker: 'ANET',
    company: 'Arista Networks',
    cluster: 'Optics & Networking',
    role: 'High-speed Ethernet switching for hyperscaler datacenters',
  },
  {
    ticker: 'CIEN',
    company: 'Ciena Corp.',
    cluster: 'Optics & Networking',
    role: 'Optical transport and routing between datacenters',
  },
  {
    ticker: 'FN',
    company: 'Fabrinet',
    cluster: 'Optics & Networking',
    role: 'Contract manufacturer of optical modules',
  },
  {
    ticker: 'AAOI',
    company: 'Applied Optoelectronics',
    cluster: 'Optics & Networking',
    role: 'Datacenter optical transceivers',
  },

  // 2. Electrical & Power Mgmt (5 candidates)
  {
    ticker: 'ETN',
    company: 'Eaton Corp.',
    cluster: 'Electrical & Power Mgmt',
    role: 'Power distribution and management for datacenters',
  },
  {
    ticker: 'VRT',
    company: 'Vertiv Holdings',
    cluster: 'Electrical & Power Mgmt',
    role: 'Power and cooling infrastructure, datacenter-focused',
  },
  {
    ticker: 'NVT',
    company: 'nVent Electric',
    cluster: 'Electrical & Power Mgmt',
    role: 'Electrical enclosures, liquid cooling connection systems',
  },
  {
    ticker: 'HUBB',
    company: 'Hubbell Inc.',
    cluster: 'Electrical & Power Mgmt',
    role: 'Electrical and utility solutions, grid hardening',
  },
  {
    ticker: 'GEV',
    company: 'GE Vernova',
    cluster: 'Electrical & Power Mgmt',
    role: 'Grid equipment and power generation technology',
  },

  // 3. Semiconductors (non-GPU) (5 candidates)
  {
    ticker: 'AVGO',
    company: 'Broadcom',
    cluster: 'Semiconductors (non-GPU)',
    role: 'Custom AI accelerators and networking silicon',
  },
  {
    ticker: 'MRVL',
    company: 'Marvell Technology',
    cluster: 'Semiconductors (non-GPU)',
    role: 'Datacenter interconnect and custom silicon',
  },
  {
    ticker: 'MPWR',
    company: 'Monolithic Power Systems',
    cluster: 'Semiconductors (non-GPU)',
    role: 'Power management ICs, efficiency focus',
  },
  {
    ticker: 'ALAB',
    company: 'Astera Labs',
    cluster: 'Semiconductors (non-GPU)',
    role: 'Connectivity silicon for AI servers',
  },
  {
    ticker: 'CRDO',
    company: 'Credo Technology',
    cluster: 'Semiconductors (non-GPU)',
    role: 'High-speed connectivity solutions',
  },

  // 4. Power Generation (low-carbon) (6 candidates)
  {
    ticker: 'CEG',
    company: 'Constellation Energy',
    cluster: 'Power Generation (low-carbon)',
    role: 'Largest US nuclear fleet; carbon-free PPAs with hyperscalers',
  },
  {
    ticker: 'NEE',
    company: 'NextEra Energy',
    cluster: 'Power Generation (low-carbon)',
    role: 'Renewables and nuclear; rate-sensitive utility profile',
  },
  {
    ticker: 'VST',
    company: 'Vistra Corp.',
    cluster: 'Power Generation (low-carbon)',
    role: 'Nuclear plus gas mix; gas share flagged for the green tilt',
  },
  {
    ticker: 'BE',
    company: 'Bloom Energy',
    cluster: 'Power Generation (low-carbon)',
    role: 'Fuel cells for onsite datacenter power',
  },
  {
    ticker: 'FSLR',
    company: 'First Solar',
    cluster: 'Power Generation (low-carbon)',
    role: 'Utility-scale solar serving datacenter PPAs',
  },
  {
    ticker: 'TLN',
    company: 'Talen Energy',
    cluster: 'Power Generation (low-carbon)',
    role: 'Nuclear-powered datacenter supply agreements',
  },

  // 5. Datacenter REITs & Thermal/Build (7 candidates)
  {
    ticker: 'EQIX',
    company: 'Equinix',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Datacenter REIT; substantial renewable procurement',
  },
  {
    ticker: 'DLR',
    company: 'Digital Realty',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Datacenter REIT; renewable programs',
  },
  {
    ticker: 'FIX',
    company: 'Comfort Systems USA',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Mechanical and electrical contractor building datacenters',
  },
  {
    ticker: 'TT',
    company: 'Trane Technologies',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'HVAC and thermal management; efficiency focus',
  },
  {
    ticker: 'MOD',
    company: 'Modine Manufacturing',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Datacenter cooling systems',
  },
  {
    ticker: 'IRM',
    company: 'Iron Mountain',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Datacenter segment within storage REIT',
  },
  {
    ticker: 'EME',
    company: 'EMCOR Group',
    cluster: 'Datacenter REITs & Thermal/Build',
    role: 'Electrical and mechanical construction incl. datacenters',
  },
];

export const CANDIDATE_UNIVERSE = UNIVERSE_CANDIDATES;
