import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole"
import { Message } from "telegraf/types"
import zayafka from "../../models/zayafka.module";
import { updateLastMessage } from "../updateLastMessage";



    export const removeZayafka = async (ctx: Context) => {
        try {
            let newMessage:Message;
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