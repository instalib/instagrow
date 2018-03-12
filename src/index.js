const commander = require('commander');
const constants = require("./constants");

commander
  .version('0.0.1')
  .description('Instagrow, an Instagram engagement tool');


commander
  .command('createDatabase <username>')
  .alias('c')
  .description('Create and setup a DB and table to store Instagram user activity')
  .action((username) => {
    const config = require(`../config.${username}.json`);

    constants.settings.DATABASE_OBJECT.handler.createInstance(config);
    constants.settings.DATABASE_OBJECT.handler.getInstance().createDB();
  });

commander
  .command('dumpFromSqliteDatabase <username>')
  .alias('ds')
  .description('Dump the Sqlite Instagram database to a file in data/')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const sqliteService = require("./services/sqlite");

    sqliteService.handler.createInstance(config);
    sqliteService.handler.getInstance().dumpAllDataToCSV();
  });

commander
  .command('importIntoDynamoDatabase <username>')
  .alias('id')
  .description('Import into the DynamoDB Instagram database from file in data/')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const dynamodbService = require("./services/dynamodb");

    dynamodbService.handler.createInstance(config);
    dynamodbService.handler.getInstance().importData();
  });

commander
  .command('deleteDynamoDatabase <username>')
  .alias('dd')
  .description('Delete a DynamoDB Instagram user table to store activity')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const dynamodbService = require("./services/dynamodb");

    dynamodbService.handler.createInstance(config);
    dynamodbService.handler.getInstance().deleteDB();
  });

commander
  .command('getAccountsFollowing <username>')
  .alias('gaf')
  .description('Checks the users and returns the accounts following')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const accountsFollowing = require("./getAccountsFollowing");

    constants.settings.DATABASE_OBJECT.handler.createInstance(config);
    accountsFollowing.getAccountsFollowing(config, constants.settings.DATABASE_OBJECT)
      .finally(() => constants.settings.DATABASE_OBJECT.handler.getInstance().close());
  });

commander
  .command('updateInteractionActivity <username>')
  .alias('uia')
  .description('Checks the users feed and updates the activity')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const accountsFollowing = require("./getAccountsFollowing");
    const latestActivityOfFollowedAccounts = require("./getLatestActivityOfFollowedAccounts");

    constants.settings.DATABASE_OBJECT.handler.createInstance(config);
    accountsFollowing.getAccountsFollowing(config, constants.settings.DATABASE_OBJECT)
      .then(() => latestActivityOfFollowedAccounts.getLatestActivityOfFollowedAccounts(config, constants.settings.DATABASE_OBJECT))
      .finally(() => constants.settings.DATABASE_OBJECT.handler.getInstance().close());
  });

commander
  .command('updateFollowersMedia <username>')
  .alias('ufm')
  .description('Update the cached media data of followed accounts who have have not been interacted with in the last 3 days')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const accountsFollowing = require("./getAccountsFollowing");
    const latestMediaOfFollowedAccounts = require("./getLatestMediaOfFollowedAccounts");

    constants.settings.DATABASE_OBJECT.handler.createInstance(config);
    accountsFollowing.getAccountsFollowing(config, constants.settings.DATABASE_OBJECT)
      .then(() => latestMediaOfFollowedAccounts.getLatestMediaOfFollowedAccounts(config, constants.settings.DATABASE_OBJECT))
      .finally(() => constants.settings.DATABASE_OBJECT.handler.getInstance().close());
  });

commander
  .command('likeMedia <username>')
  .alias('l')
  .description('Create "like" interactions for followed accounts who have posted content in the last 3-7 days')
  .action((username) => {
    const config = require(`../config.${username}.json`);
    const accountsFollowing = require("./getAccountsFollowing");
    const latestActivityOfFollowedAccounts = require("./getLatestActivityOfFollowedAccounts");
    const latestMediaOfFollowedAccounts = require("./getLatestMediaOfFollowedAccounts");
    const likedMedia = require("./updateLikedMedia");

    constants.settings.DATABASE_OBJECT.handler.createInstance(config);
    accountsFollowing.getAccountsFollowing(config, constants.settings.DATABASE_OBJECT)
      .then(() => latestActivityOfFollowedAccounts.getLatestActivityOfFollowedAccounts(config, constants.settings.DATABASE_OBJECT))
      .then(() => latestMediaOfFollowedAccounts.getLatestMediaOfFollowedAccounts(config, constants.settings.DATABASE_OBJECT))
      .then(() => likedMedia.updateLikedMedia(config, constants.settings.DATABASE_OBJECT))
      .finally(() => constants.settings.DATABASE_OBJECT.handler.getInstance().close());
  });

commander.parse(process.argv);
