# Field Resolver no Apollo Server

Exemplo executável do post [**Trabalhando com Field Resolver no Apollo Server**](https://rogeralbino.dev.br/posts/trabalhando-com-field-resolvers-no-apollo-server).

A ideia: agregar dados de dois datasources diferentes em uma única query GraphQL, e só pagar pela
segunda chamada quando o cliente realmente pedir aquele campo.

- `Query.post` busca o post em `/posts/:id`
- `Post.comments` é um **field resolver**: busca os comentários em `/comments?postId=:id`, usando o
  `id` que veio do `parent`

No schema isso não aparece: para quem consome a API, `comments` é só mais um campo de `Post`.

A "API Rest" aqui é o [JSONPlaceholder](https://jsonplaceholder.typicode.com).

## Rodando

Requer Node 20 ou superior.

```bash
npm install
npm run dev
```

O servidor sobe em <http://localhost:4000> com o Apollo Sandbox.

## O que observar

Cada chamada REST é logada no terminal (`-> GET /posts/1`). É esse log que mostra o comportamento.

**1. O field resolver só roda se o campo for pedido.**

```graphql
query {
  post(id: "1") {
    title
  }
}
```

```
-> GET /posts/1
```

Uma request e nenhuma chamada a `/comments`. Ou seja, o resolver de `comments` nem foi executado.

**2. Pedindo o campo, a segunda chamada acontece.**

```graphql
query {
  post(id: "1") {
    title
    comments {
      author
      content
    }
  }
}
```

```
-> GET /posts/1
-> GET /comments?postId=1
```

**3. Em lista, o DataLoader evita o N+1.**

```graphql
query {
  posts {
    title
    comments {
      author
    }
  }
}
```

```
-> GET /posts?_limit=5
-> GET /comments?postId=1&postId=2&postId=3&postId=4&postId=5
```

São 5 posts, então o resolver de `comments` roda 5 vezes, mas o `DataLoader` junta os 5 `load()` que
aconteceram no mesmo tick do event loop em uma chamada só. Duas requests em vez de seis.

## Estrutura

```
src/
  index.ts          servidor + context (um loader novo por request)
  schema.ts         typeDefs
  resolvers.ts      Query.post, Query.posts, Post.comments
  blog-service.ts   cliente da API Rest
  loaders.ts        DataLoader dos comentários
```

Aqui o resolver map cabe em um arquivo. Em um schema de verdade o padrão é uma pasta por tipo
(`resolvers/Query/post.ts`, `resolvers/Post/comments.ts`) e um `index` que monta o objeto.

Dois pontos que valem a leitura do código:

- `title` e `content` não têm resolver em `resolvers.ts`. Quando um campo não tem resolver, o Apollo usa
  o *default resolver*, que é basicamente `(parent, args, context, info) => parent[info.fieldName]`.
  Como o service já devolve essas propriedades, não há o que escrever.
- `context` em `index.ts` é uma **função**, chamada a cada request. É isso que garante um loader novo por
  request. Um loader global faria o cache dele vazar entre usuários diferentes.

## Diferenças em relação ao código do post

O post usa a mesma stack deste repositório (`@apollo/server` 5 com `startStandaloneServer`, TypeScript e
ESM), então as diferenças são poucas:

- organização: aqui o resolver map fica em um arquivo só (`src/resolvers.ts`), e no post é uma pasta por
  tipo (`resolvers/Query/post.ts`, `resolvers/Post/comments.ts`) e um `context.ts` separado, com o service
  e o loader em `services/blog.ts` e `loaders/comments.ts`;
- endpoint dos comentários: o post fala em `/posts/:id/comments`, mas aqui é `/comments?postId=:id`,
  porque o JSONPlaceholder aceita vários `postId` na mesma chamada e é isso que permite o batch do
  DataLoader;
- DataLoader: no post, o field resolver aparece primeiro sem DataLoader (`getCommentsByPostId`) e depois
  com DataLoader, e aqui ele já está direto na versão com DataLoader.

Uma pegadinha de instalação: `npm install graphql` hoje traz a v17, mas o `@apollo/server` 5 pede
`graphql@^16.11.0`. Por isso o `package.json` fixa `graphql@^16.14.2`.

## Referências

- [Resolvers (Apollo Server)](https://www.apollographql.com/docs/apollo-server/data/resolvers)
- [DataLoader](https://github.com/graphql/dataloader)
