const Airtable = require("airtable");
const base = new Airtable({ apiKey: `${process.env.API_KEY}` }).base(
  `${process.env.BASE_ID}`
);

async function options(ctx) {
  return ctx.telegram.sendMessage(ctx.chat.id, "С чем я могу вам помочь?", {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Добавить услугу",
          },
        ],
        [
          {
            text: "Заказать услугу",
          },
        ],
        [
          {
            text: "Поднять билет",
          },
        ],
        [
          {
            text: "Дать обратную связь",
          },
        ],
        [
          {
            text: "/help",
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

module.exports.welcome = async (ctx) => {
  await ctx.telegram.sendPhoto(
    ctx.chat.id,
    "https://www.ebi.com.tr/medya/2017/12/chat-bot-for-social-networking.jpg",
    {
      caption: `
      Привет, ${ctx.from.first_name}! 👋 Благодарим вас за интерес к ATMA Services. Я здесь, чтобы помочь вам с вашими вопросами.
    `,
    }
  );
  await options(ctx);
};

module.exports.addOwner = async (ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Потрясающий! 💫 Вы можете добавить свою услугу, заполнив эту форму https://airtable.com/shr12nuZycf5fWt4k
    `
  );
};

module.exports.bookService = async (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, `Какую услугу вы хотите заказать?`);
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `
  Вы можете забронировать желаемую услугу, выполнив поиск в следующем формате:\n\n
  @atma_services_bot <имя_службы>
  `
  );
};

module.exports.giveFeedback = async (ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Вы можете сделать свой шаг к улучшению сервисов ATMA здесь https://airtable.com/shrC7nSKkeNaA8kBT 💫
    `
  );
};

module.exports.raiseTicket = async (ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Приносим извинения за доставленные неудобства 😞 Вы можете зарегистрировать свою жалобу здесь https://airtable.com/shrSQufO7q3QwuSsD
    `
  );
};

module.exports.payNow = async (ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    ` Пожалуйста, оплатите необходимую сумму на следующий номер счета: 1234567890 и поделитесь с нами скриншотом квитанции об оплате в этом WhatsApp 123456789 📱`
  );
};

module.exports.search = async (ctx) => {
  let query = ctx.inlineQuery.query;
  if (query.length > 0 && query !== " ") {
    let results = [];
    try {
      base("Services")
        .select({
          view: "Grid view",
          maxRecords: 3,
          filterByFormula: `AND(FIND(LOWER('${query}'), LOWER({Service})),NOT({Booked} = 'Booked'))`,
        })
        .eachPage((record) => {
          record.forEach((item) => {
            results.push({
              type: "article",
              id: item.id,
              title: item.get("Service"),
              description: `${item.get("Owner First Name")} ${item.get(
                "Price"
              )} ${item.get("Owner Dormitory")} ${item.get("Owner Room")}`,
              thumb_url: item.get("Device Image")[0].url,
              input_message_content: {
                message_text: `
                Имя: ${item.get("Owner First Name")} ${item.get(
                  "Owner Last Name"
                )}\nобслуживание: ${item.get("Service")}\nЦена: ${item.get(
                  "Price"
                )}\nОбщежитие: ${item.get(
                  "Owner Dormitory"
                )}\nНомер комнаты: ${item.get("Owner Room")}\n
              `,
              },
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Book",
                      callback_data: `Book ${item.id}`,
                    },
                  ],
                ],
              },
            });
          });
          if (results.length > 0) {
            ctx.answerInlineQuery(results);
          } else {
            ctx.answerInlineQuery([
              {
                type: "article",
                id: "1",
                title: "No results found",
                description: "Please try again",
                input_message_content: {
                  message_text: "No results found",
                },
              },
            ]);
          }
        });
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports.helpFunc = async (ctx) => {
  await ctx.reply(
    "Я здесь, чтобы помочь вам 😊 Вы можете использовать эти команды, чтобы начать"
  );
  await ctx.reply("/start - запустить бота\n/help - получить помощь");
};
