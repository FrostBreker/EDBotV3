const { MessageActionRow, MessageButton } = require('discord.js');
const config = require('../config');

module.exports = {
    wrongVBtn: () => {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Inviter le bot')
                    .setURL(config.inviteLink)
            )
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setLabel('Serveur de support')
                    .setURL(config.supportLink)
            );

        return row;
    }
}