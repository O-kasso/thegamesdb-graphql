const fetch = require('node-fetch');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString
} = require('graphql');


const GameTitleType = new GraphQLObjectType({
  name: 'GameTitle',
  description: 'Video game title',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].GameTitle[0]
    },
    gameId: {
      type: GraphQLString,
      resolve: xml => xml.Data.Game[0].id[0]
    },
    platform: {
      type: PlatformType,
      resolve: xml => xml.Data.Game[0]
    }
  })
});

const PlatformType = new GraphQLObjectType({
  name: 'Platform',
  description: 'Game system platform name',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.Platform[0]
    },
    platformId: {
      type: GraphQLString,
      resolve: xml => xml.PlatformId[0]
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      gameTitle: {
        type: GameTitleType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(
          `http://thegamesdb.net/api/GetGame.php?id=${args.id}`
        )
        .then(response => response.text())
        .then(parseXML)
      },
      platform: {
        type: PlatformType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(
          `http://thegamesdb.net/api/GetGame.php?id=${args.id}`
        )
        .then(response => response.text())
        .then(parseXML)
      }
    })
  })
});
