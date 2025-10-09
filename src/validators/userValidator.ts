import {z} from "zod";

export const userRegisterSchema = z.object({
    email: z.email(),
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов")
        .max(64, "Пароль должен содержать максимум 64 символа"),
    fullname: z.string(),
});

export type UserRegisterDTO = z.infer<typeof userRegisterSchema>;