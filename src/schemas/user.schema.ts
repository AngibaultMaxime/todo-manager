import z from "zod";

export const updateUserSchema = z.object({
    role: z.enum(["ADMIN", "USER"]),
});

export type UpdateTodoInput = z.infer<typeof updateUserSchema>