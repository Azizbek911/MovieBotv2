import { Context } from "telegraf";
import forceSubscription from "../models/forceSubscriptions.module";
import zayafka from "../models/zayafka.module";
import bot from "../index";
import { removeAt } from "./remover";



export const forceSubscriptions = async (ctx: Context): Promise<string[]> => {
    try {
        const userId = ctx.from?.id;
        if (!userId) return [];
        const subscriptions: string[] = [];

        const publiChannels = await forceSubscription.find().lean();
        const zayafkaChannels = await zayafka.find().lean();
        await Promise.all(
            publiChannels.map(async (item) => {
                if (!item.url) return;

                const member = await bot.telegram.getChatMember(item.url, userId);

                if (
                    member.status !== "administrator" &&
                    member.status !== "creator" &&
                    member.status !== "member"
                ) {
                    const newUsername = removeAt(item.url)
                    if (newUsername) subscriptions.push(`https://t.me/${newUsername}`);
                }
            })
        );

        zayafkaChannels.map((item) => {
           if(!item.storage.includes(userId)) {
            if (!item.url) return;
            subscriptions.push(item.url)
           } 
        });

        return subscriptions;
    } catch (err) {
        console.error(err);
        return [];
    }
};
