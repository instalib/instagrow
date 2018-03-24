const Client = require('instagram-private-api').V1;
const _ = require('lodash');
const Promise = require('bluebird');

const sessionSingleton = require("./services/sessionSingleton");

exports.getLatestMediaOfAccounts = (config, db) => sessionSingleton.session.createSession(config)
  .then((session) => {
    const accountsRelated = db.handler.getInstance().getAccountsPossiblyRequiringInteraction();
    return [session, accountsRelated]
  })
  .spread((session, accountsRelated) => {
    const accountsRelatedUserMedia = accountsRelated.map(accountFollowing => {
      return new Client.Feed.UserMedia(session, accountFollowing.instagramId, 1);
    })
    return [session, accountsRelatedUserMedia];
  })
  .spread((session, accountsRelatedUserMedia) => {
    return Promise.map(accountsRelatedUserMedia, latestUserMedia => {
      return latestUserMedia.get()
        .catch(e => {console.log(`${e.message} trying to retrieve ${latestUserMedia.accountId}`)});
    });
  })
  .then(usersMedia => {
    return Promise.map(_.compact(usersMedia), medias => {
      if (!medias.length === 0 || !medias[0] || !medias[0]._params) {
        return null;
      };
      if (medias[0]._params.hasLiked) {
        return Promise.all([
          db.handler.getInstance().updateLatestMediaDetails(
            medias[0]._params.user.pk,
            medias[0]._params.id,
            medias[0]._params.webLink,
            medias[0]._params.takenAt,
          ),
          db.handler.getInstance().updateLastInteration(
            medias[0]._params.user.pk,
            medias[0]._params.takenAt,
          ),
        ]);
      } else {
        return db.handler.getInstance().updateLatestMediaDetails(
          medias[0]._params.user.pk,
          medias[0]._params.id,
          medias[0]._params.webLink,
          medias[0]._params.takenAt,
        )
      }
    });
  })
  .then(usersMedia => {
    console.log(`Account media followed successfully saved for ${usersMedia.length} accounts!`);
    return Promise.resolve();
  })
