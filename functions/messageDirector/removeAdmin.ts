import { Context, Markup } from "telegraf";
import bot from "../../index.js";
import User from "../../models/user.module.js";
import type { Message } from "telegraf/types"
import { updateLastMessage } from "../updateLastMessage.ts";
import { errorConsole } from "../errorConsole.ts";

export const removeAdmin = async (ctx: Context, message: string, newMessage: Message) => {
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
            const role = "user";

            const updatedUser = await User.findOneAndUpdate({ id: parseInt(message) }, { role: role }, { new: true });
            if (!updatedUser) {
                newMessage = await ctx.reply("😓 Kechirasiz, siz yuborgan foydalanuvchi botimizda azo emas shekinli: ", Markup.inlineKeyboard([
                    [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
                ]));
            } else {
                let newAdminMessage = await bot.telegram.sendMessage(updatedUser.id, "⚠️ Eslatma: Siz endi botning admini emassiz. Sizning adminlik huquqlaringiz olib tashlandi.", Markup.inlineKeyboard([
                    [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
                ]));
                await updateLastMessage(newAdminMessage, parseInt(message));
                if (!updatedUser) {
                    newMessage = await ctx.reply("Kechirasiz, bunday foydalanuvchi topilmadi. Iltimos, to'g'ri ID kiriting!", Markup.inlineKeyboard([
                        [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                    ]));
                } else {
                    newMessage = await ctx.reply(`✅ Foydalanuvchi (ID: ${updatedUser.first_name}) muvaffaqiyatli adminlikdan olib tashlandi!`, Markup.inlineKeyboard([
                        [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                    ]));

                }
            }
            await updateLastMessage(newMessage, targetUser.id);
        }

    } catch (err) {
        await errorConsole(err, "Admin o'chirishda xatolik mavjud:", ctx);
    }
}