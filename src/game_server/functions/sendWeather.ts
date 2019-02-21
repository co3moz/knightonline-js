import { IGameSocket } from "../game_socket";

export function SendWeather(socket: IGameSocket): void {
  // TODO: Handle weather system
  socket.send([
    0x14, // WEATHER
    1, // rain
    0, // amount 0-100
    0
  ]);
}