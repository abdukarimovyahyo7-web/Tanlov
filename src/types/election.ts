export type ElectionRole = 'hokim' | 'yordamchi';

export interface Candidate {
  id: string;
  name: string;
  instagram: string;
  role: ElectionRole;
  districtId: string;
  votes: number;
  program: string;
  avatarColor: string;
}

export interface ElectedOfficial {
  name: string;
  instagram: string;
  votes: number;
  electedTimestamp: number;
  role: ElectionRole;
}

export interface DistrictElectionState {
  districtId: string;
  hokim: ElectedOfficial;
  yordamchi: ElectedOfficial;
  hokimCandidates: Candidate[];
  yordamchiCandidates: Candidate[];
  // Time tracking
  hokimCycleStart: number; // 30-day cycle
  yordamchiCycleStart: number; // 15-day term, 16th day new election
  votedInstagrams: string[]; // Set of instagram handles that voted in this cycle
}

export interface PresidentialDecree {
  id: string;
  title: string;
  description: string;
  type: 'funds' | 'holiday' | 'expansion' | 'tax' | 'honor';
  timestamp: number;
  districtId?: string;
}

/**
 * Calculates remaining days in Hokim term (30 days total)
 */
export function getHokimElectionCountdown(cycleStart: number): { daysLeft: number; hoursLeft: number; percentElapsed: number } {
  const cycleDurationMs = 30 * 24 * 60 * 60 * 1000;
  const elapsed = (Date.now() - cycleStart) % cycleDurationMs;
  const remainingMs = Math.max(0, cycleDurationMs - elapsed);
  const daysLeft = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hoursLeft = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const percentElapsed = Math.min(100, Math.floor((elapsed / cycleDurationMs) * 100));

  return { daysLeft, hoursLeft, percentElapsed };
}

/**
 * Calculates remaining days in Hokim Yordamchisi term (15 days term, 16th day is new election!)
 */
