const mongoose = require("mongoose");
const { User, Guild, Stats } = require("../models/index");
const CryptoJS = require("crypto-js");
const { Session } = require("ecoledirecte.js");
require("dotenv").config();
const ALG = process.env.ALG;
const unixTime = require('unix-time');
const api = require("../Api/index");
const fs = require("fs");
const { Client } = require("@notionhq/client");

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

module.exports = async client => {
    //Server
    client.getGuild = async guild => {
        const data = await Guild.findOne({ guildID: guild.id }).catch((e) => { });
        return data ? data : undefined;
    };

    client.getAllGuild = async () => {
        const data = await Guild.find().catch((e) => { });
        return data ? data : undefined;
    };

    client.updateGuild = async (g) => {
        const filter = { guildID: g.id };
        const update = { guildName: g.name };

        let doc = await Guild.findOneAndUpdate(filter, update, {
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
    }

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
    }

    client.asgarConnect = async user => {
        const data = await User.findOne({ userID: user.id });

        if (data) {
            var bytes = CryptoJS.AES.decrypt(data.password, ALG);
            var passwordEC = bytes.toString(CryptoJS.enc.Utf8);

            const session = new api.Session();
            const compte = await session.login(data.username, passwordEC);

            return compte ? compte : "NotED";
        } else return "NotRegister";
    }

    client.getPercent = (my, myC, sur) => {
        if (my > myC) {
            let percent1 = parseInt(myC) * (100 / sur);
            let percent2 = parseInt(my) * (100 / sur);
            let percent = percent2 - percent1;
            var percentTA = percent.toString().split(".")[0];
            const result = `✅ | **+${percentTA}%** | ✅`
            return result
        } else {
            let percent1 = parseInt(myC) * (100 / sur);
            let percent2 = parseInt(my) * (100 / sur);
            let percent = percent1 - percent2;
            var percentTA = percent.toString().split(".")[0];
            const result = `⚠️ | **-${percentTA}%** | ⚠️`
            return result
        }
    }

    //Stats
    client.updateStats = (type) => {
        Stats.find((err, docs) => {
            if (!err) {
                const stats = docs[0];
                const createdDate = stats.createdAt;
                let date = unixTime(new Date(createdDate + 86400));
                const nowDating = unixTime(new Date());
                let refine = date + 86400
                if (refine < nowDating) {
                    async function creatingNewStats() {
                        const merged = Object.assign({ _id: mongoose.Types.ObjectId(), numberOfRequest: 1 })
                        const createStats = await new Stats(merged);
                        createStats.save().then(async g => client.logger(`${client.timestampParser()} => New stats => ${g._id}`) &&
                            await Stats.findOneAndUpdate(
                                { _id: g._id },
                                {
                                    $inc: {
                                        numberOfRequest: 1,
                                        numberOfMessages: 1
                                    },
                                },
                                { new: true, upsert: true, setDefaultsOnInsert: true },
                                (err, docs) => {
                                    if (!err) return client.logger(`${client.timestampParser()} => Request updated ${docs.numberOfRequest}`);
                                    if (err) return client.logger(err);
                                }
                            )
                        );
                    }

                    creatingNewStats();

                } else {
                    async function mergedStats() {
                        if (type === "msg") {
                            await Stats.findOneAndUpdate(
                                { _id: stats._id },
                                {
                                    $inc: {
                                        numberOfMessages: 1,
                                    },
                                },
                                { new: true, upsert: true, setDefaultsOnInsert: true },
                                (err, docs) => {
                                    if (!err) return client.logger(`${client.timestampParser()} => Message sent number updated --> ${docs.numberOfMessages}`);
                                    if (err) return client.logger(err);
                                }
                            ).clone()
                        } else {
                            await Stats.findOneAndUpdate(
                                { _id: stats._id },
                                {
                                    $inc: {
                                        numberOfRequest: 1,
                                    },
                                },
                                { new: true, upsert: true, setDefaultsOnInsert: true },
                                (err, docs) => {
                                    if (!err) return client.logger(`${client.timestampParser()} => Actions request updated --> ${docs.numberOfRequest}`);
                                    if (err) return client.logger(err);
                                }
                            ).clone()
                        }
                    }
                    mergedStats();
                }
            }
            else client.logger("Error to get data : " + err);
        }).sort({ createdAt: -1 });
    }

    client.addOrUpdateGuild = async g => {
        const data = await client.getGuild(g);
        if (!data) {
            client.createGuild(g);
            client.updateStats();
        } else {
            client.updateGuild(g);
            client.updateStats();
        }
    }

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
                second: "2-digit"
            };

            let date = new Date(Date.now()).toLocaleDateString("fr-FR", options);
            return date.toString();
        }
    }

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
    }

    client.getDifference = (array1, array2) => {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1.id === object2.id;
            });
        });
    }

    client.getDifferenceForGrades = (array1, array2) => {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1._raw.id === object2._raw.id;
            });
        });
    }

    client.getCanceledClasses = (schedules) => {
        if (client.isEmpty(schedules)) return [];
        const canceledClasses = [];
        for (var i = 0; i < schedules.length; i++) {
            if (schedules[i]._raw.isAnnule) {
                canceledClasses.push(schedules[i]);
            }
        }
        return canceledClasses;
    }

    client.getStats = async () => {
        return {
            users: await client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b),
            guilds: await client.guilds.cache.size
        }
    }

    client.logger = log => {
        const files = fs.readdirSync("logs");
        const fileName = files[files.length - 1];
        fs.appendFile(`logs/${fileName}`, `${log}\n`, (err) => {
            if (!err) return console.log(log);
            console.log(err);
        })
    }

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
    }
};