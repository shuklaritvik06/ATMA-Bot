const Airtable = require("airtable");
const base = new Airtable({ apiKey: `${process.env.API_KEY}` }).base(
  `${process.env.BASE_ID}`
);
module.exports.welcome = async (ctx) => {
  await ctx.telegram.sendPhoto(
    ctx.chat.id,
    "https://www.ebi.com.tr/medya/2017/12/chat-bot-for-social-networking.jpg",
    {
      caption: `
      Привет, ${ctx.from.first_name}! 👋 Благодарим вас за интерес к ATMA.
    `,
    }
  );
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Я могу помочь вам добавить и забронировать услугу/продукт по разумной цене.\n\nВы можете контролировать меня, отправляя следующие команды:\n\n/add- Добавить услугу/продукт\n\n/book- Забронировать a Service/Grocery\n\n/raise- Поднимите билет\n\n/feedback- Оставьте свой отзыв\n\n/help- Получите помощь  `
  );
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
  ctx.deleteMessage();
  ctx.telegram.sendMessage(ctx.chat.id,
    `
    Получение главного меню
    `
  );
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Чем я могу помочь? Пожалуйста, выберите один из вариантов ниже",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Аренда прибора",
              callback_data: "Appliance",
            },
          ],
          [
            {
              text: "Продукты",
              callback_data: "Grocery",
            },
          ],
          [
            {
              text: "Другой",
              callback_data: "Other",
            },
          ],
        ],
      },
    }
  );
};

module.exports.rentService = async (ctx) => {
  const data = ctx.update.callback_query.data;
  await ctx.telegram.sendMessage(ctx.chat.id, "Получение данных....");
  let results = [];
  try {
    ctx.deleteMessage();
    base("Services")
      .select({
        view: "Services Data",
        filterByFormula: `AND({Category}= '${data}',NOT({Booked} = 'Booked'))`,
      })
      .eachPage((record) => {
        record.forEach((item) => {
          results.push(item.get("Product"));
        });
        if (results.length > 0) {
          results = [...new Set(results)];
          ctx.telegram.sendMessage(
            ctx.chat.id,
            `Выберите один из следующих вариантов`,
            {
              reply_markup: {
                inline_keyboard: [
                  ...results.map((item) => {
                    return [
                      {
                        text: `${item}`,
                        callback_data: `service-${item}`,
                      },
                    ];
                  }),
                  [
                    {
                      text: "< Назад",
                      callback_data: "start",
                    },
                  ],
                ],
              },
            }
          );
        } else {
          ctx.telegram.sendMessage(ctx.chat.id, `Категории не найдены`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "< Назад",
                    callback_data: "start",
                  },
                ],
              ],
            },
          });
        }
      });
  } catch (err) {
    console.log(err);
  }
};
module.exports.doitNow = async (ctx) => {
  const data = ctx.update.callback_query.data.split("-")[1];
  await ctx.telegram.sendMessage(ctx.chat.id, "Получение данных....");
  let results = [];
  try {
    ctx.deleteMessage();
    base("Services")
      .select({
        view: "Services Data",
        filterByFormula: `AND(FIND('${data}', {Product}),NOT({Booked} = 'Booked'))`,
      })
      .eachPage((record) => {
        record.forEach((item) => {
          results.push([
            {
              text: `Owner: ${item.get("Owner First Name")} ${item.get(
                "Owner Last Name"
              )}\nPrice: ${item.get("Price")} RUB`,
              callback_data: `owner-${item.get("Owner First Name")}-${item.get(
                "Owner Last Name"
              )}`,
            },
          ]);
        });
        if (results.length > 0) {
          ctx.telegram.sendMessage(
            ctx.chat.id,
            `Выберите один из следующих вариантов`,
            {
              reply_markup: {
                inline_keyboard: [
                  ...results,
                  [
                    {
                      text: "< Назад",
                      callback_data: "Appliance",
                    },
                  ],
                ],
              },
            }
          );
        } else {
          ctx.telegram.sendMessage(ctx.chat.id, `Результатов не найдено`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "< Назад",
                    callback_data: "Appliance",
                  },
                ],
              ],
            },
          });
        }
      });
  } catch (err) {
    console.log(err);
  }
};
module.exports.ownerInfo = async (ctx) => {
  ctx.deleteMessage();
  const first = ctx.update.callback_query.data.split("-")[1];
  const last = ctx.update.callback_query.data.split("-")[2];
  try {
    base("Services")
      .select({
        view: "Services Data",
        filterByFormula: `AND({Owner First Name}='${first}',{Owner Last Name}='${last}')`,
      })
      .eachPage((records) => {
        records.forEach((item) => {
          ctx.telegram.sendPhoto(ctx.chat.id, item.get("Image")[0].url, {
            caption: `
          Имя: ${item.get("Owner First Name")} ${item.get(
              "Owner Last Name"
            )}\nЦена: ${item.get("Price") * 0.02 + item.get("Price")} RUB
          `,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Назад",
                    callback_data: `service-${item.get("Product")}`,
                  },
                  {
                    text: "Забронировать",
                    callback_data: `book-${item
                      .get("Owner First Name")}-${item.get("Owner Last Name")}`,
                  },
                ],
              ],
            },
          });
        });
      });
  } catch (err) {
    console.log(err);
  }
};
module.exports.giveFeedback = async (ctx) => {
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Вы можете сделать свой шаг к улучшению сервисов ATMA здесь https://airtable.com/shrC7nSKkeNaA8kBT 💫
    `
  );
};
module.exports.raiseTicket = async (ctx) => {
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    `
    Приносим извинения за доставленные неудобства 😞 Вы можете зарегистрировать свою жалобу здесь https://airtable.com/shrSQufO7q3QwuSsD
    `
  );
};
module.exports.buyItem = async (ctx) => {
  const first = ctx.update.callback_query.data.split("-")[1];
  const last = ctx.update.callback_query.data.split("-")[2];
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Ваше имя в телеграмме будет использовано для заказа"
  );
  base("Services")
    .select({
      view: "Services Data",
      filterByFormula: `AND({Owner First Name}='${first}',{Owner Last Name}='${last}')`,
    })
    .eachPage((records) => {
      records.forEach((record) => {
        base("Services").update(record.id, {
          Booked: "Booked",
          Customer: `${ctx.from.first_name} ${ctx.from.last_name}`,
          Total: record.get("Price") * 0.02 + record.get("Price")
        });
      });
    });
  ctx.telegram.sendMessage(
    ctx.chat.id,
    `Заказ оформлен, пожалуйста, оплатите указанную выше сумму и отправьте квитанцию на номер +79685691184 🎉`
  );
};
module.exports.helpFunc = async (ctx) => {
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "Я здесь, чтобы помочь вам 😊 Вы можете использовать эти команды, чтобы начать"
  );
  await ctx.telegram.sendMessage(
    ctx.chat.id,
    "/add- Добавить услугу/продукт\n\n/book- Забронировать a Service/Grocery\n\n/raise- Подайте жалобу\n\n/feedback- Оставьте свой отзыв"
  );
};
