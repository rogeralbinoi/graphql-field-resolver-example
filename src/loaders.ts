import DataLoader from 'dataloader'
import { getCommentsByPostIds, type Comment } from './blog-service.js'

export type Loaders = {
  comments: DataLoader<string, Comment[]>
}

// Junta todos os load() que aconteceram no mesmo tick do event loop em uma
// unica chamada REST. Sem isso, uma query com 5 posts faria 5 requests de
// comentarios -- o problema N+1.
export const createCommentsLoader = () =>
  new DataLoader<string, Comment[]>(async (postIds) => {
    const comments = await getCommentsByPostIds(postIds)

    // O DataLoader exige um array de retorno na MESMA ordem dos ids pedidos.
    return postIds.map((postId) => comments.filter((comment) => comment.postId === postId))
  })

export const createLoaders = (): Loaders => ({
  comments: createCommentsLoader(),
})
