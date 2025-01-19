import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
    getUser: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.db.user.findUnique({
                where: {
                    id: ctx.userId,
                },
                select: {
                    id: true,
                    birthDate: true,
                },
            });
            console.log(user)
            return user;
        }),

    updateBirthdate: protectedProcedure
        .input(z.object({
            birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
        }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findFirst({
                where: {
                    id: ctx.userId,
                },
            });
            if (!user) {
                await ctx.db.user.create({
                    data: {
                        id: ctx.userId,
                        birthDate: new Date(input.birthdate),
                    },
                });
            } else {
                return ctx.db.user.update({
                    where: {
                        id: ctx.userId,
                    },
                    data: {
                        birthDate: new Date(input.birthdate),
                    },
                });
            }
        }),
}); 