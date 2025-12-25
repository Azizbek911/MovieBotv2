import { Markup } from "telegraf"
import { errorConsole } from "../errorConsole.js"
import { updateLastMessage } from "../updateLastMessage.js";
import User from "../../models/user.module.js";
import { activateSubscription } from "../subscription.js";
import bot from "../../index.js";


export const activateSubscribe = async (ctx) => {
    try {
        let newMessage;
        if (!ctx.session.user_id) {
            const targetUserID = parseInt(ctx.message.text);
            if (isNaN(targetUserID)) {
                newMessage = await ctx.reply("😓 Iltimos, menga faqat raqamlardan tashkil topgan userID jo'nating: ", Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]));
            } else {
                const targetUser = await User.findOne({ id: targetUserID })
                if (!targetUser) {
                    newMessage = await ctx.reply("🤕 Afsuski bizda bunday foydalanuvchi mavjud emas, boshqa foydalanuvchi yoki IDini sinab ko'ring: ", Markup.inlineKeyboard([
                        [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                    ]));
                } else {
                    newMessage = await ctx.reply(`✅ Foydalanuvchi topildi\n\nFoydalanuvchi useri: ${targetUser.username || targetUser.id}\n\nendi obunani nechi oyga aktivlashtirmoqchisz: `, Markup.inlineKeyboard([
                        [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                    ]))
                    ctx.session.user_id = targetUserID;
                }
            }
        } else if (ctx.session.user_id) {
            const month = parseInt(ctx.message.text);
            if (isNaN(month)) {
                newMessage = await ctx.reply("Iltimos oylarni raqamlarda kiriting: ", Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]))
            } else {
                const result = await activateSubscription(ctx.session.user_id, month);
                if (result.success === false) {
                    newMessage = await ctx.reply("Kchirasiz xatolik mavjud, iltimos keyinroq urinib ko'ring", Markup.inlineKeyboard([
                        [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                    ]));
                } else {
                    newMessage = await ctx.reply(result.message, Markup.inlineKeyboard([
                        [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                    ]))
                    let targetUserMessage = await bot.telegram.sendMessage(result.data?.user.id, `Toʻlovingiz uchun rahmat.
Premium obunangiz endi ${result.data?.endDate} sanasigacha faol.`);
                    await updateLastMessage(targetUserMessage, result.data?.user.id);
                }
            }
        }

        await updateLastMessage(newMessage, ctx.from.id)
    } catch (err) {
        await errorConsole(err, "Obunani faollashtirishda xatolik mavjud:", ctx)
    }
}