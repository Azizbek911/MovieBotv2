import { userKeeperRequest } from "../functions/ChatJoinRequest/userKeeper.ts"
import { errorConsole } from "../functions/errorConsole.ts"



export const userKeeper = async (ctx) => {
    try {
        await userKeeperRequest(ctx);
    } catch (err) {
        errorConsole(err, "User saqlashda xatolik mavjud, zayafka uchun:", ctx)
    }
}