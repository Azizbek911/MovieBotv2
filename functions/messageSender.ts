import { Context } from "telegraf";
import { errorConsole } from "./errorConsole";
import { InlineKeyboardButton } from "telegraf/types";
import User from "../models/user.module";
import bot from "../index";
import { clearSession } from "./clearSession";

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const messageSender = async (ctx: Context, message_id: number, button: InlineKeyboardButton | "") => {
    // 1. Telegram Rate Limit sozlamalari
    const BATCH_SIZE = 5; // Har 100 tadan keyin status yangilash
    const MESSAGE_DELAY = 1200; // Har xabar orasidagi delay (ms)
    const PARALLEL_LIMIT = 5; // Bir vaqtda jo'natiladigan maksimal xabarlar
    const RETRY_DELAY = 5000; // "Too Many Requests" xatosi uchun qo'shimcha delay

    try {
        const users = await User.find().lean();
        const totalUsers = users.length;
        const filteredUsers = users.filter(user => user.id !== ctx?.from?.id); // O'ziga jo'natmaslik
        
        const status = {
            success: 0,
            failed: 0,
            total: totalUsers
        };

        // 2. Status xabarini yaratish
        let statusMessageId: number | null = null;
        try {
            const statusMessage = await ctx.reply(
                `📤 Xabar tarqatish boshlandi...\n\n` +
                `🫂 Jami foydalanuvchilar: ${totalUsers}\n` +
                `✅ Jo'natildi: 0\n` +
                `❌ Xatolar: 0\n` +
                `⏱️ Progress: [░░░░░░░░░░] 0%`
            );
            statusMessageId = statusMessage.message_id;
        } catch (error) {
            console.warn("Status xabarini yaratishda xatolik:", error);
        }

        // 3. Progress bar funksiyasi
        const getProgressBar = (current: number, total: number): string => {
            const percentage = Math.round((current / total) * 100);
            const filled = Math.round(percentage / 10);
            const empty = 10 - filled;
            return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
        };

        // 4. Status xabarini yangilash funksiyasi
        const updateStatusMessage = async () => {
            if (!statusMessageId) return;
            
            try {
                const progress = getProgressBar(status.success + status.failed, totalUsers);
                const statusText = 
                    `📤 Xabar tarqatilmoqda...\n\n` +
                    `🫂 Jami foydalanuvchilar: ${totalUsers}\n` +
                    `✅ Jo'natildi: ${status.success}\n` +
                    `❌ Xatolar: ${status.failed}\n` +
                    `⏱️ Progress: ${progress}\n` +
                    `⏳ Qolgan: ${totalUsers - (status.success + status.failed)} ta`;
                
                await ctx.telegram.editMessageText(
                    ctx.chat!.id, 
                    statusMessageId!, 
                    undefined, 
                    statusText
                );
            } catch (error) {
                console.warn("Status xabarini yangilashda xatolik:", error);
            }
        };

        // 5. Asosiy tarqatish logikasi - Parallel limit bilan
        let currentDelay = MESSAGE_DELAY;
        let processedCount = 0;

        for (let i = 0; i < filteredUsers.length; i += PARALLEL_LIMIT) {
            // 5.1. Batch olish (parallel limit asosida)
            const batch = filteredUsers.slice(i, i + PARALLEL_LIMIT);
            
            // 5.2. Batch ni parallel jo'natish
            await Promise.all(
                batch.map(async (item) => {
                    try {
                        if (!button) {
                            await bot.telegram.forwardMessage(item.id, ctx.chat?.id!, message_id);
                            await User.findOneAndUpdate({ id: item.id }, { status: true });
                            status.success++;
                        }
                    } catch (err: any) {
                        // 5.3. Xatoliklarni boshqarish
                        await User.findOneAndUpdate({ id: item.id }, { status: false });
                        status.failed++;
                        
                        // 5.4. Rate limit xatosini aniqlash
                        if (err.message && err.message.includes('Too Many Requests')) {
                            console.warn(`Rate limit: ${item.id}, delay ${RETRY_DELAY}ms`);
                            currentDelay += 1000; // Delay ni oshirish
                            await delay(RETRY_DELAY);
                        } else {
                            console.warn(`User ${item.id} ga xabar jo'natishda xatolik:`, err.message);
                        }
                    }
                })
            );

            processedCount += batch.length;
            
            // 5.5. Har 100 ta yoki har batch dan keyin status yangilash
            if (processedCount % BATCH_SIZE === 0 || i + PARALLEL_LIMIT >= filteredUsers.length) {
                await updateStatusMessage();
            }

            // 5.6. Batch orasida delay (oxirgi batch uchun emas)
            if (i + PARALLEL_LIMIT < filteredUsers.length) {
                await delay(currentDelay);
                
                // 5.7. Agar hamma yaxshi ketayotgan bo'lsa, delay ni asta-sekin kamaytirish
                if (currentDelay > MESSAGE_DELAY && processedCount % 50 === 0) {
                    currentDelay = Math.max(MESSAGE_DELAY, currentDelay - 100);
                }
            }
        }

        // 6. Yakuniy status
        const finalStatusText = 
            `✅ Xabar tarqatish tugadi!\n\n` +
            `📊 Statistikalar:\n` +
            `🫂 Jami foydalanuvchilar: ${totalUsers}\n` +
            `🟢 Muvaffaqiyatli: ${status.success} (${Math.round((status.success/totalUsers)*100)}%)\n` +
            `🔴 Xatolar: ${status.failed} (${Math.round((status.failed/totalUsers)*100)}%)\n` +
            `📈 Samaradorlik: ${Math.round((status.success/(status.success+status.failed))*100)}%`;

        if (statusMessageId) {
            try {
                await ctx.telegram.editMessageText(
                    ctx.chat!.id, 
                    statusMessageId!, 
                    undefined, 
                    finalStatusText
                );
            } catch (error) {
                await ctx.reply(finalStatusText);
            }
        } else {
            await ctx.reply(finalStatusText);
        }

        // 7. Qo'shimcha tahlillar
        if (status.failed > 0) {
            const failedPercentage = (status.failed / totalUsers) * 100;
            if (failedPercentage > 20) {
                await ctx.reply(
                    `⚠️ Diqqat: ${failedPercentage.toFixed(1)}% xatolar bor.\n` +
                    `Sabablari:\n` +
                    `1. User botni bloklagan\n` +
                    `2. Telegram API limiti\n` +
                    `3. Tarmoq muammolari\n\n` +
                    `Taklif: Delay ni ${MESSAGE_DELAY + 500}ms ga oshiring.`
                );
            }
        }

        clearSession(ctx);

    } catch (err) {
        errorConsole(err, "Xabar jo'natishda xatolik mavjud: ", ctx);
        
        // Xatolik haqida foydalanuvchiga xabar berish
        try {
            await ctx.reply(
                `❌ Xabar tarqatishda kutilmagan xatolik yuz berdi.\n` +
                `Xato: ${err instanceof Error ? err.message : 'Noma\'lum xato'}\n\n` +
                `Iltimos, qayta urunib ko'ring yoki tizim administratoriga murojaat qiling.`
            );
        } catch (e) {
            console.error("Xatolik haqida xabar berishda ham xatolik:", e);
        }
    }
};