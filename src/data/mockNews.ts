/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryMeta, NewsArticle, CurrentAffairsFact, DailyQuiz } from '../types/news';

export const CATEGORIES_LIST: CategoryMeta[] = [
  {
    id: 'national',
    label: 'National Affairs',
    shortLabel: 'National',
    iconName: 'Building2',
    accentColor: '#0071E3',
    description: 'Domestic policy, infrastructure, governance reforms & statutory decisions',
  },
  {
    id: 'international',
    label: 'International & Global',
    shortLabel: 'Global',
    iconName: 'Globe2',
    accentColor: '#5856D6',
    description: 'Bilateral treaties, multilateral summits, geopolitics & foreign relations',
  },
  {
    id: 'economy',
    label: 'Economy & Finance',
    shortLabel: 'Economy',
    iconName: 'TrendingUp',
    accentColor: '#10B981',
    description: 'Fiscal policies, central bank interest decisions, trade indices & markets',
  },
  {
    id: 'science-tech',
    label: 'Science & Technology',
    shortLabel: 'Tech & Sci',
    iconName: 'Cpu',
    accentColor: '#8B5CF6',
    description: 'Artificial intelligence governance, space exploration, biotech & semiconductors',
  },
  {
    id: 'defence',
    label: 'Defence & Security',
    shortLabel: 'Defence',
    iconName: 'ShieldAlert',
    accentColor: '#0284C7',
    description: 'Joint military exercises, air defence indigenous trials & maritime security',
  },
  {
    id: 'environment',
    label: 'Environment & Climate',
    shortLabel: 'Climate',
    iconName: 'Leaf',
    accentColor: '#00A896',
    description: 'Renewable energy milestones, COP targets, biodiversity & carbon accords',
  },
  {
    id: 'government',
    label: 'Government & Policy',
    shortLabel: 'Govt & Law',
    iconName: 'FileText',
    accentColor: '#F59E0B',
    description: 'Parliamentary enactments, constitutional rulings & citizen digital frameworks',
  },
  {
    id: 'education',
    label: 'Education & Schemes',
    shortLabel: 'Education',
    iconName: 'GraduationCap',
    accentColor: '#6366F1',
    description: 'National education policy, scholarship programs & research fellowships',
  },
  {
    id: 'sports',
    label: 'Sports & Athletics',
    shortLabel: 'Sports',
    iconName: 'Trophy',
    accentColor: '#F43F5E',
    description: 'Championships, athletic records, tournament rankings & youth games',
  },
  {
    id: 'events',
    label: 'Summits & Events',
    shortLabel: 'Events',
    iconName: 'CalendarCheck',
    accentColor: '#EC4899',
    description: 'Conclaves, bilateral summits, global forums & annual ministerial meets',
  },
];

