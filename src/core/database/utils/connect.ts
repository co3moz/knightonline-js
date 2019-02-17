import * as config from 'config'
import * as mongoose from 'mongoose'

export default function ConnectToDatabase(): Promise<mongoose.Connection> {
  (<any>mongoose).Promise = global.Promise;

  console.log('database connection...');

  let connectionUri: string = config.get('database.uri');
  let connectionOptions = Object.assign({}, config.get('database.options'));

  return <any>new Promise(resolve => {
    mongoose.connect(connectionUri, connectionOptions, err => {
      if (err) {
        console.log('connecting to database failed!');
        console.error(err);
        process.exit(1);
      }

      resolve(mongoose.connection);
    });
  });
}