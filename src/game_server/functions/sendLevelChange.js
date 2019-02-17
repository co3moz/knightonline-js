const config = require('config');
const levelUp = config.get('gameServer.levelUp');
const unit = require('../../core/utils/unit');
const sendAbility = require('./sendAbility');
const region = require('../region');

module.exports = (socket, newLevel) => {
  if (newLevel < 1 || newLevel > 83) return;

  let c = socket.character;
  let currentLevel = c.level;
  if (currentLevel == newLevel) return;

  let statTotal = 300 + (newLevel - 1) * 3; // each level gives 3 stat point
  let skillTotal = (newLevel - 9) * 2;

  if (newLevel > 60) {
    statTotal += 2 * (newLevel - 60);  // after 60 level each level gives 5 so we increment "+2"
  }

  if (newLevel > currentLevel) {
    let { statStr, statHp, statDex, statMp, statInt, statRemaining } = c;
    let userStatTotal = statStr + statHp + statDex + statMp + statInt + statRemaining;

    let { skillPointCat1, skillPointCat2, skillPointCat3, skillPointMaster, skillPointFree } = c;
    let userSkillTotal = skillPointCat1 + skillPointCat2 + skillPointCat3 + skillPointMaster + skillPointFree;

    let statGain = Math.max(0, statTotal - userStatTotal);
    let skillGain = Math.max(0, skillTotal - userSkillTotal);

    c.statRemaining += statGain;
    c.skillPointFree += skillGain;
  }

  c.level = newLevel;

  sendAbility(socket);
  
  let v = socket.variables;
  
  c.hp = v.maxHp; // level up so give hp
  c.mp = v.maxMp; // level up so give mp

  region.regionSend(socket, [
    0x1B, // Level change
    ...unit.short(socket.session),
    newLevel,
    ...unit.short(c.statRemaining),
    c.skillPointFree,
    ...unit.long(levelUp[newLevel]), ...unit.long(c.exp),
    ...unit.short(v.maxHp || 0), ...unit.short(c.hp),
    ...unit.short(v.maxMp || 0), ...unit.short(c.mp),
    ...unit.int(v.maxWeight), ...unit.int(v.itemWeight),
  ])
}