export const BREAKING_NEWS_TICKER: string[] = [
  'Central Bank unveils Universal Digital Currency Cross-Border Settlement Protocol with 14 partner economies.',
  'Deep Space Exploration Agency confirms successful orbital docking of Lunar Base Module 3.',
  'International Renewable Energy Summit adopts binding 2030 Grid Decarbonisation Accord in Vienna.',
  'Supreme Court upholds Digital Citizen Charter establishing real-time statutory service guarantees.',
  'Unified Semiconductor Mission inaugurates 3nm Commercial Fab facility with $12B capacity.',
];

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'art-01',
    headline: 'Global Sovereign Green Bond Framework Reaches $1.2 Trillion Record Across 45 Nations',
    summary: 'The United Nations Environment Programme and major central banks have published the harmonized 2026 taxonomy for sovereign green bonds, unlocking unprecedented institutional liquidity.',
    content: `The global market for sovereign environmental financing has achieved a monumental milestone, surpassing $1.2 trillion in active issuance across 45 participating nations. The framework, formally adopted during the Vienna Ministerial Summit, establishes stringent carbon-accounting benchmarks and audits for climate resilience infrastructure.

Under the new directives, issuing treasuries must provide verified satellite telemetry and third-party algorithmic carbon reduction tracking every six months. Funds are strictly earmarked for zero-emission intercity rail corridors, next-generation offshore wind transmission arrays, and decentralized battery energy storage stations.

"This is no longer ceremonial green finance," remarked Dr. Helena Vane, Chief Economist at the International Climate Finance Board. "Every dollar committed under this 2026 taxonomy is mathematically bound to tangible carbon abatement metrics."

Emerging markets have captured over 38% of the latest allocations, marking a decisive shift away from high-interest conventional borrowing towards standardized green debt with concessionary rate spreads.`,
    category: 'economy',
    categoryLabel: 'Economy & Finance',
    source: 'Financial Times & UNEP Wire',
    sourceUrl: 'https://www.ft.com',
    publishedAt: '2026-09-23T07:15:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    isBreaking: true,
    isFeatured: true,
    keyFacts: [
      'Total sovereign green debt outstanding crossed $1.2 Trillion across 45 economies.',
      'Mandatory satellite telemetry verification required biannually for funded projects.',
      'Emerging economies accounted for 38% of sovereign green issuance in Q3 2026.',
      'Framework establishes standardized concessionary spread mechanisms of 25-40 basis points.'
    ],
    tags: ['Green Bonds', 'Central Banks', 'Climate Finance', 'Vienna Accord', 'Economy'],
    author: 'Elena Rostova, Senior Finance Analyst'
  },
  {
    id: 'art-02',
    headline: 'International AI Safety Directorate Establishes Autonomous Systems Verification Standard',
    summary: 'Delegates from 62 countries have ratified the Geneva Protocol on Frontier AI Systems, mandating strict sandboxing, mathematical safety proofs, and red-team audits before public deployment.',
    content: `In a landmark multilateral consensus, representatives from 62 global governments and leading computer science research institutions concluded the Geneva Conference on Synthetic Cognition with a binding regulatory charter.

The charter mandates that any foundational intelligence model exceeding $10^{26}$ computational operations must undergo rigorous multi-stakeholder containment testing. Independent auditor nodes will evaluate models against cyber-warfare scenarios, autonomous self-replication vulnerabilities, and biometric social manipulation vectors.

Crucially, the treaty establishes a permanent International AI Inspection Agency (IAIIA) headquartered in Geneva, with sovereign authority to inspect datacenters hosting over 100,000 unified compute clusters. Violations will result in coordinated semiconductor supply sanctions and international network blacklisting.

"We have learned from aerospace and civil aviation," stated the director general. "Intelligence technology of this magnitude cannot operate on voluntary corporate pledges alone."`,
    category: 'science-tech',
    categoryLabel: 'Science & Technology',
    source: 'Reuters Global Tech',
    sourceUrl: 'https://www.reuters.com',
    publishedAt: '2026-09-23T06:40:00Z',
    readTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    isBreaking: true,
    isFeatured: false,
    keyFacts: [
      'Charter ratified by 62 sovereign governments at Geneva Convention.',
      'Establishes the International AI Inspection Agency (IAIIA) with compute inspection mandates.',
      'Mandatory pre-deployment sandboxing for training runs exceeding 10^26 FLOPs.',
      'Enforces semiconductor embargoes for non-compliant model development clusters.'
    ],
    tags: ['AI Safety', 'Geneva Protocol', 'Frontier Compute', 'Technology Governance'],
    author: 'Dr. Sarah Jenkins'
  },
  {
    id: 'art-03',
    headline: 'Quad-Alliance Concludes High-Sea Exercise "Indo-Shield 2026" with Autonomous Sub-Surface Fleets',
    summary: 'The multinational maritime security drills featured coordinated deployment of AI-guided unmanned underwater vessels (UUVs) and satellite-linked acoustic surveillance arrays.',
    content: `Naval and maritime defense commands from Australia, India, Japan, and the United States completed their premier maritime engagement 'Indo-Shield 2026' in the eastern Indian Ocean.

This year's iteration departed significantly from traditional surface fleet maneuvers, placing primary tactical emphasis on autonomous sub-surface reconnaissance networks. Over 40 prototype underwater autonomous drones executed synchronized bathymetric mapping, mine neutralization protocols, and silent acoustic intercept sweeps over a 1,200 nautical mile corridor.

Rear Admiral James Vance confirmed that the allied command nodes successfully operated a unified cross-platform tactical mesh network, enabling real-time sensor sharing between satellite constellations and submerged autonomous assets without surfacing for communication.

The exercise also tested rapid-response humanitarian maritime search-and-rescue algorithms, demonstrating a 60% reduction in ocean locator response latency.`,
    category: 'defence',
    categoryLabel: 'Defence & Security',
    source: 'Jane\'s Defence & Naval News',
    sourceUrl: 'https://www.janes.com',
    publishedAt: '2026-09-23T05:20:00Z',
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      'Conducted over a 1,200 nautical mile operational corridor in the Eastern Indian Ocean.',
      'First major allied deployment integrating 40+ autonomous sub-surface reconnaissance drones.',
      'Demonstrated unified space-to-subsurface acoustic tactical datalink mesh.',
      'Humanitarian search-and-rescue reaction times improved by 60%.'
    ],
    tags: ['Quad Alliance', 'Maritime Security', 'Autonomous UUVs', 'Indo-Pacific'],
    author: 'Marcus Chen'
  },
  {
    id: 'art-04',
    headline: 'Unified Clean Energy Grid Commissioned: Connects 18 States to 250 GW Solar-Wind Corridor',
    summary: 'The national transmission utility has energized the Ultra-High Voltage Direct Current (UHVDC) Mega-Corridor, enabling zero-curtailment interstate renewable power wheeling.',
    content: `In a landmark engineering triumph for national energy transition, the state-of-the-art 800 kV Ultra-High Voltage Direct Current (UHVDC) transmission corridor was officially powered today.

Connecting heavy solar desert parks in the west and offshore wind turbines in the south with industrial power hubs across 18 states, the project boasts an instantaneous transfer capacity of 250 Gigawatts. Advanced superconducting converter stations reduce line transmission losses to under 1.8% over a distance exceeding 2,400 kilometers.

The system incorporates algorithmic grid balancing software, capable of predicting cloud cover and coastal gust variations up to six hours in advance to automatically divert surplus power to national pumped-storage and hydrogen electrolysis facilities.

National grid authorities project that this corridor will avoid the combustion of over 85 million metric tons of coal annually while permanently cutting wholesale industrial power rates by 14%.`,
    category: 'environment',
    categoryLabel: 'Environment & Climate',
    source: 'Clean Energy Review & State Grid',
    sourceUrl: 'https://www.cleanenergywire.org',
    publishedAt: '2026-09-22T19:00:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      '800 kV UHVDC Corridor spans 2,400+ kilometers across 18 states.',
      'Instantaneous transfer capacity rated at 250 GW of renewable energy.',
      'Superconducting converter stations keep line losses below 1.8%.',
      'Reduces coal consumption by an estimated 85 million metric tons annually.'
    ],
    tags: ['Renewable Energy', 'UHVDC Grid', 'Decarbonization', 'Solar & Wind'],
    author: 'Elena Rostova'
  },
  {
    id: 'art-05',
    headline: 'Supreme Court Rules on Digital Citizen Privacy & Algorithmic Due Process Framework',
    summary: 'The Constitutional Bench has delivered a unanimous verdict establishing that citizen data processing in statutory welfare delivery must strictly adhere to mathematical transparency.',
    content: `The Constitution Bench today delivered a historic judgment delineating the doctrine of 'Algorithmic Due Process' in public administrative systems.

The 5-judge bench ruled that when automated decision systems or machine learning scores determine citizen eligibility for government pensions, healthcare subsidies, or licensing permits, individuals possess an unalienable right to an interpretable, human-readable rationale. Black-box algorithmic disqualifications without human review have been declared unconstitutional.

The judgment directs all ministries and public statutory bodies to establish 'Digital Ombudsman Offices' within 90 days. Citizens subjected to adverse automated classifications can demand a formal human adjudication hearing within 72 hours.

"Algorithmic convenience cannot eclipse natural justice," the Chief Justice remarked in the operative portion. "The sovereignty of the individual under our constitution remains supreme over bureaucratic machine code."`,
    category: 'government',
    categoryLabel: 'Government & Policy',
    source: 'National Law Review',
    sourceUrl: 'https://www.law.gov',
    publishedAt: '2026-09-22T16:30:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      'Unanimous 5-judge Constitutional Bench establishes "Algorithmic Due Process".',
      'Black-box algorithmic denials of welfare entitlements ruled null and void.',
      'Mandates establishment of Digital Ombudsman Offices in all ministries within 90 days.',
      'Guarantees 72-hour right to human review for all automated administrative actions.'
    ],
    tags: ['Constitutional Law', 'Supreme Court', 'Algorithmic Due Process', 'Citizen Rights'],
    author: 'Legal Affairs Correspondent'
  },
  {
    id: 'art-06',
    headline: 'National Higher Education Research Fund Launches $5B Deep-Tech Fellowship Initiative',
    summary: 'Under the upgraded National Education Framework, 10,000 doctoral fellows will receive state-funded research stipends and foundry access for quantum, materials, and aerospace engineering.',
    content: `The Ministry of Education in partnership with national scientific academies has unveiled the 'Vanguard 10,000' Deep-Tech Fellowship program, backed by an initial endowment of $5 Billion over the next four academic cycles.

The program directly links university doctoral candidates with premier national laboratories and specialized industry foundries. Fellows in quantum cryptography, high-temperature superconductors, neuro-prosthetics, and hypersonic fluid dynamics will receive full tuition waivers, competitive monthly stipends equivalent to senior research engineers, and unrestricted access to supercomputing time.

Crucially, intellectual property created under the fellowship will be co-owned between the student researcher and the university (70/30 split), eliminating bureaucratic patent stagnation and facilitating rapid spin-off company formation.

Over 180 accredited technical universities have joined the initial consortium, with the first application intake window opening on October 1st.`,
    category: 'education',
    categoryLabel: 'Education & Schemes',
    source: 'Higher Education Chronicle',
    sourceUrl: 'https://www.chronicle.edu',
    publishedAt: '2026-09-22T12:00:00Z',
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      '$5 Billion endowment committed across 4 academic cycles.',
      'Provides 10,000 doctoral fellowships in quantum, materials, and aerospace.',
      '70/30 IP revenue sharing model favoring student inventors.',
      'Guaranteed supercomputing and industrial foundry access for all cohorts.'
    ],
    tags: ['Education Policy', 'Doctoral Fellowship', 'Deep Tech', 'Research Grants'],
    author: 'Academic Wire'
  },
  {
    id: 'art-07',
    headline: 'Global Sports Federation Approves Biometric Cooling Gear for 2028 Olympic Trials',
    summary: 'In response to record heat waves, the International Olympic Technical Committee has officially sanctioned active thermoelectric apparel for marathon and decathlon trials.',
    content: `Meeting in Lausanne, the Medical and Technical Commission of the International Olympic Committee has released its groundbreaking thermal safety regulations for endurance competitions.

Following extensive wind-tunnel and physiological testing, runners, cyclists, and decathletes will now be permitted to wear standardized active thermoelectric micro-cooling vests during competitions where the Wet Bulb Globe Temperature (WBGT) exceeds 28°C.

The vests, engineered with ultralight phase-change polymers and micro-fluidic heat pipes, regulate core body temperature without imparting unfair mechanical propulsion or metabolic stimulants. Real-time telemetry will also broadcast athlete core temperature data directly to medical sidelines, automatically flagging heat stroke risk.

"Athlete safety and physiological integrity must evolve alongside the climate realities of our century," said Dr. Clara Hoffmann, Chief of Olympic Sports Medicine.`,
    category: 'sports',
    categoryLabel: 'Sports & Athletics',
    source: 'Olympic Sports Review',
    sourceUrl: 'https://www.olympics.com',
    publishedAt: '2026-09-22T09:15:00Z',
    readTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      'Active thermoelectric cooling vests permitted when Wet Bulb Globe Temp exceeds 28°C.',
      'Apparel uses phase-change polymers and micro-fluidic heat pipes without propulsion aid.',
      'Real-time core body temperature telemetry integrated into sideline medical alerts.',
      'Sets precedent for world athletics championships and continental games.'
    ],
    tags: ['Olympics', 'Sports Medicine', 'Heat Safety', 'Athletics Tech'],
    author: 'Sports Science Desk'
  },
  {
    id: 'art-08',
    headline: 'G20 Digital Public Infrastructure Accord Establishes Cross-Border Sovereign ID Interoperability',
    summary: 'The New Delhi Ministerial Conclave successfully concluded negotiations enabling travelers and businesses to verify sovereign digital credentials across 19 member states securely.',
    content: `In a landmark diplomatic consensus on international digital governance, digital economy ministers from the G20 member economies signed the 'Universal Digital Public Infrastructure Compact' today.

The agreement establishes cryptographic zero-knowledge protocols that permit individuals and verified corporate entities to prove identity, educational qualifications, and corporate tax compliance across borders without transferring sensitive raw personal data.

The system will drastically reduce cross-border business setup timelines from an average of 45 days down to under 4 hours for qualified small and medium enterprises. Tourism and academic travel will also see instant credential validation at international customs checkpoints.

The protocol relies entirely on decentralized open-source standards, preventing vendor lock-in or centralized corporate platform dominance over sovereign citizen records.`,
    category: 'international',
    categoryLabel: 'International & Global',
    source: 'G20 Secretariat & Diplomatic Wire',
    sourceUrl: 'https://www.g20.org',
    publishedAt: '2026-09-21T18:40:00Z',
    readTimeMinutes: 4,
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    isBreaking: false,
    isFeatured: false,
    keyFacts: [
      'G20 treaty signed across 19 member states establishing zero-knowledge credential verification.',
      'Reduces international cross-border business setup from 45 days to under 4 hours.',
      'Eliminates raw personal data transfers via decentralized cryptographic proofs.',
      'Open-source architecture prevents centralized corporate tech lock-in.'
    ],
    tags: ['G20 Summit', 'Digital Public Infrastructure', 'Zero-Knowledge Proofs', 'International Trade'],
    author: 'Diplomatic Correspondent'
  }
];

