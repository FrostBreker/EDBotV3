const express = require('express');
const cron = require('node-cron');
const cors = require('cors');
const { add, send } = require("../../Actions/Autopost/index");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        //Start api
        const app = express();
        const corsOptions = {
            origin: [`${process.env.CLIENT_URL}`],
            credentials: true,
            allowedHeaders: ["sessionId", "Content-Type", "Authorization", "authorization"],
            exposedHeaders: ["sessionId"],
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            preflightContinue: false,
        };
        app.use(cors(corsOptions));
        app.listen(process.env.PORT, () => {
            console.log(`${client.timestampParser()} => Express server is connected on port: ${process.env.PORT}`)
        });

        //API
        const guild = [];
        await client.guilds.cache.map(e => guild.push(e));
        setInterval(() => app.get('/', (req, res) => {
            const infoBotToWeb = [`${client.guilds.cache.map(g => g.
                memberCount).reduce((a, b) => a + b)}`, `${client.guilds.cache.size.toString()}`];
            res.send(infoBotToWeb)
        }), 1000);

        //Delete guild if not present  in the bot;
        (await client.getAllGuild()).forEach(async g => {
            const findGuild = await guild.find((guild) => {
                if (guild.id === g.guildID) return guild;
            });
            if (!findGuild) {
                return client.deleteGuild({ id: g.guildID, name: g.guildName });
            }
        });

        //Check guild on DB
        guild.forEach(async (g) => {
            const data = await client.getGuild(g);
            if (!data) return client.createGuild(g);
        });

        //Presence
        setInterval(async () => client.user.setPresence({ activities: [{ name: `ED BOT - ${(await client.getAllGuild()).length} serveurs`, type: 'WATCHING' }], status: 'online' }), 10000);

        //Autosend
        await add(client);
        cron.schedule('0 */1 * * *', async () => {
            if (!client.isEmpty(users)) {
                await send(client);
                await add(client);
            } else {
                add(client);
            }
        });

        //Bot login
        console.log(`${client.timestampParser()} => ${client.user.tag} with ${client.guilds.cache.map(g => g.
            memberCount).reduce((a, b) => a + b)} users!`)
    }
}