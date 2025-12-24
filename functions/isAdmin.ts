import User from "../models/user.module.js"

export const isAdmin = async (id: Number): Promise<Boolean> => {
    const targetUser = await User.findOne({ id: id });
    if (!targetUser) return false;
    if (targetUser.role === "admin" || targetUser.role === "owner") {
        return true;
    } else {
        return false;
    }
};