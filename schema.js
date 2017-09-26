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
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml =>
        xml.Data.Game[0].GameTitle[0]
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
      }
    })
  })
});
