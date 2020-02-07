const vk = require("node-vk-bot-api");
const Markup = require("node-vk-bot-api/lib/markup");
const axios = require("axios");
const moment = require("moment");

// get from config
const bot = new vk(
  ""
);

const matchKeyboard = Markup.keyboard([
  [Markup.button("Следующий матч"), Markup.button("Предыдущий матч")]
]).oneTime();

bot.command("/матч", async ctx => {
  try {
    ctx.reply("Выберите нужный вам матч в меню", null, matchKeyboard);
  } catch (error) {
    console.log(error);
  }
});

bot.command("Следующий матч", async ctx => {
  try {
    axios
      .get(
        "https://statsapi.web.nhl.com/api/v1/teams/16?expand=team.schedule.next"
      )
      .then(response => {
        const game = response.data.teams[0].nextGameSchedule.dates[0].games[0];
        const gameTime = moment(game.gameDate).format("DD.MM.YY HH:mm");
        ctx.reply(
          `&#127954; ${game.teams.home.team.name} сыграют с ${
            game.teams.away.team.name
          } в ${game.venue.name}
          &#128197; Дата: ${gameTime.split(" ")[0]}
          &#128368; Время (по МСК): ${gameTime.split(" ")[1]} \n 
          &#128250; Посмотреть онлайн можно здесь: 
            • onhockey.tv
            • vk.cc/a8C2JS
          `, null, matchKeyboard
        );
      });
  } catch (err) {
    console.log(err);
  }
});

bot.command("Предыдущий матч", ctx => {
  let answer = "";
  try {
    axios
      .get(
        "https://statsapi.web.nhl.com/api/v1/teams/16?expand=team.schedule.previous"
      )
      .then(response => {
        const responseData =
          response.data.teams[0].previousGameSchedule.dates[0].games[0];
        answer = `&#127954; ${responseData.teams.home.team.name} ${
          responseData.teams.home.score > responseData.teams.away.score
            ? "победили"
            : "уступили"
        } ${responseData.teams.away.team.name} \n`;
        answer =
          answer +
          `Счет: ${responseData.teams.home.score}:${responseData.teams.away.score} \n \n`;
        axios
          .get(`https://statsapi.web.nhl.com${responseData.link}`)
          .then(res => {
            const gameReview = res.data.liveData;
            gameReview.plays.scoringPlays.forEach(play => {
              obsPlay = gameReview.plays.allPlays[play];
              answer =
                answer +
                `${obsPlay.about.goals.home}:${obsPlay.about.goals.away} — ${
                  obsPlay.players[0].player.fullName
                } (${obsPlay.players[0].seasonTotal})${
                  obsPlay.result.description.split("assists: ")[1].length > 0
                    ? `; Передачи: ${
                        obsPlay.result.description.split("assists: ")[1]
                      }`
                    : " "
                }\n`;
            });
            answer =
              answer +
              `\n3 &#11088; матча:\n\n&#11088;${gameReview.decisions.firstStar.fullName};\n&#11088;&#11088;${gameReview.decisions.secondStar.fullName};\n&#11088;&#11088;&#11088;${gameReview.decisions.thirdStar.fullName}.`;
            ctx.reply(answer, null, matchKeyboard);
          });
      });
  } catch (error) {
    console.log(error);
  }
});

// bot.on(ctx => {
//   console.log(ctx.message)
// })

bot.startPolling(() => {
  console.log("poll start");
});

process.on("unhandledRejection", error => {
  // Will print "unhandledRejection err is not defined"
  console.log("unhandledRejection", error);
});
