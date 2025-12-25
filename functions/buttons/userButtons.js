import { Markup } from "telegraf";
import fee from "../../models/fee.module.js";
import { main_channel, owner } from "../../config/denamic.js";

export const UserMainButton = [
    [Markup.button.callback("🔎 Film qidirish", "search_movie")],
    [{ text: "📊 Top filmlar", switch_inline_query_current_chat: "top" }, { text: "🌟 Saqlangan", switch_inline_query_current_chat: "saved" }],
    [Markup.button.callback("💎 VIP", "vip"), Markup.button.callback("💡Yordam", "help")],
    [Markup.button.callback("📔 Malumotlarim", "my_data")]
]

export const search_movie_buttons = [
    [Markup.button.url("📺 Barcha filmlar", main_channel, true)],
    [{ text: "🔎 Nom orqali", switch_inline_query_current_chat: " " }, Markup.button.callback("📁 Filter", "filter")],
    [Markup.button.callback("📦 Film buyurtma qilish", "order_movie")],
    [Markup.button.callback("🎲 Tasodifiy Film", "random_movie")],
    [Markup.button.callback("🏘 Bosh Menyu", "main_menu")],
];

export const filter_buttons = [
    [Markup.button.callback("🎭 Janr", "janr"), Markup.button.callback("🌐 Til", "language")],
    [Markup.button.callback("🌏 Davlat", "country"), Markup.button.callback("📅 Yil", "year")],
    [Markup.button.callback("🔙 Orqaga", "back")]
];

export const payment_buttons = [
    [Markup.button.callback("🔵 CLICK [AUTO]", "click")],
    [Markup.button.callback("💳 Karta Raqam Orqali", "card_payment")],
    [Markup.button.url("👨‍💻 Admin orqali", `https://t.me/${owner}`)],
    [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
];

export const help_buttons = [
    [Markup.button.callback("📩 Adminga xabar", "message_to_admin")],
    [Markup.button.url("👨‍💻 Admin", `https://t.me/${owner}`)],
    [Markup.button.callback("📘 Foydalanish qo'llanmasi", "video_manul")],
    [Markup.button.callback("🏘 Bosh Menyu", "main_menu")]
];



export const payment_dates = async () => {
    const fee_cost = await fee.findOne({ name: "fee" });
    if (!fee_cost) {
        return []
    } else {
        const buttons = [
            [Markup.button.callback(`🗓 1 Oy - ${fee_cost.fee} UZS`, "buy_1_month")],
            [Markup.button.callback(`🗓 3 Oy - ${fee_cost.fee * 3} UZS`, "buy_3_months")],
            [Markup.button.callback(`🗓 6 Oy - ${fee_cost.fee * 6} UZS`, "buy_6_months")],
            [Markup.button.callback(`🗓 12 Oy - ${fee_cost.fee * 12} UZS`, "buy_12_months")],
            [Markup.button.callback(`🏘 Bosh Menyu`, "main_menu")]
        ]
        return buttons;
    }
}

export const admin = [
    [Markup.button.callback("👨‍💻 Admin", "admin"), Markup.button.callback("👥 Foydalanuvchi bo'limi", "main_menu")],
    [Markup.button.callback("📅 Yillar", "years"), Markup.button.callback("🎥 Janr", "janr")],
    [Markup.button.callback("🌏 Davlat", "country"), Markup.button.callback("🌐 Til", "language")],
    [Markup.button.callback("📭 Asosiy kanal", "movie_base_channel"), Markup.button.callback("🎬 Kino", "movie")],
    [Markup.button.callback("💰 Obuna narxi", "fee_cost"), Markup.button.callback("💎 VIP faolashtirish", "vip_user_activation")],
    [Markup.button.callback("🔒 Majburiy obuna", "force_subscription"), Markup.button.callback("⛓️ Zayafka", "zayafka")],
    [Markup.button.callback("🔗 Qo'shimcha linklar", "extra_links")],
    [Markup.button.callback("✈️ Xabar tarqatish", "message_sender")],
    [Markup.button.callback("⚙️ Sozlamalar", "settings")],
]

export const settings = [
    [Markup.button.callback("📦 Film buyurtma qilish", "book_movie_setting")],
    [Markup.button.callback("🎲 Tasodifiy film", "random_movie_setting")],
    [Markup.button.callback("🌏 Davlat", "country_setting"), Markup.button.callback("🎞 Janr", "janr_setting")],
    [Markup.button.callback("📆 Yil", "years_setting"), Markup.button.callback("🌐 Til", "language_setting")],
    [Markup.button.callback("⚙️ Sozlamalarni ko'rish", "show_settings")],
    [Markup.button.callback("🏘 Bosh Menu", "admin_main")]
]

export const vip_no = [
    [Markup.button.callback("💎 VIP", "vip_setting_yes"), Markup.button.callback("🆓 Hammaga", "all_setting_yes")],
    [Markup.button.callback("🔙 Orqaga", "back")],
]