const config = require('config');
const client = require('./core/client');
const unit = require('../core/utils/unit');
const hash = require('../core/utils/password_hash');
const errorCodes = require('../login_server/utils/error_codes');

module.exports = async function () {
  const con = await client({
    ip: config.get('testClient.ip'),
    port: config.get('testClient.port'),
    debug: true
  });

  let data;
  con.debug('VERSION_REQ');
  data = await con.sendAndWait([0x01, ...unit.short(1299)]);
  data = unit.queue(data);

  if (data.byte() != 0x01) throw new Error('VERSION_REQ must return 0x1');
  con.debug('Hmm.. server version is ' + data.short());


  con.debug('DOWNLOADINFO_REQ');
  data = await con.sendAndWait([0x02, ...unit.short(config.get('testClient.version'))]);
  data = unit.queue(data);

  if (data.byte() != 0x02) throw new Error('DOWNLOADINFO_REQ must return 0x2');

  let ftpAddress = data.string();
  let ftpRoot = data.string();
  let totalFiles = data.short();
  let files = [];
  for (var i = 0; i < totalFiles; i++) {
    files.push('"' + data.string() + '"');
  }

  con.debug('Hmm.. server says I need to download from ' + ftpAddress + ':21' + ftpRoot + ' and files are ' + files.join(', '));


  con.debug('LOGIN_REQ');
  data = await con.sendAndWait([0xF3, ...unit.string(config.get('testClient.user')), ...unit.string(hash(config.get('testClient.password')))]);
  data = unit.queue(data);

  if (data.byte() != 0xF3) throw new Error('LOGIN_REQ must return 0xF3');
  data.short(); // 0
  let resultCode = data.byte();
  let premiumHours = data.short();
  let accountName = data.string();

  con.debug('Hmm.. server says ' + errorCodes[resultCode] + ' premiumHours: ' + premiumHours + ' accountName: ' + accountName);

  if (resultCode != 1) return;

  /** TODO: ENCRYPTION */

  con.debug('NEWS');
  data = await con.sendAndWait([0xF6]);
  data = unit.queue(data);

  if (data.byte() != 0xF6) throw new Error('NEWS must return 0xF6');

  con.debug('Hmm.. server says ' + data.string() + ':' + data.string());


  con.debug('SERVERLIST');
  data = await con.sendAndWait([0xF5, 1, 0]);
  data = unit.queue(data);

  if (data.byte() != 0xF5) throw new Error('SERVERLIST must return 0xF5');
  if (data.short() != 1) throw new Error('echo must equal to 1');

  let serverCount = data.byte();
  let servers = [];

  for (i = 0; i < serverCount; i++) {
    servers.push({
      ip: data.string(),
      lanip: data.string(),
      name: data.string(),
      onlineCount: data.short(),
      serverId: data.short(),
      groupId: data.short(),
      userPremiumLimit: data.short(),
      userFreeLimit: data.short(),
      unkwn: data.byte(),
      karusKing: data.string(),
      karusNotice: data.string(),
      elmoradKing: data.string(),
      elmoradNotice: data.string()
    });
  }

  con.debug('Hmm.. server says ' + JSON.stringify(servers, null, '\t'));

}