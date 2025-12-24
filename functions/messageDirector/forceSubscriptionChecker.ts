import { Context, Markup } from "telegraf"
import { errorConsole } from "../errorConsole"
import { forceSubscriptions } from "../forceSubscription";
import extraLink from "../../models/extraLink.module";
import { Message } from "telegraf/types";
import { updateLastMessage } from "../updateLastMessage";



export const forceSubscriptionChecker = async (ctx:Context) => {
    try {
        const userId = ctx.from?.id;
        const channels = await forceSubscriptions(ctx);
        const extraLinks = await extraLink.find().lean();
        let newMessage:Message;
        if (channels.length !== 0){
            if (extraLinks.length !== 0) {
                extraLinks.map((item) => {
                    if (!item.url) return;
                    channels.push(item.url);
                })
            }
            let counter = 1;
            const buttons = [];
            channels.map((item) => {
                buttons.push([Markup.button.url(`${counter} - Kanal`, item)]);
                counter++;
            });
            buttons.push([Markup.button.callback("✅ Tekshirish", "force_subscription_check")]);
            newMessage = await ctx.reply("🤕 Kechirasiz siz botimizni ishlatishdan oldin majburiy kanallarga azo bo'lishingiz kerak: ", Markup.inlineKeyboard(buttons))  
            await updateLastMessage(newMessage, ctx!.from!.id);         
            return;
        }
    } catch (err) {
        errorConsole(err, "Majburiy obunani tekshirishda xatolik mavjud:", ctx)
    }
}