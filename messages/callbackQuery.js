import { Input, Markup } from "telegraf";
import { admin, filter_buttons, help_buttons, payment_buttons, payment_dates, search_movie_buttons, settings, UserMainButton, vip_no } from "../functions/buttons/userButtons.js";
import User from "../models/user.module.js";
import { isAdmin } from "../functions/isAdmin.ts";
import { changeSetting } from "../functions/changeSetting.ts";
import botSetting from "../models/settings.module.js";
import mainChannel from "../models/main.channel.module.js";
import {
    buttonsArray,
    CountiresButtonsArray,
    getCountiresButtons,
    getJanrButtons, getLanguageButtons, getYearButtons, LanguageButtonsArray, YearButtonsArray
} from "../functions/buttons/buttons.ts";
import { clearSession } from "../functions/clearSession.ts";
import movie from "../models/movie.module.js";
import fee from "../models/fee.module.js";
import { forceSubscriptions } from "../functions/forceSubscription.ts";
import { forceSubscriptionChecker } from "../functions/messageDirector/forceSubscriptionChecker.ts";
import { messageSender } from "../functions/messageSender.ts";



export const callbackQueryHandler = async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        const botSettings = await botSetting.findOne({ name: "setting" })
        const userID = ctx.from.id;
        const targetUser = await User.findOne({ id: userID });
        const message_id = targetUser.last_message_id;
        const checkAdmin = await isAdmin(userID);
        const channels = await forceSubscriptions(ctx);
        let newMessage;

        if (channels.length !== 0 && targetUser.role === "user") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id)
            return await forceSubscriptionChecker(ctx);
        }

        if (!ctx.session) ctx.session = {};


        if (callbackData === "search_movie") {
            try {
                // Delete the original video message
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);

                // Send a new text message with the desired content
                newMessage = await ctx.reply("🔘 Filmlarni qidirish uchun quyidagilardan birini tanlang:", {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: search_movie_buttons
                    }
                });
            } catch (error) {
                console.error("Error handling search_movie callback:", error);
                // Optional: Fallback reply if delete/send fails
                await ctx.reply("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
            }
        } else if (callbackData === "main_menu") {
            clearSession(ctx);
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.replyWithPhoto(Input.fromLocalFile("./database/photos/welcome.jpg"), {
                caption: `• Assalomu alaykum, ${ctx.from.first_name} Botimizga xush kelibsiz!\n\n✍🏻 | O'zingizga kerakli bo'lgan film kodini yuboring!`,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: UserMainButton
                }
            });
        } else if (callbackData === "admin_main") {
            clearSession(ctx);
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Admin bo'limiga xush kelibsiz: ", Markup.inlineKeyboard(admin));
        } else if (callbackData === "filter") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("🔘 Filmlarni qidirish uchun quyidagilardan birini tanlang:", {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: filter_buttons
                }
            });
            ctx.session.back = "filter";
        } else if (callbackData === "back") {
            clearSession()
            if (ctx.session.back === "filter") {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply("🔘 Filmlarni qidirish uchun quyidagilardan birini tanlang:", {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: search_movie_buttons
                    }
                });
            } else if (ctx.session.back === "setting") {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply("Bo'limni tanleng: ", Markup.inlineKeyboard(settings));
            } else if (ctx.session.back === "janr") {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply("Bo'limni tanleng: ", Markup.inlineKeyboard([
                    [Markup.button.callback("➕ Janr qo'shish", "add_janr"), Markup.button.callback("➖ Janr olish", "remove_janr")],
                    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
                ]))
            } else {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply("Bosh menu: ", Markup.inlineKeyboard(checkAdmin ? admin : UserMainButton))
            }
        } else if (callbackData === "random_movie") {
            if (botSettings.random_movie === true) {
                if (targetUser.ispremium === false) return await ctx.answerCbQuery("❌ Bu funksiyadan foydalanish uchun VIP obunaga ega bo'lishingiz kerak.", { show_alert: true });
            } else {
                await ctx.answerCbQuery("❌ Bu funksiya vaqtinchalik ishlamayabdi!", { show_alert: true });
            }
        } else if (callbackData === "order_movie") {
            if (botSettings.book_movie === true) {
                if (targetUser.ispremium === false) return await ctx.answerCbQuery("❌ Bu funksiyadan foydalanish uchun VIP obunaga ega bo'lishingiz kerak.", { show_alert: true });
            } else {
                await ctx.answerCbQuery("Kechirasiz bu funksiya ishlmayabdi!", { show_alert: true })
            }
        } else if (callbackData === "my_data") {
            let message = `👤 Malumotlaringiz:\nIsmingiz: ${targetUser.first_name} ${targetUser.last_name}\nUsername: ${targetUser.username ? "@" + targetUser.username : "Mavjud emas"}\n\nPremium obuna: ${targetUser.ispremium ? "Ha ✅" : "Yo'q ❌"}\nOlingan: ${targetUser.subscription_start ? targetUser.subscription_start.toLocaleDateString() : "Mavjud emas ❌"}\nTugaydi: ${targetUser.subscription_end ? targetUser.subscription_end.toLocaleDateString() : "Mavjud emas ❌"}`
            await ctx.answerCbQuery(message, { show_alert: true });
        } else if (callbackData === "vip") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("💎 «VIP» obunasi nima uchun kerak?\n\n⚠️ • Kanallarga obuna bo'lish shart emas\n🚫 • Hech qanday reklamalarsiz\n🎞 • Kerakli filmlar sifatli formatda\n✍🏻 • Film buyurtma qilish imkoniyati\n👨🏼‍💻 • 24/7 qo'llab-quvvatlash xizmati", Markup.inlineKeyboard([
                [Markup.button.callback("💳 Sotib Olish", "buy_premium")],
                [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
            ]))
        } else if (callbackData === "buy_premium") {
            const buttons = await payment_dates();
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            if (buttons.length === 0) {
                newMessage = await ctx.reply("🤕 Kechirasiz, adminlar tomonidan xali obuna narxlari kiritilmagan")
            } else {
                newMessage = await ctx.reply("💎 «VIP» obuna muddatini tanlang:", Markup.inlineKeyboard(buttons));
            }
        } else if (callbackData === "buy_1_month") {
            const fee_cost = await fee.findOne({ name: "fee" });
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`💵 Obuna Narxi: ${fee_cost.fee} UZS\n\n\n⚠️ CLICK tizimi orqali to'lovlar avtomatlashtirilgan bo'lib, to'lov amalga oshishi bilanoq obuna ishga tushadi. Boshqa ilovalar orqali qilingan to'lovlar esa, admin tomonidan tekshirilib so'ngra tasdiqlanadi.`, Markup.inlineKeyboard(payment_buttons))
        } else if (callbackData === "buy_3_months") {
            const fee_cost = await fee.findOne({ name: "fee" });
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`💵 Obuna Narxi: ${fee_cost.fee * 3} UZS\n\n\n⚠️ CLICK tizimi orqali to'lovlar avtomatlashtirilgan bo'lib, to'lov amalga oshishi bilanoq obuna ishga tushadi. Boshqa ilovalar orqali qilingan to'lovlar esa, admin tomonidan tekshirilib so'ngra tasdiqlanadi.`, Markup.inlineKeyboard(payment_buttons))
        } else if (callbackData === "buy_6_months") {
            const fee_cost = await fee.findOne({ name: "fee" });
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`💵 Obuna Narxi: ${fee_cost.fee * 6} UZS\n\n\n⚠️ CLICK tizimi orqali to'lovlar avtomatlashtirilgan bo'lib, to'lov amalga oshishi bilanoq obuna ishga tushadi. Boshqa ilovalar orqali qilingan to'lovlar esa, admin tomonidan tekshirilib so'ngra tasdiqlanadi.`, Markup.inlineKeyboard(payment_buttons))
        } else if (callbackData === "buy_12_months") {
            const fee_cost = await fee.findOne({ name: "fee" });
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`💵 Obuna Narxi: ${fee_cost.fee * 12} UZS\n\n\n⚠️ CLICK tizimi orqali to'lovlar avtomatlashtirilgan bo'lib, to'lov amalga oshishi bilanoq obuna ishga tushadi. Boshqa ilovalar orqali qilingan to'lovlar esa, admin tomonidan tekshirilib so'ngra tasdiqlanadi.`, Markup.inlineKeyboard(payment_buttons))
        } else if (callbackData === "click") {
            await ctx.answerCbQuery("❌ Bu hizmat hozircha mavjud emas", { show_alert: true });
        } else if (callbackData === "card_payment") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            const fee_cost = await fee.findOne({ name: "fee" });
            newMessage = await ctx.reply(`💳 Karta raqam orqali to'lov qilish uchun quyidagi ko'rsatmalarga amal qiling:\n\n1. Quyidagi karta raqamiga to'lovni amalga oshiring: \n\nKarta raqam: 9860 3501 4756 3950\n\n2. To'lov summasi: ${fee_cost.fee} UZS\n\n3. To'lovni amalga oshirgandan so'ng, to'lov haqida skrinshot yoki tasdiqlovchi ma'lumotni adminga yuboring: 👨‍💻 @arslon0202\n\n4. To'lov tasdiqlangach, obunangiz faollashtiriladi.`, Markup.inlineKeyboard([
                [Markup.button.url("👨‍💻 Adminga Murojaat", "https://t.me/arslon0202")],
                [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
            ]))
        } else if (callbackData === "help") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("• Kerakli bo'limni tanleng:", Markup.inlineKeyboard(help_buttons))
        } else if (callbackData === "message_to_admin") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("📩 | Ushbu bo'lim faqatgina muammo yuzaga kelganda adminga xabar yuborish uchun mo'ljallangan.\n\n🚫 Iltimos, bu yerga film kodlari va nomlarini yozmang! Film buyurtmalari uchun alohida bo'lim mavjud.", Markup.inlineKeyboard([
                [Markup.button.url("👨‍💻 Adminga Murojaat", "https://t.me/arslon0202")],
                [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
            ]));
            ctx.session.operation = "message_to_admin";
        } else if (callbackData === "video_manul") {
            await ctx.answerCbQuery("❌ Bu hizmat hozircha mavjud emas", { show_alert: true });
        } else if (callbackData === "admin") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerak bo'limni tanlang: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Admin qo'shish", "add_admin"), Markup.button.callback("➖ Admin o'chirish", "remove_admin")],
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]))
        } else if (callbackData === "add_admin") {
            if (targetUser.role !== "owner") {
                await ctx.answerCbQuery("❌ Kechirasiz, bu amalni faqat bot egasi bajarishi mumkin.", { show_alert: true });
                return;
            }
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("➕ Qo'shmoqchi bo'lgan adminingizni user IDisini kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "add_admin";
        } else if (callbackData === "remove_admin") {
            if (targetUser.role !== "owner") {
                await ctx.answerCbQuery("❌ Kechirasiz, bu amalni faqat bot egasi bajarishi mumkin.", { show_alert: true });
                return;
            }
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("➖ O'chirmoqchi bo'lgan adminingizni user IDisini kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "remove_admin";
        } else if (callbackData === "years" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("⏹️ O'zingizga kerak bo'lgan bo'limni tanleng:", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Yil qo'shish", "add_year"), Markup.button.callback("➖ Yil o'chirish", "remove_year")],
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]))
        } else if (callbackData === "add_year" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos kiritmoqchi bo'lgan yilingizni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "add_year"
        } else if (callbackData === "remove_year" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos o'chirmoqchi bo'lgan yilginizni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "remove_year";
        } else if (callbackData === "settings" && checkAdmin) {
            if (targetUser.role !== "owner") {
                return ctx.reply("Kechirasiz bot sozlamalarini faqat Ega o'zgartira oladi!")
            }
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Sozlamalar: ", Markup.inlineKeyboard(settings))
        } else if (callbackData === "book_movie_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu bo'lim orqali Film buyurtma qilishni faqat VIP obunachilar uchun ochiq qilib quyishingiz mumkin yoki hammaga: ", Markup.inlineKeyboard(vip_no));
            ctx.session.setting = "book_movie";
            ctx.session.back = "setting";
        } else if (callbackData === "random_movie_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu bo'limda tasodifiy filimlarni hammaga ochiq yoki faqat VIP obunachilar uchun qilib sozlab quyishingiz mumkin: ", Markup.inlineKeyboard(vip_no));
            ctx.session.setting = "random_movie"
            ctx.session.back = "setting";
        } else if (callbackData === "country_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu yerda foydalanuvchilar uchun yaratilgan davlatlar orqali film qidirishni faqat VIP foydalanuvchilar uchun yoki hammaga ochiq qilib quyishingiz mumkin: ", Markup.inlineKeyboard(vip_no));
            ctx.session.setting = "country_movie";
            ctx.session.back = "setting";
        } else if (callbackData === "janr_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu bo'lim orqali filimlarni janr bilan qidirishni VIP obunachilar uchun ochiq qib quyishingiz mumkin yoki hammaga: ", Markup.inlineKeyboard(vip_no));
            ctx.session.setting = "janr_movie";
            ctx.session.back = "setting";
        } else if (callbackData === "year_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Bu bo'lim orqali siz filmni yil orqali qidirishni holatini VIP yoki Free qilib quyishingiz mumkin: ", Markup.inlineKeyboard(vip_no));
            ctx.session.setting = "year_movie";
            ctx.session.back = "setting";
        } else if (callbackData === "language_setting" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu bo'lim orqali filimlarni til orqali qidirshni hamma uchun yoki faqat VIP foydalanuvchilar uchun qilib quysangiz bo'ladi: ", Markup.inlineKeyboard(vip_no))
            ctx.session.setting = "language_movie";
            ctx.session.back = "setting";
        } else if (callbackData === "vip_setting_yes" && targetUser.role === "owner") {
            const setting = ctx.session.setting;
            const isFee = true;
            await changeSetting(setting, isFee);
            await ctx.answerCbQuery(`VIP obunaga o'zgartirildi!`, { show_alert: true });
        } else if (callbackData === "all_setting_yes" && targetUser.role === "owner") {
            const setting = ctx.session.setting;
            const isFee = false;
            await changeSetting(setting, isFee);
            await ctx.answerCbQuery(`Bu funksiya endi hamma uchun ochiq!`, { show_alert: true });
        } else if (callbackData === "show_settings" && targetUser.role === "owner") {
            await ctx.answerCbQuery(`Sozlamalar:\n📦 Kino buyurtma qilish: ${botSettings.book_movie ? "💎 VIP" : "🆓 Hamma"}\n🎲 Tasodifiy kino: ${botSettings.random_movie ? "💎 VIP" : "🆓 Hamma"}\n🎥 Janr orqali qidirish: ${botSettings.janr_movie ? "💎 VIP" : "🆓 Hamma"}\n🌎 Davlat orqali qidirish: ${botSettings.country_movie ? "💎 VIP" : "🆓 Hamma"}\n📅 Yil orqali qidirish: ${botSettings.year_movie ? "💎 VIP" : "🆓 Hamma"}\n🌐 Til orqali qidirish: ${botSettings.language_movie ? "💎 VIP" : "🆓 Hamma"}`, { show_alert: true })
        } else if (callbackData === "janr" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerali bo'limni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Janr qo'shish", "add_janr"), Markup.button.callback("➖ Janr olish", "remove_janr")],
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
        } else if (callbackData === "add_janr" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Kiritmoqchi bo'lgan janiringizni kiriting, bu keyinchalik kino qo'shyotganizda chiqadi: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Oraqaga", "back")]
            ]))
            ctx.session.operation = "add_janr";
            ctx.session.back = "janr";
        } else if (callbackData === "remove_janr" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'chirmoqchi bo'lga janiringizni yozing: ", Markup.inlineKeyboard([
                [Markup.button.callback("🔙 Oraqaga", "back")]
            ]));
            ctx.session.operation = "remove_janr";
            ctx.session.back = "janr";
        } else if (callbackData === "country" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerak bo'lgan bo'limni tanleng: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Davlat qo'shish", "add_country"), Markup.button.callback("➖ Davlat olib tashlash", "remove_country")],
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
        } else if (callbackData === "add_country" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Qo'shmoqchi bo'lgan davlatingizni nomini kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "add_country";
        } else if (callbackData === "remove_country" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'chirmoqchi bo'lgan davlatingizni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "remove_country";
        } else if (callbackData === "language" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerakli bo'lgan bo'limni tanleng: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Til qo'shish", "add_language"), Markup.button.callback("➖ Til olib tashlash", "remove_language")],
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else if (callbackData === "add_language" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos, o'zingizga kerakli tilni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "add_language";
        } else if (callbackData === "remove_language" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos olib tashlamoqchi bo'lgan tilingizni yozing: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "remove_language";
        } else if (callbackData === "movie_base_channel" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerakli bo'limni tanleng: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Asosiy kanalni qo'shish", "add_main_channel"), Markup.button.callback("➖ Asosiy kanalni olish", "remove_main_channel")],
                [Markup.button.callback("🏠 Asosiy Menu", "admin_main")]
            ]));
        } else if (callbackData === "add_main_channel" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz bu bo'lim orqali, kinolarni saqlash uchun kanal kiritishingiz mumkin.\n\n⚠️ Etibor bereng, bu kanal o'chib ketsa. Hamma kinolaringizdan ayrilishingiz mumkin !", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
            ctx.session.operation = "add_main_channel";
        } else if (callbackData === "remove_main_channel" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Siz rostan ham kanalni o'chirmoqchimisz ?\n\n⚠️ Kinolar saqlanyotgan kanalni o'chirsangiz, kinolardan ayrilishingiz mumkin!", Markup.inlineKeyboard([
                [Markup.button.callback("🟢 HA", "yes_main_channel"), Markup.button.callback("❌ YOQ", "no_main_channel")],
                [Markup.button.callback("⚠️ Bekor Qilish", "admin_main")]
            ]));
        } else if (callbackData === "yes_main_channel" && targetUser.role === "owner") {
            await mainChannel.deleteOne({ channel: "mainChannel" });
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("✅ Kanal muvofqiyatli o'chirildi", Markup.inlineKeyboard(admin));
            delete ctx.session.operation;
            delete ctx.session.back;
        } else if (callbackData === "no_main_channel" && targetUser.role === "owner") {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("🟢 Amalyot bekor qilindi", Markup.inlineKeyboard(admin));
            delete ctx.session.operation;
            delete ctx.session.back;
        } else if (callbackData === "movie" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerakli bo'limni tanleng: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Kino qo'shish", "add_movie"), Markup.button.callback("➖ Kino olish", "remove_movie")],
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else if (callbackData === "add_movie" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Kiritmoqchi bo'lgan kinoyingizni nomini kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor Qilish", "admin_main")]
            ]));
            ctx.session.operation = "add_movie"
        } else if (((await buttonsArray()).includes(callbackData)) && checkAdmin && ctx.session.movie_parts) {
            const buttons = await getCountiresButtons();
            if (buttons.length === 0) {
                return await ctx.reply("Iltimos Davlatlar kiriting kino kiritishdan oldin!");
            }
            buttons.push([
                Markup.button.callback("🏠 Bosh Menu", "admin_main")
            ]);
            ctx.session.janr = callbackData;
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`✅ Siz tanlagan janr qabul qilindi\n\nJanr: ${callbackData}\n\n🌏 Endi davlatni tanleng: `, Markup.inlineKeyboard(buttons));
        } else if (((await CountiresButtonsArray(callbackData))).includes(callbackData) && checkAdmin && ctx.session.janr) {
            const buttons = await getLanguageButtons();
            if (buttons.length === 0) {
                return await ctx.reply("Iltimos Tillar kiriting kino kiritishdan oldin!");
            }
            buttons.push([
                Markup.button.callback("🏠 Bosh Menu", "admin_main")
            ]);
            ctx.session.country = callbackData;
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`✅ Siz tanlagan davlat qabul qilindi\n\nDavlat: ${callbackData}\n\n🌐 Endi tilni tanleng: `, Markup.inlineKeyboard(buttons))
        } else if (((await LanguageButtonsArray())).includes(callbackData) && checkAdmin && ctx.session.country) {
            let buttons = await getYearButtons()
            if (buttons.length === 0) {
                return await ctx.reply("Iltimos Yillar kiriting kino kiritishdan oldin!");
            }
            buttons.push([
                Markup.button.callback("🏠 Bosh Menu", "admin_main")
            ])
            ctx.session.language = callbackData;
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`✅ Siz tanlagan til qabul qilindi\n\nTil: ${callbackData}\n\n📅 Endi kino yaratilgan yilni tanleng: `, Markup.inlineKeyboard(buttons))
        } else if (((await YearButtonsArray())).includes(parseInt(callbackData)) && checkAdmin && ctx.session.language) {
            ctx.session.year = callbackData;
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply(`✅ Siz tanlagan yil qabul qilindi\n\nYil: ${callbackData}\n\nSiz joylamoqchi bo'lgan film hamma uchunmi yoki faqat VIP obuna uchunmi: `, Markup.inlineKeyboard([
                [Markup.button.callback("💎 VIP", "movie_vip"), Markup.button.callback("🆓 Hammaga", "movie_free")],
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]));
        } else if (callbackData === "movie_vip" && checkAdmin && ctx.session.year) {
            ctx.session.movie_type = "vip";
            ctx.session.operation = "video";
            ctx.session.videos = [];
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Endi menga kinoni jo'nating: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]))
        } else if (callbackData === "movie_free" && checkAdmin && ctx.session.year) {
            ctx.session.movie_type = "free";
            ctx.session.operation = "video";
            ctx.session.videos = [];
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Endi menga kinoni jo'nating: ", Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Bosh Menu", "admin_main")]
            ]))
        } else if (callbackData === "like" && ctx.session.movieID) {
            const movies = await movie.findOne({ id: ctx.session.movieID });
            if (!movies) return ctx.answerCbQuery("⚠️ Kechirasiz bu film topilmadi", { show_alert: true });
            if (movies.likes.includes(ctx.from.id) || movies.dislikes.includes(ctx.from.id)) {
                ctx.answerCbQuery("🚫 Siz allqachon bu film haqida fikr bildirgansiz")
            } else {
                movies.likes.push(ctx.from.id);
                await movies.save();
                ctx.answerCbQuery("✅ Like qabul qilindi")
            }
        } else if (callbackData === "dislike" && ctx.session.movieID) {
            const movies = await movie.findOne({ id: ctx.session.movieID });
            if (!movies) return ctx.answerCbQuery("⚠️ Kechirasiz bu film topilmadi", { show_alert: true });
            if (movies.likes.includes(ctx.from.id) || movies.dislikes.includes(ctx.from.id)) {
                ctx.answerCbQuery("🚫 Siz allqachon bu film haqida fikr bildirgansiz")
            } else {
                movies.dislikes.push(ctx.from.id);
                await movies.save();
                ctx.answerCbQuery("✅ Dislike qabul qilindi")
            }
        } else if (callbackData === "save_movie" && ctx.session.movieID) {
            const movies = await movie.findOne({ id: ctx.session.movieID });
            if (!movies) {
                await ctx.answerCbQuery("⚠️ Kechirasiz siz kiritgan film topilmadi!")
            } else {
                if (targetUser?.saved.includes(ctx.session.movieID)) {
                    await ctx.answerCbQuery("⚠️ Siz bu filmni saqlab olgansiz oldin!")
                } else {
                    targetUser.saved.push(ctx.session.movieID);
                    await ctx.answerCbQuery("✅ Film saqlandi");
                    await targetUser.save();
                }
            }
        } else if (callbackData === "fee_cost" && checkAdmin) {
            const fee_cost = await fee.findOne({ name: "fee" });
            if (!fee_cost) {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply("Iltimos, 1 oylik obuncha uchun narxni kiriting", Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]));
                ctx.session.operation = "setFee";
            } else {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.reply(`Iltimos, 1 oylik obuncha uchun narxni kiriting\n\nHozirgi obuna narxi: ${fee_cost.fee} UZS`, Markup.inlineKeyboard([
                    [Markup.button.callback("❌ Bekor qilish", "admin_main")]
                ]));
                ctx.session.operation = "setFee";
            }
        } else if (callbackData === "vip_user_activation" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("🆔 VIP obunani faollashtirmoqchi bo'lgan useringizni IDisini kiriting:", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "vip_user_activation";
        } else if (callbackData === "force_subscription" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("🔡 O'zingizga kerakli bo'limni tanleng:: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Majburiy obuna", "add_force_subscription"), Markup.button.callback("➖ Majburiy Obuna", "remove_force_subscription")]
            ]));
        } else if (callbackData === "add_force_subscription" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("✅ Ajoyib endi kiritmoqchi bo'lgan majburiy obunani kiriting: \n\n⚠️ Bu majburiy obuna guruh yoki kanal bo'lishi kerak va ommaviy", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "add_force_subscription";
        } else if (callbackData === "remove_force_subscription" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("✅ Ajoyib endi o'chirmoqchi bo'lgan majburiy obunani kiriting: \n\n⚠️ Bu majburiy obuna guruh yoki kanal bo'lishi kerak va ommaviy", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "remove_force_subscription";
        } else if (callbackData === "zayafka" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerakli bo'limni tanleng: ", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Zayafka qo'shish", "add_zayafka"), Markup.button.callback("➖ Zayafka olish", "remove_zayafka")],
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
        } else if (callbackData === "add_zayafka" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("End o'zingiz qo'shmoqchi bo'lgan kanal yoki guruhni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "add_zayafka";
        } else if (callbackData === "remove_zayafka" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos o'chirmoqchi bo'lgan zayafkangizni ID isini yuboring: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "remove_zayafka";
        } else if (callbackData === "extra_links" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'zingizga kerakli bo'limni tanleng: \n\n⚠️ Ogohlantirish, siz bu yerga kiritayotgan linklarni tekshirib bo'lmaydi, shuning uchun bular shunchaki turadi", Markup.inlineKeyboard([
                [Markup.button.callback("➕ Link qo'shish", "add_extralink"), Markup.button.callback("➖ Link olish", "remove_extralink")]
            ]));
        } else if (callbackData === "add_extralink" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Qo'shmoqchi bo'lgan linkingizni jo'nating: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "add_extralink";
        } else if (callbackData === "remove_extralink" && checkAdmin) {
            await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("O'chirmoqchi bo'lgan linkingizni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "remove_extralink";
        } else if (callbackData === "force_subscription_check") {
            const channels = await forceSubscriptions(ctx);
            if (channels.length === 0) {
                await ctx.telegram.deleteMessage(ctx.chat.id, message_id);
                newMessage = await ctx.replyWithPhoto(
                    Input.fromLocalFile("./database/photos/welcome.jpg"), 
                    {
                        caption: `• Assalomu alaykum, ${ctx.from.first_name} Botimizga xush kelibsiz!\n\n✍🏻 | O'zingizga kerakli bo'lgan film kodini yuboring!`,
                        parse_mode: "HTML",
                        reply_markup: {
                            inline_keyboard:
                                targetUser.role === "owner" || targetUser.role === "admin"
                                    ? admin
                                    : UserMainButton
                        }
                    }
                );
            } else {
                ctx.answerCbQuery("⚠️ Siz kerakli hamma kanallarga azo bo'lmadingiz", { show_alert: true })
            }
        } else if (callbackData === "message_sender" && checkAdmin) {
            ctx.telegram.deleteMessage(ctx.chat.id, message_id);
            newMessage = await ctx.reply("Iltimos xabarni kiriting: ", Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "admin_main")]
            ]));
            ctx.session.operation = "message_sender";
        } else if (callbackData === "yes_message_sender" && checkAdmin && ctx.session.message_id) {
            await ctx.reply("✅ Xabar tarqatish boshlandi");
            await messageSender(ctx, ctx.session.message_id, "");
        }

        else {
            await ctx.answerCbQuery("Kechirasiz siz bosgan tugma ishlamayabdi!", { show_alert: true })
        }


        // Update the last_message_id in the DB to the new message
        if (newMessage) {
            await User.findOneAndUpdate(
                { id: userID },
                { last_message_id: newMessage.message_id }
            ).exec();
        }
    } catch (error) {
        console.error("Error handling callback query:", error);
        ctx.reply("Kechirasiz, xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
}