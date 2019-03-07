import * as config from 'config';
const levelUp: number[] = <any>config.get('gameServer.levelUp');

export function GetLevelUp(level: number): number {
  return levelUp[level];
}