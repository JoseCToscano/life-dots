import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { env } from "@/env";

export async function POST(req: Request) {
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(env.WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }

    if (evt.type === "user.created" || evt.type === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        await db.user.upsert({
            where: { id },
            create: {
                id,
                email,
                name,
                image: image_url,
            },
            update: {
                email,
                name,
                image: image_url,
            },
        });
    }

    return new Response("Webhook processed", { status: 200 });
} 