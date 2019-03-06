import { INpc, ISpawn } from "../../core/database/models";

export interface INPCInstance {
  npc: INpc
  spawn: ISpawn

  uuid: number
  zone: number
  x: number // current x
  z: number // current z
  tx: number // target x
  tz: number // target z
  direction: number
  hp: number
  mp: number
  maxHp: number
  maxMp: number

  damagedBy?: INPCDamageDirectory
  status: 'init' | 'standing' | 'moving' | 'attacking' | 'tracing' | 'fighting' | 'back' | 'dead'
  timestamp: number
  wait: number
  initialized: boolean
  agressive: boolean

  cache: number[]
}

export type Damage = number;
export interface INPCDamageDirectory {
  [session: number]: Damage
}

export enum NPCType {
  NPC_MONSTER = 0,
  NPC_GENERAL = 1,
  NPC_TREE = 2,
  NPC_BOSS = 3,
  NPC_DUNGEON_MONSTER = 4,
  NPC_TRAP_MONSTER = 5,
  NPC_GUARD = 11,
  NPC_PATROL_GUARD = 12,
  NPC_STORE_GUARD = 13,
  NPC_WAR_GUARD = 14,
  NPC_MERCHANT = 21,
  NPC_TINKER = 22,
  NPC_SELITH = 23, // Selith[special store]
  NPC_ANVIL = 24,

  NPC_MARK = 25,
  NPC_CLAN_MATCH_ADVISOR = 26,
  NPC_SIEGE_1 = 27,
  NPC_OPERATOR = 29, // not sure what Operator Moira was ever supposed to do...
  NPC_WAREHOUSE = 31,
  NPC_KISS = 32, // pretty useless.
  NPC_ISAAC = 33, // need to check which quests he handles
  NPC_KAISHAN = 34, // need to see what he actually does to name this properly
  NPC_CAPTAIN = 35,
  NPC_CLAN = 36,
  NPC_CLERIC = 37,
  NPC_LADY = 38, // Calamus lady event -- need to see what they're used for
  NPC_ATHIAN = 39, // Priest athian -- need to see what they're used for
  NPC_HEALER = 40,
  NPC_ROOM = 42,
  NPC_ARENA = 43, // also recon guards
  NPC_SIEGE = 44,
  NPC_SENTINEL_PATRICK = 47, // need to check which quests he handles (was it the beginner quests, or was that isaac?)

  NPC_GATE = 50,
  NPC_PHOENIX_GATE = 51,
  NPC_SPECIAL_GATE = 52,
  NPC_VICTORY_GATE = 53,
  NPC_GATE_LEVER = 55,
  NPC_ARTIFACT = 60,
  NPC_DESTROYED_ARTIFACT = 61,
  NPC_GUARD_TOWER1 = 62,
  NPC_GUARD_TOWER2 = 63,
  NPC_BOARD = 64, // also encampment
  NPC_ARTIFACT1 = 65, // Protective artifact
  NPC_ARTIFACT2 = 66, // Guard Tower artifact
  NPC_ARTIFACT3 = 67, // Guard artifact
  NPC_ARTIFACT4 = 68,
  NPC_MONK_ELMORAD = 71,
  NPC_MONK_KARUS = 72,
  NPC_BLACKSMITH = 77,
  NPC_RENTAL = 78,
  NPC_ELECTION = 79, // king elections
  NPC_TREASURY = 80,
  NPC_DOMESTIC_ANIMAL = 99,
  NPC_COUPON = 100,
  NPC_HERO_STATUE_1 = 106, // 1st place
  NPC_HERO_STATUE_2 = 107, // 2nd place
  NPC_HERO_STATUE_3 = 108, // 3rd place
  NPC_KEY_QUEST_1 = 111, // Sentinel of the Key
  NPC_KEY_QUEST_2 = 112, // Watcher of the Key
  NPC_KEY_QUEST_3 = 113, // Protector of the Key
  NPC_KEY_QUEST_4 = 114, // Ranger of the Key
  NPC_KEY_QUEST_5 = 115, // Patroller of the Key
  NPC_KEY_QUEST_6 = 116, // Recon of the Key
  NPC_KEY_QUEST_7 = 117, // Keeper of the Key
  NPC_ROBOS = 118, // need to see what he actually does to name this properly
  NPC_KARUS_MONUMENT = 121, // Luferson Monument/Linate Monument/Bellua monument/Laon Camp Monument
  NPC_HUMAN_MONUMENT = 122, // El Morad/Asga village/Raiba village/Doda camp monuments
  NPC_SERVER_TRANSFER = 123,
  NPC_RANKING = 124,
  NPC_LYONI = 125, // need to see what this NPC actually does to name this properly
  NPC_BEGINNER_HELPER = 127,
  NPC_FT_1 = 129,
  NPC_FT_2 = 130,
  NPC_FT_3 = 131, // also Priest Minerva
  NPC_KJWAR = 133,
  NPC_SIEGE_2 = 134,
  NPC_CRAFTSMAN = 135, // Craftsman boy, not sure what he's actually used for
  NPC_CHAOTIC_GENERATOR = 137,
  NPC_SPY = 141,
  NPC_ROYAL_GUARD = 142,
  NPC_ROYAL_CHEF = 143,
  NPC_ESLANT_WOMAN = 144,
  NPC_FARMER = 145,
  NPC_GATE_GUARD = 148,
  NPC_ROYAL_ADVISOR = 149,
  NPC_GATE2 = 150, // Doda camp gate
  NPC_ADELIA = 153, // Goddess Adelia[event]
  NPC_BIFROST_MONUMENT = 155,
  NPC_CHAOTIC_GENERATOR2 = 162, // newer type used by the Chaotic Generator
  NPC_SCARECROW = 171, // official scarecrow byType
  NPC_KARUS_WARDER1 = 190,
  NPC_KARUS_WARDER2 = 191,
  NPC_ELMORAD_WARDER1 = 192,
  NPC_ELMORAD_WARDER2 = 193,
  NPC_KARUS_GATEKEEPER = 198,
  NPC_ELMORAD_GATEKEEPER = 199,
  NPC_CHAOS_STONE = 200,
  NPC_PVP_MONUMENT = 210,
  NPC_BATTLE_MONUMENT = 211,
  NPC_BORDER_MONUMENT = 212,
  NPC_BYGROUP3 = 213,
  NPC_CZ_MONUMENT = 220
}