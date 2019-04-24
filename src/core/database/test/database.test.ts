import { Spec } from 'nole';
import { Database } from '..';

export class DatabaseTest {
  @Spec()
  async Connect() {
    await Database();
  }
}