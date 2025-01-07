import { Hono } from 'hono'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}>() // tells typescript the data type of url in the .toml file

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

console.log("Routes registered:");
console.log("/api/v1/user -> userRouter");
console.log("/api/v1/blog -> blogRouter");


export default app

