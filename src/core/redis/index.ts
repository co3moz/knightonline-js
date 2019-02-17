import * as redis from 'redis'
import * as config from 'config'
import * as bluebird from 'bluebird'

declare module 'redis' {
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(...args: any[]): Promise<any>;
    getAsync(...args: any[]): Promise<any>;
    hdelAsync(...args: any[]): Promise<any>;
  }
}

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.get('redis'));
export default client;