export const MOCK_FACTS: CurrentAffairsFact[] = [
  {
    id: 'fact-01',
    headline: 'Universal Digital Currency Cross-Border Protocol Live',
    context: 'The Central Bank Settlement Network has successfully executed its first $500M live institutional settlement with 14 partner economies in under 1.2 seconds with near-zero transaction friction.',
    category: 'economy',
    date: 'Sep 23, 2026',
    source: 'Central Bank Ledger',
    importance: 'Crucial'
  },
  {
    id: 'fact-02',
    headline: 'Lunar South Pole Station Module 3 Pressurized',
    context: 'Astronauts and autonomous robotics completed the airtight pressurization of the orbital life-support hub at 89.9° South, paving the way for continuous human lunar residency.',
    category: 'science-tech',
    date: 'Sep 23, 2026',
    source: 'Space Exploration Bureau',
    importance: 'Essential'
  },
  {
    id: 'fact-03',
    headline: 'National Green Hydrogen Pipeline Network Surpasses 5,000 km',
    context: 'The dedicated high-pressure composite pipeline connecting coastal electrolytic hubs to inland fertilizer and steel manufacturing centers was certified operational.',
    category: 'environment',
    date: 'Sep 22, 2026',
    source: 'Ministry of New & Renewable Energy',
    importance: 'High'
  },
  {
    id: 'fact-04',
    headline: 'High Court Establishes 24/7 Digital Citizen Lok Adalat',
    context: 'Over 120,000 pre-litigation consumer and utility claims were settled in a single 48-hour digital session via AI-assisted consensual dispute resolution platforms.',
    category: 'government',
    date: 'Sep 22, 2026',
    source: 'National Judicial Council',
    importance: 'High'
  },
  {
    id: 'fact-05',
    headline: 'World Health Organization Certifies Malaria-Free Corridor',
    context: 'Following five continuous years with zero indigenous transmissions across 8 contiguous countries, the Southeast Regional Tropical Health Accord was certified.',
    category: 'international',
    date: 'Sep 21, 2026',
    source: 'WHO Geneva Communique',
    importance: 'Crucial'
  },
  {
    id: 'fact-06',
    headline: 'Deep-Ocean Submersible "Samudra-6" Dives to 6,200 Meters',
    context: 'The indigenous manned submersible retrieved polymetallic nodule core samples and biological specimens from the central ocean basin trench with zero telemetry loss.',
    category: 'defence',
    date: 'Sep 21, 2026',
    source: 'Ocean Development Command',
    importance: 'Essential'
  }
];

