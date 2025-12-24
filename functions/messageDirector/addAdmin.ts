import { Context, Markup } from "telegraf";
import bot from "../../index.js";
import User from "../../models/user.module.js";
import { admin } from "../buttons/userButtons.js";
import { updateLastMessage } from "../updateLastMessage.ts";
import { errorConsole } from "../errorConsole.ts";
import { Message } from "telegraf/types";



export const addAdmin = async (ctx: Context, message: string, newMessage: Message) => {
    try {
        if (!ctx || !ctx.from) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start")
        const targetUser = await User.findOne({ id: ctx.from.id })
        if (!targetUser) return ctx.reply("🤕 Kechirasiz xatolik mavjud\n\n♻️ Iltimos botni qayta ishga tushiring /start");
        if (targetUser.role !== "owner") {
            return ctx.reply("Kechirasiz, bu amalni faqat bot egasi bajarishi mumkin.", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
        }
        if (isNaN(parseInt(message))) {
            newMessage = await ctx.reply("Kechirasiz, noto'g'ri ID kiritildi. Iltimos, yaroqli ID kiriting!", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]))
        } else {
            const role = "admin";

            const updatedUser = await User.findOneAndUpdate({ id: parseInt(message) }, { role: role }, { new: true });

            if (!updatedUser) {
                return await ctx.reply("Kechirasiz, bunday foydalanuvchi topilmadi. Iltimos, to'g'ri ID kiriting!", Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]));
            };
            let newAdminMessage = await bot.telegram.sendMessage(updatedUser.id, "🎉 Siz endi botning adminisiz! Sizga barcha huquqlar berildi.", Markup.inlineKeyboard(admin));
            await updateLastMessage(newAdminMessage, parseInt(message));
            newMessage = await ctx.reply(`✅ Foydalanuvchi (ID: ${updatedUser.first_name}) muvaffaqiyatli admin qilib belgilandi!`, Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
        }


        await updateLastMessage(newMessage, targetUser.id);
    } catch (err) {
        await errorConsole(err, "Admin qo'shishda xatolik mavjud:", ctx);
    }
}