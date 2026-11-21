import '@tanstack/react-start/server-only'

import { inArray, sql } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { siteSettings } from '../db/schema/index.ts'

// Switches for the public site, kept in site_settings. A setting nobody has
// changed has no row and reads as its default.

/** Whether the hero shows its picked photos: behind it, and in its frame. */
export type HeroSwitches = { background: boolean; frame: boolean }
export type HeroPart = keyof HeroSwitches

const HERO_KEYS: Record<HeroPart, string> = {
  background: 'hero.background',
  frame: 'hero.frame',
}

export async function heroSwitches(): Promise<HeroSwitches> {
  const rows = await db
    .select({ key: siteSettings.key, value: siteSettings.value })
    .from(siteSettings)
    .where(inArray(siteSettings.key, Object.values(HERO_KEYS)))
  // On unless switched off: a missing row, or anything but `false`, is on.
  const on = (part: HeroPart) =>
    rows.find((row) => row.key === HERO_KEYS[part])?.value !== false
  return { background: on('background'), frame: on('frame') }
}

/** Turn one part of the hero on or off. The picked photos stay picked. */
export async function setHeroSwitch(
  actorId: string,
  part: HeroPart,
  on: boolean,
): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: HERO_KEYS[part], value: on, updatedBy: actorId })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: on, updatedBy: actorId, updatedAt: sql`now()` },
    })
}
