const { wrongVBtn } = require("../../Buttons/MiscButtons");
const { wrongV } = require("../../Embeds/Misc");

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(client, message) {
        if (message.author.bot) return;
        if (message.content.startsWith("e!")) {
            message.channel.send({ embeds: [wrongV()], components: [wrongVBtn()] });
        }
    }
}