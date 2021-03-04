const axios = require("axios");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");

const base_url = "http://localhost:4000/api";
const localization = require("./localization.json");

exports.start = async (ctx) => {
    const user = {
        telegram_id: ctx.message.chat.id,
        name: ctx.message.chat.first_name,
        username: ctx.message.chat.username,
    };

    const result = await axios.post(`${base_url}/users`, user);

    if (result.data.success) {
        ctx.reply(
            `Salom ${ctx.from.first_name}, tilni tanlang:\nПривет ${ctx.from.first_name}, выберите язык:`,
            Markup.keyboard([["O'zbek", "Pусский"]])
                .oneTime()
                .resize()
                .extra()
        );
    } else {
        ctx.reply(localization.error.uz);
    }
};

exports.getUser = async (ctx) => {
    const result = await axios.get(`${base_url}/users/${ctx.message.chat.id}`);

    return result.data.data;
};

exports.getLanguage = async (ctx) => {
    let language = ctx.message.text;
    console.log("WORKING");
    if (language == "O'zbek") language = "uz";
    else if (language == "Pусский") language = "ru";
    else {
        return ctx.reply(
            `Salom ${ctx.from.first_name}, tilni tanlang:\nПривет ${ctx.from.first_name}, выберите язык:`,
            Markup.keyboard([["O'zbek", "Pусский"]])
                .oneTime()
                .resize()
                .extra()
        );
    }

    const result = await axios.patch(
        `${base_url}/users/${ctx.message.chat.id}`,
        { language: language, state: 1 }
    );

    if (result.data.success) {
        return ctx.reply(
            localization.phone[result.data.data.language],
            Extra.markup((markup) => {
                return markup
                    .resize()
                    .keyboard([
                        markup.contactRequestButton(
                            localization.my_number[result.data.data.language]
                        ),
                    ]);
            })
        );
    } else {
        ctx.reply(localization.error.uz);
    }
};

exports.getContact = async (ctx) => {
    console.log("CONTACT");
    const phone = ctx.message.contact.phone_number;

    const result = await axios.patch(
        `${base_url}/users/${ctx.message.chat.id}`,
        { phone: phone, state: 2 }
    );

    if (result.data.success) {
        return ctx.reply(
            localization.location[result.data.data.language],
            Extra.markup((markup) => {
                return markup
                    .resize()
                    .keyboard([
                        markup.locationRequestButton(
                            localization.location[result.data.data.language]
                        ),
                    ]);
            })
        );
    } else {
        ctx.reply(localization.error.uz);
    }
};
