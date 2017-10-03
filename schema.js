const fetch = require('node-fetch');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);
const gamesDBUri = 'http://thegamesdb.net/api';
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require('graphql');



const GameType = new GraphQLObjectType({
  name: 'Game',
  description: 'Video game',

  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].GameTitle[0]
    },
    gamesDBID: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].id[0]
    },
    platforms: {
      type: new GraphQLList(PlatformType),
      resolve: xml => {
        let platIDs = xml.Data.Game[0].Similar[0].Game.map(elem => elem.PlatformId[0]);
        platIDs.unshift(xml.Data.Game[0].PlatformId[0]);

        return Promise.all(
          platIDs.map(id =>
            fetch(`${gamesDBUri}/GetPlatform.php?id=${id}`)
              .then(response => response.text())
              .then(parseXML)
        ));
      }
    }
  })
});

const PlatformType = new GraphQLObjectType({
  name: 'Platform',
  description: 'Game system platform name',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.Data.Platform[0].Platform[0]
    },
    manufacturer: {
      type: GraphQLString,
      resolve: xml => {
        try {
          return xml.Data.Platform[0].developer[0];
        }
        catch(err) {
          try {
            return xml.Data.Platform[0].manufacturer[0];
          }
          catch(err) { return "null"; }
        }
      }
    },
    platformId: {
      type: GraphQLString,
      resolve: xml => xml.Data.Platform[0].id[0]
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      game: {
        type: GameType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(`${gamesDBUri}/GetGame.php?id=${args.id}`)
        .then(response => response.text())
        .then(parseXML)
      },
      platform: {
        type: PlatformType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(`${gamesDBUri}/GetPlatform.php?id=${args.id}`)
        .then(response => response.text())
        .then(parseXML)
      }
    })
  })
});
