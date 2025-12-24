import User from "../models/user.module.js";

// Obunani aktivlashtirish funksiyasi
export const activateSubscription = async (userId: number, months: number) => {
    try {
        // 1. User ni topish
        const user = await User.findOne({ id: userId });
        
        if (!user) {
            return {
                success: false,
                message: "❌ Foydalanuvchi topilmadi!"
            };
        }
        
        const now = new Date();
        let newEndDate: Date;
        
        // 2. Obuna muddatini hisoblash
        if (user.subscription_end && user.subscription_end > now) {
            // Agar obuna hali tugamagan bo'lsa, yangi muddatni qo'shamiz
            newEndDate = new Date(user.subscription_end);
            newEndDate.setMonth(newEndDate.getMonth() + months);
        } else {
            // Yangi obuna boshlanadi
            newEndDate = new Date();
            newEndDate.setMonth(newEndDate.getMonth() + months);
            user.subscription_start = now;
        }
        
        // 3. User ni yangilash
        user.subscription_end = newEndDate;
        user.ispremium = true; // ✅ Premium aktiv qilish!
        await user.save();
        
        // 4. Javob qaytarish
        return {
            success: true,
            message: `✅ Obuna aktivlashtirildi!\n\n` +
                    `👤 Foydalanuvchi: ${user.first_name}\n` +
                    `📅 Yangi muddat: ${newEndDate.toLocaleDateString('uz-UZ')}\n` +
                    `⏰ ${months} oy qo'shildi`,
            data: {
                user: user,
                endDate: newEndDate,
                monthsAdded: months
            }
        };
        
    } catch (err) {
        console.error("Obuna aktivlashtirishda xatolik:", err);
        return {
            success: false,
            message: "❌ Obuna aktivlashtirishda xatolik!"
        };
    }
};

// Obunani tekshirish funksiyasi
export const checkSubscription = async (userId: number) => {
    try {
        // 1. User ni topish
        const user = await User.findOne({ id: userId });
        
        if (!user) {
            return {
                success: false,
                message: "❌ Foydalanuvchi topilmadi!",
                isActive: false
            };
        }
        
        const now = new Date();
        let isActive = false;
        let message = "";
        let needsUpdate = false;
        
        // 2. Obuna holatini tekshirish
        if (user.ispremium && user.subscription_end) {
            if (user.subscription_end > now) {
                // Obuna aktiv
                isActive = true;
                const remainingDays = Math.ceil(
                    (user.subscription_end.getTime() - now.getTime()) / 
                    (1000 * 60 * 60 * 24)
                );
                message = `✅ Obuna aktiv!\n` +
                         `⏳ Tugash muddati: ${user.subscription_end.toLocaleDateString('uz-UZ')}\n` +
                         `📅 ${remainingDays} kun qoldi`;
            } else {
                // Obuna muddati tugagan
                isActive = false;
                message = `❌ Obuna muddati tugagan!\n` +
                         `⌛️ Tugagan sana: ${user.subscription_end.toLocaleDateString('uz-UZ')}`;
                
                // Agar premium true bo'lsa, lekin muddati tugagan bo'lsa
                if (user.ispremium) {
                    needsUpdate = true;
                }
            }
        } else {
            // Obuna yo'q
            isActive = false;
            message = "❌ Obuna mavjud emas!";
        }
        
        // 3. Agar kerak bo'lsa, user ni yangilash (muddati tugagan premiumni false qilish)
        if (needsUpdate) {
            user.ispremium = false;
            await user.save();
        }
        
        // 4. Javob qaytarish
        return {
            success: true,
            message: message,
            isActive: isActive,
            needsUpdate: needsUpdate,
            user: user,
            subscriptionEnd: user.subscription_end,
            isPremium: user.ispremium
        };
        
    } catch (err) {
        console.error("Obuna tekshirishda xatolik:", err);
        return {
            success: false,
            message: "❌ Obunani tekshirishda xatolik!",
            isActive: false
        };
    }
};

// Qo'shimcha: Obunani deaktivatsiya qilish funksiyasi
export const deactivateSubscription = async (userId: number) => {
    try {
        const user = await User.findOne({ id: userId });
        
        if (!user) {
            return {
                success: false,
                message: "❌ Foydalanuvchi topilmadi!"
            };
        }
        
        user.ispremium = false;
        user.subscription_end = null;
        await user.save();
        
        return {
            success: true,
            message: `✅ ${user.first_name} foydalanuvchisining obunasi bekor qilindi!`,
            data: user
        };
        
    } catch (err) {
        console.error("Obunani bekor qilishda xatolik:", err);
        return {
            success: false,
            message: "❌ Obunani bekor qilishda xatolik!"
        };
    }
};

// Qo'shimcha: Obuna qancha kun qolganligini hisoblash
export const getRemainingDays = (subscriptionEnd: Date): number => {
    const now = new Date();
    if (!subscriptionEnd || subscriptionEnd <= now) return 0;
    
    const diffTime = subscriptionEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};