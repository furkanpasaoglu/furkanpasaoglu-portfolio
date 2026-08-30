import { useMemo } from 'react';
import { usePublicSkills } from '../hooks/usePublicData';

/**
 * One reading of the skills data for the capability sheet.
 *
 * The API records three grades and the sheet shows all three, as three rings
 * outward from the hub. The grades are the whole point of the diagram: a
 * reader wants to know not only what is there but how well it is held, and
 * the middle grade is the one most people actually hire for.
 */

export const TIERS = ['expert', 'proficient', 'familiar'];

export const TIER_LABEL = {
  tr: { expert: 'İleri', proficient: 'Yetkin', familiar: 'Aşina' },
  en: { expert: 'Expert', proficient: 'Proficient', familiar: 'Familiar' },
};

const TIER_ORDER = Object.fromEntries(TIERS.map((t, i) => [t, i]));

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
