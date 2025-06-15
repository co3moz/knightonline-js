import type { IGameSocket } from "../game_socket.js";
import { SendMessageToPlayer, ChatMessageType } from "./sendChatMessage.js";
import {
  AllSend,
  RegionQuery,
  RSessionMap,
  RNPCMap,
  RegionAllQuery,
} from "../region.js";
import { string, byte_string } from "../../core/utils/unit.js";
import { SendWarp } from "./sendWarp.js";
import { Npc } from "@/models";
import { SendTargetHP } from "./sendTargetHP.js";
import { SummonNPC } from "../ai_system/summon.js";

export const GM_COMMANDS_HEADER = "[GM CONTROLLER]";

export function SendUsageMessageForGM(socket: IGameSocket, message: string) {
  SendMessageToPlayer(
    socket,
    ChatMessageType.PRIVATE,
    GM_COMMANDS_HEADER,
    message
  );
}

export const GM_COMMANDS = {
  notice: (args: string[], socket: IGameSocket, opcode: number) => {
    let text = args.join(" ");
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: notice text`);
    }

    AllSend([
      opcode,
      ChatMessageType.WAR_SYSTEM,
      0,
      0,
      0,
      0,
      ...string(`### NOTICE: ${text} ###`, "ascii"),
    ]);
  },

  chat: (args, socket, opcode) => {
    let text = args.join(" ");
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: chat text`);
    }

    AllSend([
      opcode,
      ChatMessageType.PUBLIC,
      0,
      0,
      0,
      0,
      ...string(`### NOTICE: ${text} ###`, "ascii"),
    ]);
  },

  pm: (args, socket, opcode) => {
    let text = args.join(" ");
    if (text.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: pm text`);
    }

    let message = [
      opcode,
      ChatMessageType.PRIVATE,
      0,
      0,
      0,
      ...byte_string("[SERVER]"),
      ...string(text, "ascii"),
    ];

    for (let userSocket of RegionAllQuery()) {
      message[2] = userSocket.user.nation;
      userSocket.send(message);
    }
  },

  count: (args, socket) => {
    SendUsageMessageForGM(socket, `count: ${Object.keys(RSessionMap).length}`);
  },

  near: (args, socket) => {
    for (let s of RegionQuery(socket)) {
      SendUsageMessageForGM(
        socket,
        s.character.name +
          ": " +
          ((s.character.x * 10) >>> 0) / 10 +
          " " +
          ((s.character.z * 10) >>> 0) / 10
      );
    }
  },

  help: (args, socket) => {
    SendUsageMessageForGM(socket, `HELP: ${GM_COMMANDS_LIST.join(", ")}`);
  },

  zone: (args, socket) => {
    let id = args.join(" ");
    if (id.length == 0) {
      return SendUsageMessageForGM(socket, `USAGE: zone id`);
    }

    SendWarp(socket, +id);
  },

  npc: (args, socket) => {
    let name = args.join(" ");
    if (!name) {
      return SendUsageMessageForGM(socket, `USAGE: npc name`);
    }

    Npc.findOne({
      name: new RegExp(name, "i"),
      isMonster: true,
    })
      .then((npc) => {
        if (!npc) {
          throw new Error(`Unknown npc name! "${name}"`);
        }

        SendUsageMessageForGM(socket, `Npc found! ${npc.name} id: ${npc.id}`);
      })
      .catch((e) => {
        SendUsageMessageForGM(socket, `ERROR: ${e.message}`);
      });
  },

  summon: (args, socket) => {
    let id = args.join(" ");
    if (!id) {
      return SendUsageMessageForGM(socket, `USAGE: summon id`);
    }

    Npc.findOne({
      id: +id,
      isMonster: true,
    })
      .then((npc) => {
        if (!npc) {
          throw new Error(`Unknown npc id! "${id}"`);
        }

        let instance = SummonNPC(npc, {
          zone: socket.character.zone,
          leftX: socket.character.x,
          rightX: socket.character.x,
          topZ: socket.character.z,
          bottomZ: socket.character.z,
          direction: socket.character.direction,
        });

        SendUsageMessageForGM(
          socket,
          `Summoned! "${npc.name}" uuid:${instance.uuid}`
        );
      })
      .catch((e) => {
        SendUsageMessageForGM(socket, `ERROR: ${e.message}`);
      });
  },

  saitama: (args, socket) => {
    if (socket.variables.saitama) {
      socket.variables.saitama = false;
      SendUsageMessageForGM(socket, "Saitama mod disabled");
    } else {
      socket.variables.saitama = true;
      SendUsageMessageForGM(socket, "Saitama mod activated");
    }
  },

  hp_set: (args, socket) => {
    let hp = +args[0];

    if (isNaN(hp) || !hp) {
      return SendUsageMessageForGM(socket, `USAGE: hp_set hp`);
    }

    if (socket.target) {
      let npcRegion = RNPCMap[socket.target];

      if (npcRegion) {
        npcRegion.npc.hp = +args[0];
        SendTargetHP(socket, 0, 0);
      }
    }
  },
};

export const GM_COMMANDS_LIST = Object.keys(GM_COMMANDS);
