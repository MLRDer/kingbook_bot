const Telegraf = require("telegraf");
const session = require("telegraf/session");
require("dotenv/config");
const Extra = require("telegraf/extra");
const axios = require("axios");

// all helper functions/handlers
const functions = require("./functions");

const bot = new Telegraf("1699339583:AAEIFpHu0_F7neTAr9V3BXchthxMydW0ya4");

bot.start((ctx) => {
    functions.start(ctx);
});

let c = true;

bot.on("text", async (ctx) => {
    const user = await functions.getUser(ctx);
    if (c) {
        user.state = 0;
        c = false;
    }
    switch (user.state) {
        case 0: {
            functions.getLanguage(ctx);

            break;
        }
        case 1: {
            functions.getContact(ctx);

            break;
        }
        case 2: {
            break;
        }
    }
});

bot.command("special", (ctx) => {
    return ctx.reply(
        "Special buttons keyboard",
        Extra.markup((markup) => {
            return markup
                .resize()
                .keyboard([
                    markup.contactRequestButton("Send contact"),
                    markup.locationRequestButton("Send location"),
                ]);
        })
    );
});

bot.on("location", (ctx) => {
    console.log(ctx.message);
});

bot.on("contact", (ctx) => {
    console.log(ctx.message);
});

bot.use(session());
bot.launch();
