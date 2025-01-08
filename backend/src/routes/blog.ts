import { PrismaClient } from "@prisma/client/edge";
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
    };
}>();

blogRouter.use('/*', authMiddleware);

enum ResponseStatus {
    Success = 200,
    NotFound = 404,
    Unauthorized = 403,
    Refuse = 411,
    Error = 500
}


blogRouter.post('/', async(c) => {
    console.log("POST /blog hit");
    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    try{
        const indian_Time = moment.tz("Asia/Kolkata").format("D/M/YYYY, h:mm:ss");
        const blog = await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: parseInt(c.get("userId")),
                postedOn: indian_Time,
                published: true,
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
                authorId: parseInt(c.get("userId")),
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

blogRouter.get('/bulk', async(c) => {
    if (c.req.param("id")) {
        return c.json({ message: "Invalid blog ID" });
    }
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

blogRouter.get("/:id", async(c) => {
    const id = c.req.param("id");

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try{
        //ensuring id is a number
        if(!id || isNaN(Number(id))){
            c.status(400);
            return c.json({
                "message" : "Invalid blog ID",
            });
        }
        const blog = await prisma.blog.findUnique({
            where: {
                id : Number(id),
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

        //case where blog doesn't exist
        if(!blog){
            c.status(404);
            return c.json({
                "message" : "Blog not found",
            })
        }
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

blogRouter.delete("/:id", async (c) => {
	const id = c.req.param("id");

	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	try {
		const res = await prisma.blog.delete({
			where: {
				id: parseInt(id),
				authorId: parseInt(c.get("userId")),
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

blogRouter.get ("/both", async(c)=> {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(c.get("userId")),
            },
            select: {
                id: true,
                name: true,
                username: true,
                blogs: true,
            },
        });
        return c.json({ user });
    }
    catch(err){
        console.log("Error: ", err);
        c.status(403);
        c.json({
            "message" : "Internal server error",
        });
    }
});

