import { Queue } from "../../core/utils/unit.js";
import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";

export const WAREHOUSE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();

  if (type == WarehouseType.Open) {
    // TODO: handle me
  }
};

export enum WarehouseType {
  Open = 1,
  Input = 2,
  Output = 3,
  Move = 4,
  InventoryMove = 5,

  Request = 10,
}
