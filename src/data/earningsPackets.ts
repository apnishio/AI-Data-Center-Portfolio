/**
 * QUARTERLY PACKET FILE. To update: for each ticker, paste 3–6 verbatim sentences
 * of forward-looking language from the company's most recent earnings call or earnings
 * press release, set callDate to the actual call date, set isPlaceholder to false,
 * and set sourceNote to the document title and date. Do not paraphrase; the X1
 * classifier requires verbatim source text.
 */

export interface EarningsPacket {
  callDate: string;
  sourceNote: string;
  text: string;
  isPlaceholder: boolean;
}

export const EARNINGS_PACKETS: Record<string, EarningsPacket> = {
  // 1. Optics & Networking (7 candidates)
  GLW: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Enterprise optical sales for AI datacenter buildouts grew 42% year-over-year. We continue to see robust forward order books for our ultra-high-density cabling and see strong multi-year visibility through 2027 with our major cloud partners.',
    isPlaceholder: true,
  },
  COHR: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Datacom revenues surged on 800G and 1.6T transceiver demand. While aggregate demand remains elevated, transceiver cycle transitions remain healthy across hyperscaler architectures.',
    isPlaceholder: true,
  },
  LITE: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Cloud data center revenue expanded rapidly. Our continuous-wave laser solutions for co-packaged optics and high-speed EMLs are experiencing unprecedented customer engagement.',
    isPlaceholder: true,
  },
  ANET: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'We are raising our full year 2026 revenue growth expectations to 28%. AI networking ethernet clusters are scaling rapidly with Tier-1 cloud titans and sovereign AI deployments.',
    isPlaceholder: true,
  },
  CIEN: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Direct cloud provider interconnect demand continues to accelerate as datacenters decentralize across regional clusters to satisfy power availability constraints.',
    isPlaceholder: true,
  },
  FN: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Optical packaging and assembly volumes for next-generation optical engines achieved record run-rates, reflecting high utilization across our manufacturing facilities.',
    isPlaceholder: true,
  },
  AAOI: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Customer ramp on 400G and 800G transceivers has initiated strongly. Production yields in our automated lines are steadily improving to meet contracted allocations.',
    isPlaceholder: true,
  },

  // 2. Electrical & Power Mgmt (5 candidates)
  ETN: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Data center and distributed IT backlog reached another historic high of $11.4 billion. Power distribution equipment lead times remain extended through late 2027.',
    isPlaceholder: true,
  },
  VRT: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Organic orders increased 35% driven by high-density liquid cooling deployments and integrated switchgear. We are raising our full year adjusted operating profit outlook.',
    isPlaceholder: true,
  },
  NVT: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Liquid cooling manifolds, quick disconnects, and specialized enclosure solutions are expanding across both new builds and retrofit facilities.',
    isPlaceholder: true,
  },
  HUBB: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Utility grid modernization contracts to connect incoming megawatt-scale datacenter substations are sustaining steady double-digit booking growth.',
    isPlaceholder: true,
  },
  GEV: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Electrification and grid software demand is accelerating as utilities race to support high-density power interconnect queues for computational clusters.',
    isPlaceholder: true,
  },

  // 3. Semiconductors (non-GPU) (5 candidates)
  AVGO: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'AI revenue reached $3.8 billion this quarter. Tomahawk 5 and Jericho 3-AI switches alongside custom XPUs for hyperscalers are driving accelerating gross margins.',
    isPlaceholder: true,
  },
  MRVL: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Custom AI silicon compute programs and optical DSP interconnects are on track for significant sequential expansion over the next four quarters.',
    isPlaceholder: true,
  },
  MPWR: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Enterprise data power solutions are seeing high adoption as AI accelerator modules demand higher current density and digital multiphase controllers.',
    isPlaceholder: true,
  },
  ALAB: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Aries PCIe/CXL retimers and Taurus Ethernet smart cable modules are being designed into every major Tier-1 AI accelerator platform.',
    isPlaceholder: true,
  },
  CRDO: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Active Electrical Cables (AEC) are displacing passive copper at 800G and 1.6T server-to-switch interfaces, expanding our total addressable footprint.',
    isPlaceholder: true,
  },

  // 4. Power Generation (low-carbon) (6 candidates)
  CEG: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'We signed landmark long-term clean power purchase agreements matching baseload nuclear generation with dedicated hyperscaler campus developments.',
    isPlaceholder: true,
  },
  NEE: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Renewables development backlog expanded by 3,000 MW, with data center customers representing over half of new renewable generation signings.',
    isPlaceholder: true,
  },
  VST: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Comanche Peak nuclear facility and dispatchable flexible generation assets are seeing attractive merchant capacity pricing from high-load industrial consumers.',
    isPlaceholder: true,
  },
  BE: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Solid oxide fuel cell server installations are solving urgent grid-delay bottlenecks, enabling hyperscalers to bring online AI capacity 18 months ahead of utility connection.',
    isPlaceholder: true,
  },
  FSLR: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Our contracted backlog extends through 2030, anchored by domestic technology and utility customers investing in carbon-free energy pledges.',
    isPlaceholder: true,
  },
  TLN: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'The Susquehanna nuclear co-located data center campus continues its phased ramp, providing dedicated zero-carbon 24/7 power to our cloud partner.',
    isPlaceholder: true,
  },

  // 5. Datacenter REITs & Thermal/Build (7 candidates)
  EQIX: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Interconnection revenues and xScale hyperscaler joint-venture expansions are tracking ahead of schedule with 96% renewable energy coverage achieved globally.',
    isPlaceholder: true,
  },
  DLR: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: '0-to-100MW campus bookings achieved record leasing velocity with weighted average lease terms exceeding 10 years and contracted power escalators.',
    isPlaceholder: true,
  },
  FIX: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Modular offsite prefabrication for modular data center mechanical and electrical rooms reached $6.2 billion in total committed backlog.',
    isPlaceholder: true,
  },
  TT: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Applied commercial chillers and ultra-efficient cooling infrastructure for high-density compute facilities posted strong 30%+ bookings expansion.',
    isPlaceholder: true,
  },
  MOD: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Airedale by Modine data center chillers, fan walls, and liquid cooling distribution units continue to experience robust global order volume.',
    isPlaceholder: true,
  },
  IRM: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Data center leasing surpassed 130 MW for the trailing 12 months with high-margin colocation and hyperscaler absorption in Northern Virginia and Frankfurt.',
    isPlaceholder: true,
  },
  EME: {
    callDate: 'Q2 2026',
    sourceNote: "ILLUSTRATIVE PLACEHOLDER — not an actual company statement. Replace with a verbatim excerpt from the company's most recent earnings release.",
    text: 'Electrical construction and mechanical services for hyperscale campus builds drove record quarterly operating margins and healthy project visibility.',
    isPlaceholder: true,
  },
};
