import { Context } from "telegraf";
import { errorConsole } from "../errorConsole.ts";
import zayafka from "../../models/zayafka.module.js";



export const userKeeperRequest = async (ctx:Context) => {
    try {
        const userId = ctx.from?.id;
        const chatId = ctx.chat?.id;

        const requests = await zayafka.findOne({ id: chatId });

        if (requests) {
            if (!requests.storage.includes(userId)) {
                requests.storage.push(userId);
                await requests.save();
            } else {
                console.warn("⚠️ User mavjud")
            }
        } else {
            console.warn("⚠️ Bu kanalga zayafka yig'ilmaydi")
        }
    } catch (err) {
        errorConsole(err, "Userlarni requestini saqlashda xatolik mavjud:", ctx)
    }
}