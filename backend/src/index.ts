import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { User } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,sign,verify } from 'hono/jwt'


const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>() // tells typescript that database url is string

enum ResponseStatus {
  Success = 200,
  NotFound = 404,
  Refuse = 411,
  Error = 500
}


app.post('/api/v1/users/signup', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL, //through c var we have the access of database url so can't dec it globally
  }).$extends(withAccelerate())

  try{
    const find_user = await prisma.user.findUnique({
      where:{
        username: body.username,
      }
    });

    if (find_user){
      c.status(ResponseStatus.Refuse);
      return c.json({
        message: "Username already exists",
      });
    }
    console.log(find_user);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        name: body.name,
      }
    })
    const jwt = await sign({
      id: user.id, username: user.username, name: user.name,
    },c.env.JWT_SECRET)

    return c.text(jwt);
  }
  catch(e){
    console.log(e);
    c.status(ResponseStatus.Error)
    return c.text('Invalid')
  }
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

