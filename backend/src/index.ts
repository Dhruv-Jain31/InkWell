import { Hono } from 'hono'

const app = new Hono()

app.post('/api/v1/users/signup', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/users/signin', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.put('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/v1/blog', (c) => {
  return c.text('Hello Hono2!')
})

app.get('/api/v1/blog/blog', (c) => {
  return c.text('Hello Hono!')
})

export default app

