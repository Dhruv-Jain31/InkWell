import { verify } from "hono/jwt";

export default async function authMiddleware(c:any, next: () => void) {
    const token = c.req.header("authorization") || "";

    try{
        const user = await verify(token, c.env.JWT_SECRET);
        if(user){
            c.set("userId", user.id);
            await next();
        }
    }
    catch(err:any){
        if(err.name === "JwtTokenInvalid"){
            c.status(403);
            return c.json({
                "message": "You are not authorized",
            });
        }
        console.log("Error", err);
        c.status(400);
        return c.json({
            "message" : "Internal server error"
        });
    }
}