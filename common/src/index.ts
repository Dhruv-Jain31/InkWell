import z from "zod";

export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    name: z.string(),
});

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(6),
});

export const updateUserDetailsInput = z.object({
    name: z.string().optional(),
    password: z.string().min(6).optional(),
    username: z.string().email(),
});

export const blogCreateInput = z.object({
    title: z.string(),
    content: z.string(),
    published: z.boolean().optional(),
});

export const blogUpdateInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.string(),
    published: z.boolean(),
});

export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsInput>;
export type BlogCreateInput = z.infer<typeof blogCreateInput>;
export type BlogUpdateInput = z.infer<typeof blogUpdateInput>;