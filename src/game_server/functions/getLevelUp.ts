const config = require('config');
const levelUp = config.get('gameServer.levelUp');

export function GetLevelUp(level: number): number {
  return levelUp[level];
}