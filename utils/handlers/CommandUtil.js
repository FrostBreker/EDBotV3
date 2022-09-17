const { promisify } = require("util");
const { glob } = require("glob");
const { clientId } = require("../../config");
const pGlob = promisify(glob);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('node:fs');
const TOKEN = process.env.TOKEN;

module.exports = async client => {
    (await pGlob(`${process.cwd()}/commands/*.js`)).map(commandFile => {
        const cmd = require(commandFile);
        const dd = cmd.data.toJSON();
        if (!dd.name || !cmd.description) {
            return client.logger(`------\nCommandes non-chargée: pas de nom/desciption\nFichier --> ${commandFile}`);
        }
        client.commands.set(dd.name, cmd)
        client.logger(`Commande chargée [🛢️] : ${dd.name}`, "\n_______________________________________")
    });

    const commands = [];
    const commandFiles = fs.readdirSync(`${process.cwd()}/commands`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {

        const command = require(`${process.cwd()}/commands/${file}`);
        commands.push(command.data);
    }
    const rest = new REST({ version: '9' }).setToken(TOKEN);

    (async () => {
        try {
            client.logger('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            client.logger('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
};