import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono"
import * as moment from "moment-timezone";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

enum ResponseStatus {
    Success = 200,
    NotFound = 404,
    Unauthorized = 403,
    Refuse = 411,
    Error = 500
}


blogRouter.use("/*", (c,next)) => {
    next();
});


blogRouter.post('/', async(c) => {
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try{
        const indian_Time = moment.tz("Asia/Kolkata").format("D/M/YYYY, h:mm:ss");
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: 1,
                postedOn: indian_Time,
                published: body.published,
            },
        });
        return c.json({
            "message": "blog created successfully" + blog.id,
        });
    }
    catch(err){
        console.log("Error: ", err);
        c.status(ResponseStatus.Unauthorized);
        return c.json({"message": "Internal server error"});
    }
})

blogRouter.put('/', (c) => {
    return c.text('Hello Hono!')
})

blogRouter.get('/', (c) => {
    return c.text('Hello Hono2!')
})

blogRouter.get('/bulk', (c) => {
    return c.text('Hello Hono!')
})