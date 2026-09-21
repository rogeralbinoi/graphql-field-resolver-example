import { getPostById, getPosts, type Comment, type Post } from './blog-service.js'
import type { Loaders } from './loaders.js'

export type Context = {
  loaders: Loaders
}

// Post.title e Post.content nao aparecem aqui de proposito: quando um campo
// nao tem resolver, o Apollo usa o default resolver, que e basicamente
// (parent, args, contextValue, info) => parent[info.fieldName].
// Como getPostById ja devolve title e content, isso basta.
export const resolvers = {
  Query: {
    post: (_parent: unknown, args: { id: string }): Promise<Post> => getPostById(args.id),

    posts: (): Promise<Post[]> => getPosts(),
  },

  Post: {
    // O field resolver de comments. Repare que o id nao vem dos args da query,
    // vem do parent -- o Post que Query.post (ou Query.posts) ja carregou.
    // E ele so executa se o campo comments aparecer na query.
    comments: (parent: Post, _args: unknown, contextValue: Context): Promise<Comment[]> =>
      contextValue.loaders.comments.load(parent.id),
  },
}
