import { verify } from "hono/jwt";

export default async function authMiddleware(c:any, next: () => void) {
    const token = c.req.header("authorization") || "";
    console.log("Auth middleware triggered");

    try{
        const user = await verify(token, c.env.JWT_SECRET);
        console.log("Token verified:", user);
        if(user){
            c.set("userId", user.id);
            console.log("User ID set:", user.id);
            console.log("Middleware triggered for method:", c.req.method);
            await next();
            console.log("Request passed middleware:", c.req.method);
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