export function getYordamchiElectionCountdown(cycleStart: number): {
  daysLeft: number;
  hoursLeft: number;
  isElectionDay: boolean;
  dayInCycle: number;
  percentElapsed: number;
} {
  const fullCycleMs = 16 * 24 * 60 * 60 * 1000;
  const elapsed = (Date.now() - cycleStart) % fullCycleMs;
  const dayInCycle = Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1; // 1 to 16
  const isElectionDay = dayInCycle === 16;
  const termRemainingMs = isElectionDay ? 0 : Math.max(0, 15 * 24 * 60 * 60 * 1000 - elapsed);
  const daysLeft = Math.floor(termRemainingMs / (24 * 60 * 60 * 1000));
  const hoursLeft = Math.floor((termRemainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const percentElapsed = Math.min(100, Math.floor((elapsed / fullCycleMs) * 100));

  return { daysLeft, hoursLeft, isElectionDay, dayInCycle, percentElapsed };
}

export const DEFAULT_HOKIM_CANDIDATES: Record<string, Candidate[]> = {
  chilonzor: [
    {
      id: 'cand_chilonzor_1',
      name: 'Sherzodbek Qodirov',
      instagram: '@sherzod_chilonzor',
      role: 'hokim',
      districtId: 'chilonzor',
      votes: 148,
      program: 'Chilonzor tumanida yangi kiber bog‘lar, osmono‘par biznes markazlari va bepul Wi-Fi hududlari yaratish!',
      avatarColor: '#00f0ff',
    },
    {
      id: 'cand_chilonzor_2',
      name: 'Nodira Alimova',
      instagram: '@nodira_urbanist',
      role: 'hokim',
      districtId: 'chilonzor',
      votes: 162,
      program: 'Yashil hududlarni 2 barobarga oshirish, favvoralar va ekologik toza transportni rivojlantirish.',
      avatarColor: '#10b981',
    },
    {
      id: 'cand_chilonzor_3',
      name: 'Bobur Mirzayev',
      instagram: '@bobur_investor',
      role: 'hokim',
      districtId: 'chilonzor',
      votes: 94,
      program: 'Xorijiy kiber investitsiyalarni jalb qilish, yangi 100 qavatli minoralar qurish.',
      avatarColor: '#ffd700',
    },
  ],
};

export const DEFAULT_YORDAMCHI_CANDIDATES: Record<string, Candidate[]> = {
  chilonzor: [
    {
      id: 'yord_chilonzor_1',
      name: 'Javohir Toshpo‘latov',
      instagram: '@javohir_assistant',
      role: 'yordamchi',
      districtId: 'chilonzor',
      votes: 89,
      program: 'Mahallalarda 24/7 rejimida fuqarolar muammolarini hal qilish va Instagram orqali ochiq muloqot!',
      avatarColor: '#a855f7',
    },
    {
      id: 'yord_chilonzor_2',
      name: 'Madinabonu Rahimova',
      instagram: '@madina_youth',
      role: 'yordamchi',
      districtId: 'chilonzor',
      votes: 114,
      program: 'Yoshlar kiber-startaplarini qo‘llab-quvvatlash va yangi ish o‘rinlari ochish.',
      avatarColor: '#ff0055',
    },
  ],
};

export function initializeDistrictElection(districtId: string, districtName?: string): DistrictElectionState {
  const dName = districtName || (districtId.charAt(0).toUpperCase() + districtId.slice(1).replace(/_/g, ' '));

  const hokimCandidates: Candidate[] = DEFAULT_HOKIM_CANDIDATES[districtId] || [
    {
      id: `cand_${districtId}_1`,
      name: `Alisher ${dName.split(' ')[0]}iy`,
      instagram: `@${districtId}_hokim_nomzod`,
      role: 'hokim',
      districtId,
      votes: 142,
      program: `${dName}da zamonaviy IT-park, ekologik bog'lar va yangi qulay turar-joylar barpo etish!`,
      avatarColor: '#00f0ff',
    },
    {
      id: `cand_${districtId}_2`,
      name: `Zulayho Karimova`,
      instagram: `@${districtId}_zulayho`,
      role: 'hokim',
      districtId,
      votes: 156,
      program: `Ta'lim, yoshlar markazlari va ${dName} hududida xotin-qizlar tadbirkorligini kengaytirish.`,
      avatarColor: '#10b981',
    },
    {
      id: `cand_${districtId}_3`,
      name: `Sanjarbek Rahmonov`,
      instagram: `@${districtId}_sanjar_invest`,
      role: 'hokim',
      districtId,
      votes: 98,
      program: `${dName}ga xalqaro investorlar jalb qilish va shahar byudjetini 3 barobar oshirish.`,
      avatarColor: '#ffd700',
    },
  ];

  const yordamchiCandidates: Candidate[] = DEFAULT_YORDAMCHI_CANDIDATES[districtId] || [
    {
      id: `yord_${districtId}_1`,
      name: `Jamshidbek Oripov`,
      instagram: `@jamshid_${districtId}`,
      role: 'yordamchi',
      districtId,
      votes: 104,
      program: `Har bir mahallaga kirib fuqarolar talablarini 24 soat ichida hal qilish va Telegram/Instagram orqali ochiqlik!`,
      avatarColor: '#a855f7',
    },
    {
      id: `yord_${districtId}_2`,
      name: `Shahnoza Toirova`,
      instagram: `@shahnoza_${districtId}`,
      role: 'yordamchi',
      districtId,
      votes: 121,
      program: `Yosh oilalarni ijtimoiy himoya qilish, subsidiya va grantlar ajratishni shaffoflashtirish.`,
      avatarColor: '#ff0055',
    },
  ];

  // Highest voted initial leaders
  const sortedHokims = [...hokimCandidates].sort((a, b) => b.votes - a.votes);
  const sortedYordamchis = [...yordamchiCandidates].sort((a, b) => b.votes - a.votes);

  return {
    districtId,
    hokim: {
      name: sortedHokims[0].name,
      instagram: sortedHokims[0].instagram,
      votes: sortedHokims[0].votes,
      electedTimestamp: Date.now() - 5 * 24 * 3600 * 1000,
      role: 'hokim',
    },
    yordamchi: {
      name: sortedYordamchis[0].name,
      instagram: sortedYordamchis[0].instagram,
      votes: sortedYordamchis[0].votes,
      electedTimestamp: Date.now() - 6 * 24 * 3600 * 1000,
      role: 'yordamchi',
    },
    hokimCandidates,
    yordamchiCandidates,
    hokimCycleStart: Date.now() - 6 * 24 * 3600 * 1000, // 24 days left in month
    yordamchiCycleStart: Date.now() - 8 * 24 * 3600 * 1000, // Day 9 of 15 (7 days left before 16th day election!)
    votedInstagrams: [],
  };
}
