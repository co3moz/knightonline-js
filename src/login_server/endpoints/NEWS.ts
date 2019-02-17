import { Queue, string } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { News } from '../../core/database/models';
import RedisCaching from '../../core/redis/cache';
import { ILoginEndpoint } from '../endpoint'

export default <ILoginEndpoint>async function (socket: ILoginSocket, body: Queue, opcode: number) {
  let news = await RedisCaching('news', NewsCache);

  socket.send([
    opcode,
    ...string('Login Notice'),
    ...news
  ]);
}

async function NewsCache() {
  let news = await News.find().exec();

  return string(news.map(x => x.title + '#' + x.message + '#').join(''));
}