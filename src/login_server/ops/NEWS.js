const unit = require('../../core/utils/unit');
const cache = require('../../core/redis/cache');

module.exports = async function ({ socket, db }) {
  let news = await cache('news', async () => {
    let { News } = db.models;

    let news = await News.find().exec();

    return unit.string(news.map(x => x.title + '#' + x.message + '#').join(''));
  });

  socket.sendWithHeaders([
    0xF6,
    ...unit.string('Login Notice'),
    ...news
  ]);
}