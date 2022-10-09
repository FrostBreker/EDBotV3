const mongoose = require("mongoose");
const { User, Guild, Stats } = require("../models/index");
const CryptoJS = require("crypto-js");
const { Session } = require("ecoledirecte.js");
require("dotenv").config();
const ALG = process.env.ALG;
const api = require("../Api/index");
const fs = require("fs");
const { Client } = require("@notionhq/client");
const { edSelect } = require("../SelectMenu/ED");
const { edHomeworks, edMessages, grades, schoolLife } = require("../Embeds/ED");
const { auth } = require("../Embeds/Misc");

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

module.exports = async client => {
    //Server
    client.getGuild = async guild => {
        const data = await Guild.findOne({ guildID: guild.id }).catch(() => { });
        return data ? data : undefined;
    };

    client.getAllGuild = async () => {
        const data = await Guild.find().catch(() => { });
        return data ? data : undefined;
    };

    client.updateGuild = async (g) => {
        const filter = { guildID: g.id };
        const update = { guildName: g.name };

        await Guild.findOneAndUpdate(filter, update, {
            new: true
        }).then(g => client.logger(`${client.timestampParser()} => Update d'un serveur => ${g.guildName}`))
    }

    client.createGuild = async g => {
        const data = await client.getGuild(g);
        if (client.isEmpty(data)) {
            const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, { guildID: g.id, guildName: g.name, ownerId: g.ownerId });
            const createGuild = await new Guild(merged);
            return createGuild.save().then(g => client.logger(`${client.timestampParser()} => Nouveau serveur => ${g.guildName}`));
        }
    }

    client.deleteGuild = async g => {
        await Guild.deleteOne({ guildID: g.id }).exec().then(() => client.logger(`${client.timestampParser()} => Suppression d'un serveur => ${g.name}`));
    }
    //User
    client.getUser = async user => {
        const data = await User.findOne({ userID: user.id });
        return data ? data : undefined;
    };

    client.getAllUsers = async () => {
        const data = await User.find();
        return data ? data : undefined;
    };

    client.deleteUser = async user => {
        await User.deleteOne({ userID: user.userID }).exec().then(() => client.logger(`${client.timestampParser()} => Utilisateur suprimée => ${user.pseudo}`));
    };

    //ED
    client.connect = async user => {
        const data = await User.findOne({ userID: user.id });

        if (!client.isEmpty(data)) {
            var bytes = CryptoJS.AES.decrypt(data.password, ALG);
            var passwordEC = bytes.toString(CryptoJS.enc.Utf8);

            const session = new Session(data.username, passwordEC);
            const compte = await session.login();

            if (compte) return compte;
        }
    };

    client.defferWithPrivacy = async (privacy, interaction) => {
        if (!privacy) {
            return await interaction.deferReply({ ephemeral: true }).catch(() => { });
        } else {
            if (privacy === "pv") {
                return await interaction.deferReply({ ephemeral: true }).catch(() => { });
            } else if (privacy === "p") {
                return await interaction.deferReply({ ephemeral: false }).catch(() => { });
            }
        }
    };

    client.asgarConnect = async user => {
        const data = await User.findOne({ userID: user.id });

        if (data) {
            var bytes = CryptoJS.AES.decrypt(data.password, ALG);
            var passwordEC = bytes.toString(CryptoJS.enc.Utf8);

            const session = new api.Session();
            const compte = await session.login(data.username, passwordEC);

            return compte ? compte : "NotED";
        } else return "NotRegister";
    };

    client.getPercent = (my, myC, sur) => {
        const percent1 = parseInt(myC) * (100 / sur);
        const percent2 = parseInt(my) * (100 / sur);
        if (my > myC) {
            let percent = percent2 - percent1;
            var percentTA = percent.toString().split(".")[0];
            const result = `✅ | **${percentTA}% au-dessus de la moyenne de classe** | ✅`
            return result
        } else {
            let percent = percent1 - percent2;
            var percentTA = percent.toString().split(".")[0];
            const result = `⚠️ | **${percentTA}% en dessous de la moyenne de classe** | ⚠️`
            return result
        }
    };

    client.createSelectMenu = (data, type, id) => {
        const convertDateToFrench = d => {
            return new Date(d).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }).split(" ")[0];
        };
        let ref = [];
        switch (type) {
            case "homeworks":
                ref = [];
                for (let i = 0; i < data.length; i++) {
                    const e = data[i];
                    ref.push({
                        label: `${e.subject.name} - ${convertDateToFrench(e.date)}`,
                        value: e.id.toString()
                    });
                }
                break;
            case "mails":
                ref = [];
                for (let i = 0; i < data.length; i++) {
                    const e = data[i];
                    ref.push({
                        label: `${e.from.lastName} - ${convertDateToFrench(e.date)}`,
                        value: e.id.toString()
                    });
                }
                break;
            case "grades":
                ref = [];
                for (let i = 0; i < data.length; i++) {
                    const e = data[i];
                    ref.push({
                        label: `${e.value}/${e.outOf} - ${e.subjectName}`,
                        value: e._raw.id.toString()
                    });
                }
                break;
            case "schoollife":
                ref = [];
                for (let i = 0; i < data.length; i++) {
                    const e = data[i];
                    ref.push({
                        label: `${e.typeElement} - ${convertDateToFrench(e.date)}`,
                        value: e.id.toString()
                    });
                }
                break;
        }
        if (ref.length >= 24) {
            ref.reverse();
            ref.length = 24;
            ref.reverse();
        }
        if (client.isEmpty(ref)) return;
        return edSelect(ref, type, id);
    };

    client.findEdObjectWithId = async (user, id, type, client) => {
        let data;
        const compte = await client.connect(user).catch(() => { });
        const asgarCompte = await client.asgarConnect(user).catch(() => { });
        if (client.isEmpty(compte) || compte.type !== "student" || client.isEmpty(asgarCompte)) return auth();
        switch (type) {
            case "homeworks":
                const homeworks = await compte.getHomework(Date.now(), true);
                data = await homeworks.find(h => {
                    if (h.id.toString() === id) return h;
                });
                if (client.isEmpty(data)) return;
                else return edHomeworks(data, user, client);
            case "mails":
                const mails = await compte.getMessages();
                data = await mails.find(m => {
                    if (m.id.toString() === id) return m;
                });
                if (client.isEmpty(data)) return;
                const content = await data.getContent();
                let refined = []
                content.text.split("\n").map(x => {
                    if (!x.startsWith("[data:image")) {
                        refined.push(x);
                    }
                })
                const ref = refined ? refined.join("\n") : `Inconnue.`;
                return edMessages(data, ref, user, client);
            case "grades":
                const gradesList = await compte.getGrades();
                data = await gradesList.find(h => {
                    if (h._raw.id.toString() === id) return h;
                });
                if (client.isEmpty(data)) return;
                else return grades(data, user, client);
            case "schoollife":
                const schoolLifeList = await asgarCompte.getSchoolLife();
                data = await schoolLifeList.find(h => {
                    if (h.id.toString() === id) return h;
                });
                if (client.isEmpty(data)) return;
                else return schoolLife(user, data, client);
        }
    };

    //Stats
    client.createStat = async () => {
        const merged = Object.assign(
            { _id: mongoose.Types.ObjectId() },
            {
                commands: [],
                dms: []
            });
        const createStats = new Stats(merged);
        return createStats.save().then((docs) => {
            client.logger(`${client.timestampParser()} => [STATS] Stats created`);
            return docs;
        });
    };

    const updateStats = async (type, value, username, docs) => {
        if (client.isEmpty(docs)) return;
        switch (type) {
            case "cmd":
                docs.commands.push({
                    value: value,
                    timestamp: Date.now()
                })
                await docs.save().then(() => client.logger(`${client.timestampParser()} => [STATS] Commande => ${value} => (${username})`));
                break;
            case "dm":
                docs.dms.push({
                    _id: mongoose.Types.ObjectId(),
                    value: value,
                    timestamp: Date.now()
                })
                await docs.save().then(() => client.logger(`${client.timestampParser()} => [STATS] DM => ${value} => (${username})`));
                break;
            default:
                break;
        }
    };
    client.makeOrUpdateStats = async (type, value, username) => {
        const stats = await Stats.find().catch(() => { });
        if (client.isEmpty(stats)) {
            return client.createStat().then((docs) => {
                return updateStats(type, value, username, docs);
            })
        } else {
            return updateStats(type, value, username, stats[stats.length - 1]);
        }
    };

    client.addOrUpdateGuild = async (g, type, value, username) => {
        if (client.isEmpty(await client.getGuild(g))) client.createGuild(g);
        else client.updateGuild(g);
        return client.makeOrUpdateStats(type, value, username);
    };

    //timestampParser
    client.timestampParser = num => {
        if (num) {
            let options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };

            let date = new Date(num).toLocaleDateString("fr-FR", options);
            return date.toString();
        } else {
            let options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Europe/Paris"
            };

            let date = new Date(Date.now()).toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
            return date.toString();
        }
    };

    //Check if data isEmpty
    client.isEmpty = (value) => {
        return (
            value === undefined ||
            value === null ||
            (typeof value === "object" && Object.keys(value).length === 0) ||
            (typeof value === "string" && value.trim().length === 0)
        );
    };

    client.getTheDate = () => {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return yyyy + '-' + mm + '-' + dd;
    };

    client.getDifference = (array1, array2) => {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1.id === object2.id;
            });
        });
    };

    client.getDifferenceForGrades = (array1, array2) => {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1._raw.id === object2._raw.id;
            });
        });
    };

    client.getCanceledClasses = (schedules) => {
        if (client.isEmpty(schedules)) return [];
        const canceledClasses = [];
        for (var i = 0; i < schedules.length; i++) {
            if (schedules[i]._raw.isAnnule) {
                canceledClasses.push(schedules[i]);
            }
        }
        return canceledClasses;
    };

    client.getStats = async () => {
        return {
            users: await client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b),
            guilds: await client.guilds.cache.size
        }
    };

    client.logger = log => {
        const files = fs.readdirSync("logs");
        const fileName = files[files.length - 1];
        fs.appendFile(`logs/${fileName}`, `${log}\n`, (err) => {
            if (!err) return console.log(log);
            console.log(err);
        })
    };

    //Notion
    client.addHomeworkToNotion = async (name, content, startDate, endDate) => {
        try {
            await notion.pages.create({
                parent: {
                    database_id: process.env.NOTION_DATABASE_ID,
                },
                icon: {
                    type: "emoji",
                    emoji: "📝",
                },
                "properties": {
                    "Project name": {
                        "title": [
                            {
                                "text": {
                                    "content": name
                                }
                            }
                        ]
                    },
                    "Status": {
                        id: "notion%3A%2F%2Fprojects%2Fstatus_property",
                        type: "status",
                        status: { id: "planned", name: "Planning", color: "blue" },
                    },
                    "Dates": {
                        id: 'notion%3A%2F%2Fprojects%2Fproject_dates_property',
                        type: 'date',
                        date: { start: startDate, end: endDate, time_zone: null }
                    }
                },
                "children": [
                    {
                        "object": "block",
                        "heading_2": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": name
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "object": "block",
                        "paragraph": {
                            "rich_text": [
                                {
                                    "text": {
                                        "content": content
                                    }
                                }
                            ],
                            "color": "default"
                        }
                    }
                ]
            }).then((res) => {
                client.logger(`${client.timestampParser()} => Homework added to notion --> ${res.properties["Project name"].title[0].text.content}`);
            })
        } catch (err) {
            console.log(`${client.timestampParser()} => [ERROR]: ${err}`);
            client.logger(`${client.timestampParser()} => [ERROR]: ${err}`);
        }
    };
};