export const DAILY_QUIZ: DailyQuiz = {
  id: 'quiz-2026-09-23',
  title: 'Current Affairs Daily Challenge',
  date: 'September 23, 2026',
  description: 'Test your knowledge on today\'s major national, global economic, science, and constitutional developments with 5 high-yield questions.',
  estimatedMinutes: 3,
  questions: [
    {
      id: 'q1',
      question: 'Under the newly adopted 2026 Vienna Sovereign Green Bond taxonomy, which requirement is newly mandated for issuing national treasuries?',
      options: [
        'Mandatory quarterly cash reserve deposits in private European commercial banks',
        'Biannual verified satellite telemetry tracking of carbon abatement projects',
        'Conversion of all sovereign debt into gold-backed certificates within 18 months',
        'Exclusion of all emerging market economies from the concessionary spread tier'
      ],
      correctIndex: 1,
      explanation: 'The 2026 Vienna taxonomy mandates that issuing national treasuries must provide verified satellite telemetry and third-party algorithmic carbon reduction tracking every six months to eliminate greenwashing.',
      domain: 'Economy & Finance',
      difficulty: 'Medium'
    },
    {
      id: 'q2',
      question: 'The Geneva Protocol on Frontier AI Systems establishes which permanent international regulatory body?',
      options: [
        'International Atomic Energy Agency (IAEA)',
        'Global Algorithmic Surveillance Council (GASC)',
        'International AI Inspection Agency (IAIIA)',
        'United Nations Digital Sovereignty Commission (UNDSC)'
      ],
      correctIndex: 2,
      explanation: 'The charter establishes the International AI Inspection Agency (IAIIA) headquartered in Geneva, with sovereign authority to inspect datacenters hosting over 100,000 unified compute clusters.',
      domain: 'Science & Technology',
      difficulty: 'Easy'
    },
    {
      id: 'q3',
      question: 'What is the operational voltage and transfer capacity of the newly commissioned national clean energy corridor?',
      options: [
        '400 kV HVAC with 50 GW transfer capacity',
        '800 kV UHVDC with 250 GW transfer capacity',
        '1,200 kV DC with 100 GW transfer capacity',
        '500 kV AC with 80 GW transfer capacity'
      ],
      correctIndex: 1,
      explanation: 'The energized Ultra-High Voltage Direct Current (UHVDC) Mega-Corridor operates at 800 kV and delivers an instantaneous transfer capacity of 250 Gigawatts across 18 states with line losses below 1.8%.',
      domain: 'Environment & Climate',
      difficulty: 'Medium'
    },
    {
      id: 'q4',
      question: 'In its historic verdict on welfare algorithms, the Supreme Court mandated that all ministries establish what within 90 days?',
      options: [
        'Artificial Intelligence Task Forces with total discretionary power',
        'Digital Ombudsman Offices with a 72-hour right to human review',
        'Private contractor auditing agreements exempt from public RTI disclosure',
        'Complete removal of all computer systems from district administrative offices'
      ],
      correctIndex: 1,
      explanation: 'The Supreme Court ruled that black-box automated denials without human review violate constitutional due process, mandating Digital Ombudsman Offices in every ministry with a 72-hour human appeal guarantee.',
      domain: 'Government & Policy',
      difficulty: 'Advanced'
    },
    {
      id: 'q5',
      question: 'The G20 Universal Digital Public Infrastructure Compact relies primarily on which cryptographic mechanism for cross-border credential validation?',
      options: [
        'Centralized cloud database mirroring in Washington D.C.',
        'Zero-knowledge cryptographic proofs eliminating raw personal data transfers',
        'Mandatory biometric iris upload to private multinational tech servers',
        'Physical paper stamping at bilateral consulate embassies'
      ],
      correctIndex: 1,
      explanation: 'The G20 Compact employs decentralized zero-knowledge proofs that enable citizens and businesses to prove identity, credentials, and tax compliance across 19 countries without exposing raw sensitive personal data.',
      domain: 'International & Global',
      difficulty: 'Medium'
    }
  ]
};
