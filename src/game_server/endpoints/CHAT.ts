import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";
import {
  SendUsageMessageForGM,
  GM_COMMANDS_HEADER,
  GM_COMMANDS,
} from "../functions/GMController";
import {
  ChatMessageType,
  SendPlayerMessageToRegion,
  SendMessageToPlayerFromPlayer,
} from "../functions/sendChatMessage";
import { RUserMap } from "../region";

export const CHAT: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();
  let message = body.string();

  if (socket.character.gm && type == 1 && message == "+") {
    return SendUsageMessageForGM(socket, "hello master, type help :)");
  }

  if (
    (type == 2 &&
      socket.character.gm &&
      socket.variables.chatTo == GM_COMMANDS_HEADER) ||
    (type == 1 && socket.character.gm && message[0] == "+")
  ) {
    let args = (type == 1 ? message.substring(1) : message).split(" ");
    let command = args.shift();

    if (!GM_COMMANDS[command]) {
      return SendUsageMessageForGM(
        socket,
        `ERROR: Invalid command "${command}"`
      );
    }

    return GM_COMMANDS[command](args, socket, opcode);
  }

  if (type == ChatMessageType.GENERAL) {
    if (message.length > 128) {
      message = message.substring(0, 128);
    }

    return SendPlayerMessageToRegion(socket, message);
  }

  if (type == ChatMessageType.PRIVATE) {
    if (!socket.variables.chatTo) {
      return;
    }

    let userRegionContainer = RUserMap[socket.variables.chatTo];

    if (!userRegionContainer) return;

    SendMessageToPlayerFromPlayer(
      userRegionContainer.socket,
      socket,
      ChatMessageType.PRIVATE,
      message
    );
  }
};
