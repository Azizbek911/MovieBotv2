import { Markup } from "telegraf"
import { errorConsole } from "../errorConsole.js"
import zayafka from "../../models/zayafka.module.js";
import { updateLastMessage } from "../updateLastMessage.js";



    export const removeZayafka = async (ctx) => {
        try {
            let newMessage;
            const message = ctx.message.text;
            const isEmpty = await zayafka.findOne({ id: message });
            if (isEmpty) {
                await zayafka.deleteOne({ id: message });
                newMessage = await ctx.reply("✅ Zayafka o'chirib tashlandi", Markup.inlineKeyboard([
                    [Markup.button.callback("🏡 Bosh Menu", "admin_main")]
                ]));
            } else {
                newMessage = await ctx.reply("⚠️ Siz kiritgan zayafka ID mavjud emas", Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                ]));
            }

            await updateLastMessage(newMessage, ctx.from.id);
        } catch (err) {
           await errorConsole(err, "Zayafka o'chirishda xatolik mavjud:", ctx)
        }
    }