const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");

require("dotenv/config");

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
    stage.default = "love_calculate";
    ctx.reply(
        `Hello ${ctx.from.first_name}, would you like to know the love compatibility?`,
        Markup.inlineKeyboard([
            Markup.callbackButton("Love Calculate", "LOVE_CALCULATE"),
        ]).extra()
    );
});

// love calculator two-step wizard
const loveCalculate = new WizardScene(
    "love_calculate",
    (ctx) => {
        ctx.reply("Please, enter your name"); // enter your name
        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.wizard.state.yourName = ctx.message.text; // store yourName in the state to share data between middlewares
        ctx.reply(
            "Enter the name of your partner/lover/crush to find Love compatibility & chances of successful love relationship."
        );
        return ctx.wizard.next();
    },
    (ctx) => {
        const partnerName = ctx.message.text; // retrieve partner name from the message which user entered
        const yourName = ctx.wizard.state.yourName; // retrieve your name from state
        loveCalculator
            .getPercentage(yourName, partnerName)
            .then((res) => {
                const { fname, sname, percentage, result } = res.data;
                ctx.reply(
                    `${fname} + ${sname} = ${percentage}% \n ${
                        percentage > 50 ? "☺️" : "😢"
                    } ${result}`,
                    Markup.inlineKeyboard([
                        Markup.callbackButton(
                            "♥️ calculate Another Relationship",
                            "LOVE_CALCULATE"
                        ),
                    ]).extra()
                );
            })
            .catch((err) =>
                ctx.reply(
                    err.message,
                    Markup.inlineKeyboard([
                        Markup.callbackButton(
                            "calculate again",
                            "LOVE_CALCULATE"
                        ),
                    ]).extra()
                )
            );
        return ctx.scene.leave();
    }
);

const stage = new Stage([loveCalculate]); // Scene registration
bot.use(session());
bot.use(stage.middleware());
bot.launch();
