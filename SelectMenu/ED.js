const { MessageActionRow, MessageSelectMenu } = require("discord.js");

module.exports = {
    edSelect: (data, type, id) => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(`edselect-${type}-${id}`)
                    .setPlaceholder('Choisissez...')
                    .addOptions(data)
            )

        return row
    }
}