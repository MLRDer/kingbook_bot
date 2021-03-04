const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");

const axios = require("axios");
const localization = require("./localization.json");
require("dotenv/config");

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
    loveCalculate.cursor = 0;
    ctx.reply(
        `Assalomu alaykum ${ctx.from.first_name}`,
        Markup.inlineKeyboard([
            Markup.callbackButton(
                `${localization.callback.uz} / ${localization.callback.ru}`,
                "LOVE_CALCULATE"
            ),
        ]).extra()
    );
});

// love calculator two-step wizard
const loveCalculate = new WizardScene(
    "love_calculate",
    (ctx) => {
        console.log(ctx.wizard.cursor);
        ctx.reply(
            `Salom ${ctx.from.first_name}, tilni tanlang:\nПривет ${ctx.from.first_name}, выберите язык:`,
            Markup.keyboard([["O'zbek", "Pусский"]])
                .oneTime()
                .resize()
                .extra()
        );

        // next stage
        return ctx.wizard.next();
    },
    (ctx) => {
        console.log("Language");
        let language = ctx.message.text;
        if (language == "O'zbek") language = "uz";
        else if (language == "Pусский") language = "ru";
        else {
            ctx.reply(
                `Salom ${ctx.from.first_name}, tilni tanlang:\nПривет ${ctx.from.first_name}, выберите язык:`,
                Markup.keyboard([["O'zbek", "Pусский"]])
                    .oneTime()
                    .resize()
                    .extra()
            );
        }

        ctx.wizard.state.language = language;

        ctx.reply(
            localization.phone[language],
            Extra.markup((markup) => {
                return markup
                    .resize()
                    .keyboard([
                        markup.contactRequestButton(
                            localization.my_number[language]
                        ),
                    ]);
            })
        );

        // next stage
        return ctx.wizard.next();
    },
    (ctx) => {
        console.log("CONTACT");
        ctx.wizard.cursor = 2;
        if (!ctx.wizard.state.phone)
            ctx.wizard.state.phone = ctx.message.contact.phone_number;

        ctx.reply(
            localization.category[ctx.wizard.state.language],
            Markup.keyboard([
                [localization.books[ctx.wizard.state.language]],
                [localization.videos[ctx.wizard.state.language]],
            ])
                .oneTime()
                .resize()
                .extra()
        );

        // next stage
        return ctx.wizard.next();
    },
    async (ctx) => {
        let msg = ctx.message.text;
        console.log(msg);
        console.log(ctx.message);

        if (msg == localization.books[ctx.wizard.state.language]) {
            ctx.wizard.state.category = "book";
            console.log(ctx.wizard.state.category);
            const books = await axios.get(
                `${localization.base_url}/books?type=book`
            );

            const buttons = [];

            books.data.data.forEach((book) => {
                buttons.push([`📚 ${book.name[ctx.wizard.state.language]} 📚`]);
            });
            buttons.push([localization.back[ctx.wizard.state.language]]);

            ctx.reply(
                localization.available_books[ctx.wizard.state.language],
                Markup.keyboard(buttons).oneTime().resize().extra()
            );
        } else if (msg == localization.videos[ctx.wizard.state.language]) {
            ctx.wizard.state.category = "video";
            console.log(ctx.wizard.state.category);

            const books = await axios.get(
                `${localization.base_url}/books?type=video`
            );

            const buttons = [];
            books.data.data.forEach((book) => {
                buttons.push([`💿 ${book.name[ctx.wizard.state.language]} 💿`]);
            });
            buttons.push([localization.back[ctx.wizard.state.language]]);

            ctx.reply(
                localization.available_videos[ctx.wizard.state.language],
                Markup.keyboard(buttons).oneTime().resize().extra()
            );
        } else {
            return ctx.reply(localization.option[ctx.wizard.state.language]);
        }

        // next stage
        return ctx.wizard.next();
    },
    (ctx) => {
        let msg = ctx.message.text;

        if (msg == localization.back[ctx.wizard.state.language]) {
            ctx.wizard.back();
            return ctx.wizard.steps[ctx.wizard.cursor - 1](ctx);
        } else {
            ctx.wizard.state.book = ctx.message.text;
            ctx.reply(
                localization.location[ctx.wizard.state.language],
                Extra.markup((markup) => {
                    return markup
                        .resize()
                        .keyboard([
                            markup.locationRequestButton(
                                localization.location[ctx.wizard.state.language]
                            ),
                            localization.next[ctx.wizard.state.language],
                        ]);
                })
            );
        }

        // next stage
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message.text != localization.next[ctx.wizard.state.language])
            ctx.wizard.state.location = ctx.message.location;
        ctx.wizard.state.name = ctx.message.chat.first_name;
        ctx.wizard.state.order_from = "telegram";

        const res = await axios.post(
            `${localization.base_url}/orders`,
            ctx.wizard.state
        );

        if (res.data.success) {
            ctx.reply(localization.thanks[ctx.wizard.state.language], {
                reply_markup: { remove_keyboard: true },
            });
            ctx.reply(
                `${ctx.from.first_name}, ${
                    localization.again[ctx.wizard.state.language]
                }`,
                Markup.inlineKeyboard([
                    Markup.callbackButton(
                        `${localization.callback[ctx.wizard.state.language]}`,
                        "LOVE_CALCULATE"
                    ),
                ]).extra()
            );
        } else {
            return ctx.reply(localization.error[ctx.wizard.state.language]);
        }

        return ctx.scene.leave();
    }
);

const stage = new Stage([loveCalculate], { default: "love_calculate" }); // Scene registration
bot.use(session());
bot.use(stage.middleware());
bot.launch();
