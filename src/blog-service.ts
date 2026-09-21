const API = 'https://jsonplaceholder.typicode.com'

export type Post = {
  id: string
  title: string
  content: string
}

export type Comment = {
  postId: string
  id: string
  author: string
  content: string
}

type RestPost = { id: number; title: string; body: string }
type RestComment = { postId: number; id: number; name: string; email: string; body: string }

// Loga toda chamada REST para ficar visivel, no terminal, quais datasources
// cada query tocou.
const get = async <T>(path: string): Promise<T> => {
  console.log('-> GET', path)
  const response = await fetch(`${API}${path}`)

  if (!response.ok) {
    throw new Error(`GET ${path} respondeu ${response.status}`)
  }

  return (await response.json()) as T
}

const toPost = ({ id, title, body }: RestPost): Post => ({
  id: String(id),
  title,
  content: body,
})

const toComment = ({ postId, id, email, body }: RestComment): Comment => ({
  postId: String(postId),
  id: String(id),
  author: email,
  content: body,
})

export const getPostById = async (id: string): Promise<Post> =>
  toPost(await get<RestPost>(`/posts/${id}`))

export const getPosts = async (): Promise<Post[]> =>
  (await get<RestPost[]>('/posts?_limit=5')).map(toPost)

// A API aceita varios postId na mesma chamada, e e isso que permite o batch
// do DataLoader: /comments?postId=1&postId=2&postId=3
export const getCommentsByPostIds = async (postIds: readonly string[]): Promise<Comment[]> => {
  const query = postIds.map((postId) => `postId=${postId}`).join('&')

  return (await get<RestComment[]>(`/comments?${query}`)).map(toComment)
}
