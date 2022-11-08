const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");
dotenv.config();
const {
  welcome,
  addOwner,
  bookService,
  raiseTicket,
  giveFeedback,
  payNow,
  search,
  helpFunc,
} = require("./controllers/botController");

const bot = new Telegraf(process.env.TOKEN);
bot.start(welcome);
bot.hears("Добавить услугу", addOwner);
bot.hears("Заказать услугу", bookService);
bot.action("book", payNow);
bot.hears("Поднять билет", raiseTicket);
bot.hears("Дать обратную связь", giveFeedback);
bot.help(helpFunc);
bot.on("inline_query", search);
bot.launch();
