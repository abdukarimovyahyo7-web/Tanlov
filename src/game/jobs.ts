/**
 * National Jobs & Trades System for Tanlov Mahallasi (v1.2).
 * Provides authentic Uzbek crafts, trades, and industries for citizen employment.
 */

export interface NationalJob {
  id: string;
  title: string;
  category: 'milliy_hunar' | 'milliy_oshxona' | 'milliy_dehqon' | 'milliy_it';
  categoryLabel: string;
  description: string;
  regionOrigin: string;
  wagePerWorker: number; // Income generated per worker ($ / sec)
  baseCost: number; // Cost to expand / upgrade workshop
  level: number;
  workers: number; // Number of currently employed citizens
  maxCapacity: number; // Current maximum workforce capacity
  icon: string;
}

export const INITIAL_NATIONAL_JOBS: NationalJob[] = [
  {
    id: 'rishton_pottery',
    title: 'Rishton Kulolchiligi',
    category: 'milliy_hunar',
    categoryLabel: 'Milliy Hunarmandchilik',
    description: 'Ko‘k sirlangan afsonaviy sopol lagan, kosa, piyola va ko‘zalar yasash ustaxonasi.',
    regionOrigin: 'Rishton (Farg‘ona)',
    wagePerWorker: 0.15,
    baseCost: 100,
    level: 1,
    workers: 25,
    maxCapacity: 100,
    icon: '🏺',
  },
  {
    id: 'bukhara_gold_embroidery',
    title: 'Buxoro Zardo‘zligi & Do‘ppido‘zlik',
    category: 'milliy_hunar',
    categoryLabel: 'Milliy Hunarmandchilik',
    description: 'Zar iplar bilan zar choponlar, Buxoro zardo‘zligi va Chust do‘ppilari tikish markazi.',
    regionOrigin: 'Buxoro & Chust',
    wagePerWorker: 0.22,
    baseCost: 150,
    level: 1,
    workers: 20,
    maxCapacity: 80,
    icon: '🧵',
  },
  {
    id: 'samarkand_bakery',
    title: 'Samarqand Nonvoyxonasi',
    category: 'milliy_oshxona',
    categoryLabel: 'Milliy Taomlar & Nonvoylik',
    description: 'Mashhur Gala-Osiyo patirlari, shirmoy va obi nonlarni tandirda yopish majmuasi.',
    regionOrigin: 'Samarqand shahri',
    wagePerWorker: 0.18,
    baseCost: 120,
    level: 1,
    workers: 35,
    maxCapacity: 150,
    icon: '🥖',
  },
  {
    id: 'margilon_silk',
    title: 'Marg‘ilon Ipakchiligi (Atlas & Adras)',
    category: 'milliy_hunar',
    categoryLabel: 'Milliy Hunarmandchilik',
    description: 'Xonatlas va toza tabiiy ipak matolari to‘qish qadimiy to‘qimachilik fabrikasi.',
    regionOrigin: 'Marg‘ilon shahri',
    wagePerWorker: 0.28,
    baseCost: 200,
    level: 1,
    workers: 30,
    maxCapacity: 120,
    icon: '👘',
  },
  {
    id: 'khiva_woodcraft',
    title: 'Xiva O‘ymakorligi & Temirchilik',
    category: 'milliy_hunar',
    categoryLabel: 'Milliy Hunarmandchilik',
    description: 'Yog‘och o‘ymakor naqshli ustunlar, darvozalar va Shahrixon pichoqchilik san’ati.',
    regionOrigin: 'Xiva & Shahrixon',
    wagePerWorker: 0.20,
    baseCost: 140,
    level: 1,
    workers: 18,
    maxCapacity: 90,
    icon: '🪵',
  },
  {
    id: 'national_osh',
    title: 'Milliy Osh & Choyxona Markazi',
    category: 'milliy_oshxona',
    categoryLabel: 'Milliy Taomlar & Choyxona',
    description: 'O‘zbek to‘y oshi, Toshkent va Samarqand oshi hamda choyxona madaniyati markazi.',
    regionOrigin: 'Toshkent & Samarqand',
    wagePerWorker: 0.25,
    baseCost: 180,
    level: 1,
    workers: 40,
    maxCapacity: 200,
    icon: '🍲',
  },
  {
    id: 'valley_gardens',
    title: 'Vodiy Bog‘dorchiligi & Poliz',
    category: 'milliy_dehqon',
    categoryLabel: 'Qishloq Xo‘jaligi',
    description: 'Quva anorzorlari, Xonqa va Mirzacho‘l shirin qovunlari hamda uzumzorlar yetishtirish.',
    regionOrigin: 'Quva & Xonqa',
    wagePerWorker: 0.16,
    baseCost: 110,
    level: 1,
    workers: 50,
    maxCapacity: 250,
    icon: '🍇',
  },
  {
    id: 'cyber_national_it',
    title: 'Milliy IT & Kiber-Muhandislik',
    category: 'milliy_it',
    categoryLabel: 'Kiber & Axborot Texnologiyalari',
    description: 'Mirzo Ulug‘bek IT Park dasturchilari, kiber-arxitektorlar va robototexnika loyihalari.',
    regionOrigin: 'Toshkent IT Park',
    wagePerWorker: 0.45,
    baseCost: 350,
    level: 1,
    workers: 30,
    maxCapacity: 300,
    icon: '💻',
  },
];

