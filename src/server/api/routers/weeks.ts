import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const reminderSchema = z.object({
    id: z.string().optional(),
    text: z.string(),
    completed: z.boolean(),
});

export const weeksRouter = createTRPCRouter({
    getWeek: protectedProcedure
        .input(z.object({ weekNumber: z.number() }))
        .query(async ({ ctx, input }) => {
            console.log('Getting week', input.weekNumber, ctx.userId)
            return ctx.db.week.findFirst({
                where: {
                    userId: ctx.userId,
                    weekNumber: input.weekNumber,
                },
            });
        }),

    upsertJournalEntry: protectedProcedure
        .input(z.object({
            weekNumber: z.number(),
            journalText: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const existingWeek = await ctx.db.week.findFirst({
                where: {
                    userId: ctx.userId,
                    weekNumber: input.weekNumber,
                },
            });
            if (!existingWeek) {
                return ctx.db.week.create({
                    data: {
                        weekNumber: input.weekNumber,
                        journalText: input.journalText,
                        userId: ctx.userId,
                    },
                });
            } else {
                return ctx.db.week.update({
                    where: {
                        id: existingWeek.id,
                    },
                    data: {
                        journalText: input.journalText,
                    },
                });
            }

        }),

    getAllWeeks: protectedProcedure.query(async ({ ctx }) => {
        const weeks = await ctx.db.week.findMany({
            where: {
                userId: ctx.userId,
            },
            orderBy: {
                weekNumber: 'asc',
            },
            select: {
                weekNumber: true,
                journalText: true,
                reminders: true
            }
        });

        return weeks;
    }),

    upsertWeekData: protectedProcedure
        .input(z.object({
            weekNumber: z.number(),
            journalText: z.string().optional(),
            reminders: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // First try to find the existing week
            const existingWeek = await ctx.db.week.findFirst({
                where: {
                    weekNumber: input.weekNumber,
                    userId: ctx.userId
                },
            });

            if (existingWeek) {
                // Update existing week
                return ctx.db.week.update({
                    where: {
                        id: existingWeek.id,
                    },
                    data: {
                        journalText: input.journalText,
                        reminders: input.reminders ?? existingWeek.reminders,
                    },
                });
            } else {
                // Create new week
                return ctx.db.week.create({
                    data: {
                        weekNumber: input.weekNumber,
                        journalText: input.journalText,
                        reminders: input.reminders ?? '',
                        userId: ctx.userId,
                    },
                });
            }
        }),


    updateReminders: protectedProcedure
        .input(z.object({
            weekNumber: z.number(),
            reminders: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const existingWeek = await ctx.db.week.findFirst({
                where: {
                    weekNumber: input.weekNumber,
                    userId: ctx.userId,
                },
            });

            if (existingWeek) {
                return ctx.db.week.update({
                    where: {
                        id: existingWeek.id,
                    },
                    data: {
                        reminders: input.reminders,
                    },
                });
            } else {
                return ctx.db.week.create({
                    data: {
                        weekNumber: input.weekNumber,
                        reminders: input.reminders,
                        userId: ctx.userId,
                    },
                });
            }
        }),
}); 