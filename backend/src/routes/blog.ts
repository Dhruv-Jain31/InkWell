import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import authMiddleware from "../authMiddleware"
import * as moment from "moment-timezone";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
    Variables: {
        userId: string;
    }
}>();

enum ResponseStatus {
    Success = 200,
    NotFound = 404,
    Unauthorized = 403,
    Refuse = 411,
    Error = 500
}

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
                authorId: c.get("userId"),
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

blogRouter.put('/', async(c) => {
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try{
        const blog = await prisma.blog.update({
            where:{
                id : body.id,
                authorId: c.get("userId"),
            },
            data: {
                title: body.title,
                content: body.content,
                published: body.published,
            },
        });
        return c.json({
            "message": "Blog updated Successfully: " + blog.id,
        });
    }
    catch(err){
        console.log("Error: ", err);
        c.status(ResponseStatus.Error);
        return c.json({
            "message": "Internal Server Error"
        });
    }
});

blogRouter.get("/:id", async(c) => {
    const id = c.req.param("id");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try{
        const blog = await prisma.blog.findUnique({
            where: {
                id : id,
            },
            select: {
                author: {
                    select: {
                        name: true,
                    },
                },
                content: true,
                title: true,
                id: true,
                postedOn: true,
                published: true,
                authorId: true,
            }
        });
        return c.json({blog});
    }
    catch(err){
        console.log("Error: ", err);
        c.status(ResponseStatus.Error);
        c.json({
            "message": "Internal server error",
        });
    }
});

blogRouter.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
        const blogs = await prisma.blog.findMany({
            where: {
                published: true,
            },
            select:{
                content: true,
                title: true,
                id: true,
                postedOn: true,
                published: true,
                authorId: true,
                author: {
                    select: {name: true},
                },
            },
        });
        return c.json({
            blogs,
        });
    }
    catch(err){
        console.log("Error: " + err);
        c.status(ResponseStatus.Error);
        return c.json({"message": "Internal Server Error"});
    }
});

blogRouter.delete("/:id", async (c) => {
	const id = c.req.param("id");

	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const res = await prisma.post.delete({
			where: {
				id: id,
				authorId: c.get("userId"),
			},
		});
		console.log(res);
		return c.json({
			message: "Post deleted successfully",
		});
	} catch (error) {
		console.log("Error: ", error);
		c.status(403);
		return c.json({
			message: "Internal Server Error",
		});
	}
});

