const mongoose = require("mongoose");
const { User, Guild, Stats } = require("../models/index");
const CryptoJS = require("crypto-js");
const { Session } = require("ecoledirecte.js");
require("dotenv").config();
const ALG = process.env.ALG;
const unixTime = require('unix-time');
const api = require("../Api/index");

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
        }).then(g => console.log(`${client.timestampParser()} => Update d'un serveur => ${g.guildName}`))
    }

    client.createGuild = async g => {
        const data = await client.getGuild(g);
        if (client.isEmpty(data)) {
            const merged = Object.assign({ _id: mongoose.Types.ObjectId() }, { guildID: g.id, guildName: g.name, ownerId: g.ownerId });
            const createGuild = await new Guild(merged);
            return createGuild.save().then(g => console.log(`${client.timestampParser()} => Nouveau serveur => ${g.guildName}`));
        }
    }

    client.deleteGuild = async g => {
        await Guild.deleteOne({ guildID: g.id }).exec().then(() => console.log(`${client.timestampParser()} => Suppression d'un serveur => ${g.name}`));
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
        await User.deleteOne({ userID: user.userID }).exec().then(() => console.log(`${client.timestampParser()} => Utilisateur suprimée => ${user.pseudo}`));
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
            return await interaction.deferReply({ ephemeral: true });
        } else {
            if (privacy === "pv") {
                return await interaction.deferReply({ ephemeral: true });
            } else if (privacy === "p") {
                return await interaction.deferReply({ ephemeral: false });
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
                        createStats.save().then(async g => console.log(`${client.timestampParser()} => New stats => ${g._id}`) &&
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
                                    if (!err) return console.log(`${client.timestampParser()} => Request updated ${docs.numberOfRequest}`);
                                    if (err) return console.log(err);
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
                                    if (!err) return console.log(`${client.timestampParser()} => Message sent number updated --> ${docs.numberOfMessages}`);
                                    if (err) return console.log(err);
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
                                    if (!err) return console.log(`${client.timestampParser()} => Actions request updated --> ${docs.numberOfRequest}`);
                                    if (err) return console.log(err);
                                }
                            ).clone()
                        }
                    }
                    mergedStats();
                }
            }
            else console.log("Error to get data : " + err);
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
};