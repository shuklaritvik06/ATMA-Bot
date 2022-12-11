const dotenv = require("dotenv");
const { Telegraf } = require("telegraf");
dotenv.config();
const {
  welcome,
  addOwner,
  bookService,
  raiseTicket,
  giveFeedback,
  helpFunc,
  rentService,
  doitNow,
  ownerInfo,
  buyItem,
} = require("./src/controllers/botController");
const listOne = ["Appliance", "Grocery"];
const regexList = [/^service/gi, /^grocery/gi, /^other/gi];
const bot = new Telegraf(process.env.TOKEN);
bot.start(welcome);
bot.command("add", addOwner);
bot.command("book", bookService);
bot.command("raise", raiseTicket);
bot.command("feedback", giveFeedback);
bot.command("help", helpFunc);
bot.action(/^owner/g, ownerInfo);
bot.action(/^book/g, buyItem);
bot.action(listOne, rentService);
bot.action(regexList, doitNow);
bot.action("start", bookService);
bot.help(helpFunc);
bot.launch();
