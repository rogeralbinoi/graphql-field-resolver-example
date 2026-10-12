import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { createLoaders } from './loaders.js'
import { resolvers, type Context } from './resolvers.js'
import { typeDefs } from './schema.js'

const server = new ApolloServer<Context>({ typeDefs, resolvers })

const { url } = await startStandaloneServer(server, {
  // context é uma função chamada a cada request: assim cada request ganha
  // loaders novos. Um loader global faria o cache dele vazar entre usuários.
  context: async () => ({ loaders: createLoaders() }),
  listen: { port: 4000 },
})

console.log(`Servidor pronto em ${url}`)
