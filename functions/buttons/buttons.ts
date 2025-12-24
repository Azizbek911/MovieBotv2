import { Markup } from "telegraf";
import { InlineKeyboardButton } from "telegraf/types";
import janr from "../../models/janr.module.js";
import Year from "../../models/years.module.js";
import country from "../../models/country.module.js";
import language from "../../models/language.module.js";

export const getJanrButtons = async (): Promise<
    InlineKeyboardButton.CallbackButton[][]
> => {
    try {
        const janrlar = await janr.find().lean();
        const PER_ROW = 4;
        const keyboard: InlineKeyboardButton.CallbackButton[][] = [];

        for (let i = 0; i < janrlar.length; i += PER_ROW) {
            const row: InlineKeyboardButton.CallbackButton[] = [];

            for (let j = i; j < i + PER_ROW && j < janrlar.length; j++) {
                row.push(
                    Markup.button.callback(
                        janrlar[j].janr,
                        janrlar[j].janr
                    )
                );
            }

            keyboard.push(row);
        }

        return keyboard;
    } catch (err) {
        console.warn("Buttonlarni olishda xatolik mavjud:");
        console.error(err);
        return [];
    }
};

export const buttonsArray = async (): Promise<String[]> => {
    try {
        const janrlar = await janr.find().lean();
        const buttons: String[] = [];
        janrlar.map((item) => {
            buttons.push(item.janr)
        })
        if (buttons.length === 0) return ["error"]
        return buttons;
    } catch (e) {
        console.warn("Buttonlarni Array qilishda xatolik mavjud: ");
        console.error(e);
        return ["error"]
    }
}


export const getCountiresButtons = async (): Promise<InlineKeyboardButton.CallbackButton[][]> => {
    try {
        const countries = await country.find().lean();
        const PER_ROW = 4;
        const keyboard: InlineKeyboardButton.CallbackButton[][] = [];

        for (let i = 0; i < countries.length; i += PER_ROW) {
            const row: InlineKeyboardButton.CallbackButton[] = [];

            for (let j = i; j < i + PER_ROW && j < countries.length; j++) {
                row.push(
                    Markup.button.callback(
                        countries[j].country,
                        countries[j].country
                    )
                );
            }

            keyboard.push(row);
        }

        return keyboard;
    } catch (err) {
        console.warn("Davlat tugmalarini olishda xatolik bor: ");
        console.error(err);
        return []
    }
}

export const CountiresButtonsArray = async (): Promise<String[]> => {
    try {
        const countires = await country.find().lean();
        const countriesArray = [];
        countires.map((item) => {
           countriesArray.push(item.country);
        });

        return countriesArray
    } catch (err) {
        console.warn("Davlatlarni array qilishda xatolik mavjud:");
        console.error(err);
        return [];
    }
}

export const getLanguageButtons = async (): Promise<InlineKeyboardButton.CallbackButton[][]> => {
    try {
        const languages = await language.find().lean();
        const PER_ROW = 4;
        const keyboard: InlineKeyboardButton.CallbackButton[][] = [];

        for (let i = 0; i < languages.length; i += PER_ROW) {
            const row: InlineKeyboardButton.CallbackButton[] = [];

            for (let j = i; j < i + PER_ROW && j < languages.length; j++) {
                row.push(
                    Markup.button.callback(
                        languages[j].language,
                        languages[j].language
                    )
                );
            }

            keyboard.push(row);
        }

        return keyboard;
    } catch (err) {
        console.warn("Davlat tugmalarini olishda xatolik bor: ");
        console.error(err);
        return []
    }
}

export const LanguageButtonsArray = async (): Promise<String[]> => {
    try {
        const languages = await language.find().lean();
        const languageArray = [];
        languages.map((item) => {
            languageArray.push(item.language);
        });

        return languageArray
    } catch (err) {
        console.warn("Davlatlarni array qilishda xatolik mavjud:");
        console.error(err);
        return [];
    }
}


export const getYearButtons = async (): Promise<InlineKeyboardButton.CallbackButton[][]> => {
    try {
        const years = await Year.find().lean();
        const PER_ROW = 4;
        const keyboard: InlineKeyboardButton.CallbackButton[][] = [];

        for (let i = 0; i < years.length; i += PER_ROW) {
            const row: InlineKeyboardButton.CallbackButton[] = [];

            for (let j = i; j < i + PER_ROW && j < years.length; j++) {
                row.push(
                    Markup.button.callback(
                        `${years[j].year}`,
                        years[j].year
                    )
                );
            }

            keyboard.push(row);
        }

        return keyboard;
    } catch (err) {
        console.warn("Davlat tugmalarini olishda xatolik bor: ");
        console.error(err);
        return []
    }
}

export const YearButtonsArray = async (): Promise<Number[]> => {
    try {
        const year = await Year.find().lean();
        const yearArray = [];
        year.map((item) => {
            yearArray.push(item.year);
        });

        return yearArray
    } catch (err) {
        console.warn("Davlatlarni array qilishda xatolik mavjud:");
        console.error(err);
        return [];
    }
}