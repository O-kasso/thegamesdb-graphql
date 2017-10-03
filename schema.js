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
    developer: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].Developer[0]
    },
    publisher: {
      type: GraphQLString,
      resolve: xml => {
        if (!!xml.Data.Game[0].Publisher) {
          return xml.Data.Game[0].Publisher[0];
        }
        else { return "N/A"; }
      }
    },
    gamesDBID: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].id[0]
    },
    esrb: {
      type: GraphQLString,
      resolve: xml => {
        if (!!xml.Data.Game[0].ESRB) {
          return xml.Data.Game[0].ESRB[0];
        }
        else { return "Not Rated"; }
      }
    },
    platforms: {
      type: new GraphQLList(PlatformType),
      resolve: xml => {
        let platformIDs = xml.Data.Game[0].PlatformId; //returns Arrah

        if (!!xml.Data.Game[0].Similar) {
          platformIDs =
            [...platformIDs, ...xml.Data.Game[0].Similar[0].Game.map(elem => elem.PlatformId[0])];
        }

        return Promise.all(
          platformIDs.map(id =>
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
        if (!!xml.Data.Platform[0].developer) {
          return xml.Data.Platform[0].developer[0];
        }
        else if (!!xml.Data.Platform[0].manufacturer) {
          return xml.Data.Platform[0].manufacturer[0];
        }
        else { return "N/A"; }
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
