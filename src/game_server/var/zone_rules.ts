/**
 * type
 * --------
 * 0: Players cannot attack each other, or NPCs. Can walk through players.
 * 1: Players can attack each other, and only NPCs from the opposite nation. Cannot walk through players.
 * 2: Player is spectating a 1v1 match (ZoneAbilityPVP is sent for the attacker)
 * 3: Siege state 1 (unknown)
 * 4: Siege state 2/4: if they have 0 NP & this is set, it will not show the message telling them to buy more.
 * 5: Siege state 3 (unknown)
 * 6: CSW not running
 * 7: Players can attack each other (don't seem to be able to anymore?), but not NPCs. Can walk through players.
 * 8: Players can attack each other, but not NPCs. Cannot walk through players.
 *
 * flags
 * --------
 * a zone might have multiple flags at ones, check flag with +!!(flag & check)
 */
export const ZoneRules = {
  "1": { type: 1, flag: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "2": { type: 1, flag: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "5": { type: 1, flag: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "6": { type: 1, flag: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "7": { type: 1, flag: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "8": { type: 1, flags: 68, minLevel: 35, maxLevel: 83, tariff: 10 },
  "11": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "12": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "13": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "14": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "15": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "16": { type: 1, flag: 4, minLevel: 60, maxLevel: 83, tariff: 10 },
  "21": { type: 0, flag: 83, minLevel: 1, maxLevel: 83, tariff: 10 },
  "22": { type: 0, flag: 83, minLevel: 1, maxLevel: 83, tariff: 10 },
  "23": { type: 0, flag: 83, minLevel: 1, maxLevel: 83, tariff: 10 },
  "24": { type: 0, flag: 83, minLevel: 1, maxLevel: 83, tariff: 10 },
  "25": { type: 0, flag: 83, minLevel: 1, maxLevel: 83, tariff: 10 },
  "30": { type: 6, flag: 19, minLevel: 35, maxLevel: 83, tariff: 10 },
  "31": { type: 8, flag: 20, minLevel: 70, maxLevel: 83, tariff: 10 },
  "32": { type: 8, flag: 22, minLevel: 35, maxLevel: 83, tariff: 10 },
  "33": { type: 8, flag: 22, minLevel: 35, maxLevel: 83, tariff: 10 },
  "34": { type: 8, flag: 22, minLevel: 35, maxLevel: 83, tariff: 10 },
  "48": { type: 0, flag: 30, minLevel: 1, maxLevel: 83, tariff: 10 },
  "51": { type: 0, flag: 19, minLevel: 1, maxLevel: 83, tariff: 10 },
  "52": { type: 0, flag: 19, minLevel: 1, maxLevel: 83, tariff: 10 },
  "53": { type: 0, flag: 19, minLevel: 1, maxLevel: 83, tariff: 10 },
  "54": { type: 7, flag: 22, minLevel: 1, maxLevel: 83, tariff: 10 },
  "55": { type: 0, flag: 19, minLevel: 35, maxLevel: 83, tariff: 10 },
  "56": { type: 0, flag: 19, minLevel: 35, maxLevel: 83, tariff: 10 },
  "61": { type: 1, flag: 36, minLevel: 35, maxLevel: 83, tariff: 10 },
  "62": { type: 1, flag: 36, minLevel: 35, maxLevel: 83, tariff: 10 },
  "63": { type: 1, flag: 36, minLevel: 35, maxLevel: 59, tariff: 10 },
  "64": { type: 1, flag: 36, minLevel: 35, maxLevel: 83, tariff: 10 },
  "65": { type: 1, flag: 36, minLevel: 35, maxLevel: 83, tariff: 10 },
  "66": { type: 1, flag: 36, minLevel: 35, maxLevel: 83, tariff: 10 },
  "69": { type: 1, flag: 36, minLevel: 1, maxLevel: 83, tariff: 10 },
  "71": { type: 1, flag: 4, minLevel: 35, maxLevel: 83, tariff: 10 },
  "72": { type: 1, flag: 4, minLevel: 35, maxLevel: 59, tariff: 10 },
  "73": { type: 1, flag: 4, minLevel: 35, maxLevel: 69, tariff: 10 },
  "75": { type: 8, flag: 6, minLevel: 35, maxLevel: 83, tariff: 10 },
  "77": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "78": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "81": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "82": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "83": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "84": { type: 1, flag: 4, minLevel: 35, maxLevel: 83, tariff: 10 },
  "85": { type: 1, flag: 12, minLevel: 35, maxLevel: 83, tariff: 10 },
  "86": { type: 0, flag: 19, minLevel: 35, maxLevel: 83, tariff: 10 },
  "87": { type: 8, flag: 20, minLevel: 70, maxLevel: 83, tariff: 10 },
  "91": { type: 1, flag: 0, minLevel: 1, maxLevel: 83, tariff: 10 },
  "92": { type: 8, flag: 16, minLevel: 1, maxLevel: 83, tariff: 10 },
  "93": { type: 8, flag: 22, minLevel: 1, maxLevel: 83, tariff: 10 },
  "94": { type: 8, flag: 22, minLevel: 1, maxLevel: 83, tariff: 10 },
  "97": { type: 0, flag: 19, minLevel: 1, maxLevel: 83, tariff: 10 },
  "98": { type: 0, flag: 19, minLevel: 1, maxLevel: 83, tariff: 10 },
};

export const ZoneFlags = {
  TRADE_OTHER_NATION: 1 << 0,
  TALK_OTHER_NATION: 1 << 1,
  ATTACK_OTHER_NATION: 1 << 2,
  ATTACK_SAME_NATION: 1 << 3,
  FRIENDLY_NPCS: 1 << 4,
  WAR_ZONE: 1 << 5,
  CLAN_UPDATE: 1 << 6,
};