/**
 * Total employed citizens across all national jobs
 */
export function calculateTotalEmployed(jobs: NationalJob[]): number {
  return jobs.reduce((sum, job) => sum + job.workers, 0);
}

/**
 * Total capacity of workplaces created
 */
export function calculateTotalWorkplaces(jobs: NationalJob[]): number {
  return jobs.reduce((sum, job) => sum + job.maxCapacity, 0);
}

/**
 * Calculate employment rate percentage (0 - 100%)
 */
export function calculateEmploymentRate(population: number, jobs: NationalJob[]): number {
  if (population <= 0) return 100;
  const totalEmployed = calculateTotalEmployed(jobs);
  // Cap at 100%
  const rate = Math.min(100, Math.round((totalEmployed / population) * 100));
  return rate;
}

/**
 * Additional income per second generated from employed citizens
 */
export function calculateJobsIncomePerSecond(jobs: NationalJob[]): number {
  return jobs.reduce((sum, job) => sum + job.workers * job.wagePerWorker, 0);
}

/**
 * Upgrade workshop / expand capacity
 */
export function upgradeNationalJob(
  jobs: NationalJob[],
  jobId: string,
  budget: number,
  isGodMode: boolean
): { success: boolean; newBudget: number; updatedJobs: NationalJob[]; error?: string } {
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    return { success: false, newBudget: budget, updatedJobs: jobs, error: 'Ish turi topilmadi' };
  }

  const cost = isGodMode ? 0 : Math.round(job.baseCost * Math.pow(1.5, job.level - 1));
  if (!isGodMode && budget < cost) {
    return { success: false, newBudget: budget, updatedJobs: jobs, error: `Mablag‘ yetarli emas ($${cost} zarur)` };
  }

  const updatedJobs = jobs.map(j => {
    if (j.id === jobId) {
      return {
        ...j,
        level: j.level + 1,
        maxCapacity: j.maxCapacity + 50,
      };
    }
    return j;
  });

  return {
    success: true,
    newBudget: isGodMode ? budget : budget - cost,
    updatedJobs,
  };
}

/**
 * Assign more workers to a job if population and capacity allow
 */
export function assignWorkersToJob(
  jobs: NationalJob[],
  jobId: string,
  countToAdd: number,
  currentPopulation: number
): { success: boolean; updatedJobs: NationalJob[]; message?: string } {
  const currentTotalEmployed = calculateTotalEmployed(jobs);
  const availableUnemployed = Math.max(0, currentPopulation - currentTotalEmployed);

  if (countToAdd > 0 && availableUnemployed <= 0) {
    return { success: false, updatedJobs: jobs, message: 'Shaharda bo‘sh fuqaro qolmadi. Avval aholi sonini oshiring!' };
  }

  const effectiveCount = Math.min(countToAdd, availableUnemployed > 0 ? availableUnemployed : countToAdd);

  const updatedJobs = jobs.map(j => {
    if (j.id === jobId) {
      const nextWorkers = Math.max(0, Math.min(j.maxCapacity, j.workers + effectiveCount));
      return { ...j, workers: nextWorkers };
    }
    return j;
  });

  return { success: true, updatedJobs };
}

/**
 * Automatically employ all available population evenly across jobs
 */
export function autoEmployAll(jobs: NationalJob[], currentPopulation: number): NationalJob[] {
  let remainingUnemployed = Math.max(0, currentPopulation - calculateTotalEmployed(jobs));
  if (remainingUnemployed <= 0) return jobs;

  const result = jobs.map(j => ({ ...j }));

  // Distribute workers into jobs that have free capacity
  for (let round = 0; round < 100 && remainingUnemployed > 0; round++) {
    let addedAny = false;
    for (const job of result) {
      if (job.workers < job.maxCapacity && remainingUnemployed > 0) {
        job.workers += 1;
        remainingUnemployed -= 1;
        addedAny = true;
      }
    }
    if (!addedAny) break;
  }

  return result;
}
