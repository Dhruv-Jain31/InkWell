import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'
import authMiddleware from '../authMiddleware'
import {
         signupInput,
         signinInput,
         updateUserDetailsInput,
} from '@dhruv_npm/inkwell-common'

export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      JWT_SECRET: string;
    };
    Variables: {
      userId: string;
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
  const { success } = signupInput.safeParse(body);

  if (!success){
    c.status(ResponseStatus.Unauthorized);
    return c.json({
      "message": "Invalid Inputs",
    });
  }

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

    //hashing the password
    const hashed_password = await bcrypt.hash(body.password,10);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashed_password,
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
  const { success } = signinInput.safeParse(body);

  if(!success){
    c.status(ResponseStatus.Refuse);
    return c.json({
      "message" : "Invalid Inputs",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL, //through c var we have the access of database url so can't dec it globally
  }).$extends(withAccelerate())

  try{
    const user = await prisma.user.findUnique({
      where:{
        username: body.username,
      },
    });

    if(!user){
      c.status(ResponseStatus.Unauthorized)
      return c.json({
        error: "incorrect credentials",
      })
    }

    //comparing passwords
    const password_match = await bcrypt.compare(body.password, user.password);
    //body.password: The password entered by the user
   //user.password: The hashed password stored in the database.


    if (!password_match) {
      c.status(ResponseStatus.Unauthorized);
      return c.json({
        error: "Incorrect credentials",
      });
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

userRouter.put("/update",authMiddleware, async(c) => {
  const body = await c.req.json();

  const { success } = updateUserDetailsInput.safeParse(body);

  if(!success){
    c.status(ResponseStatus.Unauthorized);
    return c.json({
      "message": "Invalid Inputs",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{

    // Check if the password is being updated
    if (body.password) {
    // Rehash the new password before saving
    body.password = await bcrypt.hash(body.password, 10);
    }

    const res = await prisma.user.update({
      where: {
        id : parseInt(c.get("userId"))
      },
      data: body, //we can include fields that are optional or updatable in your User model.
    });
    return c.json({
      "message" : "Details Updated",
    });
  }
  catch(err){
    c.status(403);
    return c.json({
      "message": "Internal Server Error",
    });
  }
});

userRouter.get("/:id",authMiddleware, async(c) => {
  const id = c.req.param("id");

  const prisma = new PrismaClient({
    datasourceUrl : c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        name: true,
        username: true,
        blogs: {
          where: {
            published: true,
          },
        },
      },
    });
    console.log(user);
    return c.json({ user });
  }
  catch(err){
    console.log("Error:" + err);
    c.status(403);
    return c.json({
      "message": "Internal server error",
    })
  }
});
