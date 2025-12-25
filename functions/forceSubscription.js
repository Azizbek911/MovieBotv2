import forceSubscription from "../models/forceSubscriptions.module.js";
import zayafka from "../models/zayafka.module.js";
import bot from "../index.js";
import { removeAt } from "./remover.js";



export const forceSubscriptions = async (ctx) => {
    try {
        const userId = ctx.from?.id;
        if (!userId) return [];
        const subscriptions = [];

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
