import { CSVLoader} from '../utils/csv_loader';
import { Object } from '../models';

export async function ObjectDefaults() {
  await CSVLoader('objects', ObjectTransferObject, 1048, Object);
}

const ObjectTransferObject = {
  'ZoneID': 'zoneID',
  'Belong': 'belong',
  "sIndex": "sIndex",
  "Type": "type",
  "ControlNpcID": "controlNpcID",
  'Status': 'status',
  'PosX': 'posX',
  'PosY': 'posY',
  'PosZ': 'posZ',
  'byLife': 'byLife'
}