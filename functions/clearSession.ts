import { Context } from "telegraf";



export const clearSession = (ctx: Context) => {
    try {
        if (!ctx.session) return
        if (ctx.session.operation) delete ctx.session.operation;
        if (ctx.session.back) delete ctx.session.back;
        if (ctx.session.setting) delete ctx.session.setting;
        if (ctx.session.movie_name) delete ctx.session.movie_name;
        if (ctx.session.janr) delete ctx.session.janr;
        if (ctx.session.country) delete ctx.session.country;
        if (ctx.session.language) delete ctx.session.language;
        if (ctx.session.year) delete ctx.session.year;
        if (ctx.session.movie_type) delete ctx.session.movie_type;
        if (ctx.session.videos) delete ctx.session.videos;
    } catch (err) {
        console.warn("Session o'chirishda xatolik mavjud: ");
        console.error(err);
    }
}