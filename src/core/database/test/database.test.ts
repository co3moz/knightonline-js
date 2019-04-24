import { Spec } from 'nole';
import { Database } from '..';

export class DatabaseTest {
  @Spec(60000)
  async Connect() {
    await Database();
  }
}