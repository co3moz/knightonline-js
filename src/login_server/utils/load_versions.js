module.exports = async function (db) {
  let Version = db.models.Version;

  let versions = await Version.find({}).sort([['version', 'DESC']]).exec();

  if (versions.length == 0) {
    console.log('looks like there is no version on database, creating one');

    let version = new Version({
      version: 2228,
      fileName: 'none'
    });

    await version.save();

    versions.push(version);
  }

  return versions;
}