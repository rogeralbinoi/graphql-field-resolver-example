import { getPostById, getPosts, type Comment, type Post } from './blog-service.js'
import type { Loaders } from './loaders.js'

export type Context = {
  loaders: Loaders
}

// Post.title e Post.content não aparecem aqui de propósito: quando um campo
// não tem resolver, o Apollo usa o default resolver, que é basicamente
// (parent, args, context, info) => parent[info.fieldName].
// Como getPostById já devolve title e content, isso basta.
export const resolvers = {
  Query: {
    post: (_parent: unknown, args: { id: string }): Promise<Post> => getPostById(args.id),

    posts: (): Promise<Post[]> => getPosts(),
  },

  Post: {
    // O field resolver de comments. Repare que o id não vem dos args da query,
    // vem do parent (o Post que Query.post ou Query.posts já carregou).
    // E ele só executa se o campo comments aparecer na query.
    comments: (parent: Post, _args: unknown, context: Context): Promise<Comment[]> =>
      context.loaders.comments.load(parent.id),
  },
}
