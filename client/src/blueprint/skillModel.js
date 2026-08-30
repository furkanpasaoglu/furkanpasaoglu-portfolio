import { useMemo } from 'react';
import { usePublicSkills } from '../hooks/usePublicData';

/**
 * One reading of the skills data for the capability sheet.
 *
 * The API stores three grades (expert / proficient / familiar) and the admin
 * panel keeps recording all three — nothing was migrated away. The public
 * sheet shows two, because the question a reader is actually asking is
 * binary: did he own this, or has he only worked with it? Collapsing
 * proficient and familiar into one band answers that without over-claiming
 * either of them, and it matches what the diagram says: centre and rim.
 */

export const BANDS = ['core', 'working'];

export const BAND_LABEL = {
  tr: { core: 'İleri', working: 'Kullandım' },
  en: { core: 'Expert', working: 'Worked with' },
};

const bandOf = (tier) => (tier === 'expert' ? 'core' : 'working');

const TIER_ORDER = { expert: 0, proficient: 1, familiar: 2 };

export function useSkillModel(lang) {
  const { data, isLoading, isError } = usePublicSkills(lang);
  const groups = useMemo(() => data ?? [], [data]);

  const model = useMemo(() => {
    const byTier = (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9);

    const flat = [];
    groups.forEach((group) => {
      (group.skills ?? []).forEach((skill) => {
        flat.push({
          name: skill.name,
          tier: skill.tier,
          band: bandOf(skill.tier),
          category: group.title,
          categoryId: group.id,
        });
      });
    });

    return {
      flat,
      categories: groups.map((group) => ({
        id: group.id,
        title: group.title,
        items: flat.filter((s) => s.categoryId === group.id).sort(byTier),
      })),
      total: flat.length,
    };
  }, [groups]);

  return { ...model, isLoading, isError };
}
