import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { User } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode,sign,verify } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    }
}>() // tells typescript the data type of url in the .toml file

enum ResponseStatus {
  Success = 200,
  NotFound = 404,
  Unauthorized = 403,
  Refuse = 411,
  Error = 500
}


userRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL, //through c var we have the access of database url so can't dec it globally
  }).$extends(withAccelerate())

  try{
    const find_user = await prisma.user.findUnique({
      where:{
        username: body.username,
      },
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

    return c.json({jwt});
  }
  catch(e){
    console.log(e);
    c.status(ResponseStatus.Error)
    return c.text('Invalid')
  }
})

userRouter.post('/signin', async(c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL, //through c var we have the access of database url so can't dec it globally
  }).$extends(withAccelerate())

  try{
    const user = await prisma.user.findUnique({
      where:{
        username: body.username,
        password: body.password,
      },
    });

    if(!user){
      c.status(ResponseStatus.Unauthorized)
      return c.json({
        error: "incorrect credentials",
      })
    }
    const jwt = await sign({
      id: user.id, username: user.username, name: user.name
    },c.env.JWT_SECRET);
    return c.json({jwt});
  }
  catch(e){
    c.status(ResponseStatus.Refuse);
    console.log("error",e);
    return c.json({"message": "error in signing in"});
  }
});
