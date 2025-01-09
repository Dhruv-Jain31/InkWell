import z from "zod";
export declare const signupInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    name: string;
}, {
    username: string;
    password: string;
    name: string;
}>;
export declare const signinInput: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const updateUserDetailsInput: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password?: string | undefined;
    name?: string | undefined;
}, {
    username: string;
    password?: string | undefined;
    name?: string | undefined;
}>;
export declare const blogCreateInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    published: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    published?: boolean | undefined;
}, {
    title: string;
    content: string;
    published?: boolean | undefined;
}>;
export declare const blogUpdateInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    id: z.ZodString;
    published: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    published: boolean;
    id: string;
}, {
    title: string;
    content: string;
    published: boolean;
    id: string;
}>;
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type UpdateUserDetailsInput = z.infer<typeof updateUserDetailsInput>;
export type BlogCreateInput = z.infer<typeof blogCreateInput>;
export type BlogUpdateInput = z.infer<typeof blogUpdateInput>;
