const { MessageEmbed } = require('discord.js');
const CryptoJS = require("crypto-js");
const _ = require('lodash');
const { Session } = require("ecoledirecte.js");
require("dotenv").config();
const ALG = process.env.ALG;
globalThis.users = [];

function getDifference(array1, array2) {
    return array1.filter(object1 => {
        return !array2.some(object2 => {
            return object1.id === object2.id;
        });
    });
}

module.exports.add = async (client) => {
    const allUser = await client.getAllUsers();
    users = [];
    allUser.map(async user => {
        if (!user.autoPost) return;
        if (!user.username || !user.password) return;

        var bytes = CryptoJS.AES.decrypt(user.password, ALG);
        var passwordEC = bytes.toString(CryptoJS.enc.Utf8);

        const session = new Session(user.username, passwordEC);
        const compte = await session.login().catch(() => {
            return client.deleteUser(user);
        })
        if (!compte) return;
        if (compte.type !== "student") return client.deleteUser(user);

        const notes = await compte.getGrades().catch(() => { })
        const homeworks = await compte.getHomework(Date.now(), true).catch(() => { })
        if (!notes || !homeworks) return;

        users.push(
            {
                userId: user.userID,
                notes: notes,
                homeworks: homeworks,
                compte: compte
            }
        )
    })
}

module.exports.send = async (client) => {
    users.map(async (user) => {
        const member = await client.users.fetch(user.userId).catch(() => { })
        if (!member) return;

        await user.compte.getGrades().then((notes) => {
            this.sendNotes(member, user, notes, client);
        }).catch(() => { })

        await user.compte.getHomework(Date.now(), true).then((homeworks) => {
            this.sendHomeworks(member, user, homeworks, client);
        }).catch(() => { })
    })
    return true;

}

module.exports.sendNotes = async (member, user, notes, client) => {
    if (notes) {
        if (!_.isEqual(user.notes, notes)) {
            const sortedArray = getDifference(notes, user.notes);
            sortedArray.map((s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Note de ${s.subjectName}`)
                    .setThumbnail(member.avatarURL() || 'https://cdn.discordapp.com/attachments/779466058171154483/842742558354571274/logo_ecole_directe2.jpg')
                    .setDescription("<:annonce:962378435815161936> : **" + s.subjectName + "** - **" + s.name + "** - **" + s._raw.typeDevoir + "**\n\n<:stats:962354418660028416> : " + s.value + "/20 (**Coef** : " + s._raw.coef + ")\n\n" + client.getPercent(s.value, s.classAvg, s.outOf) + "\n\n<:planning:959563680398315540> : <t:" + parseInt(Date.parse(s._raw.date) / 1000) + ":R>")
                    .setTimestamp()
                    .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports.sendHomeworks = async (member, user, homeworks, client) => {
    if (homeworks) {
        if (!_.isEqual(user.homeworks, homeworks)) {
            const sortedArray = getDifference(homeworks, user.homeworks);
            sortedArray.map((s) => {
                const embedPrincipal = new MessageEmbed()
                    .setColor(430591)
                    .setTitle(`> 🔔 | Travaille à faire en ${s.subject.name} (${s.teacher})`)
                    .setThumbnail(user.avatarURL())
                    .setDescription(`> ${s.job.content.text}\n\n<:planning:959563680398315540> ${s.date ? `<t:${parseInt(Date.parse(s.date) / 1000)}:R>` : "Inconue"}`)
                    .setTimestamp()
                    .setFooter({ text: 'EcoleDirecte | 🌐', iconURL: client.user.avatarURL() })

                member.send(embedPrincipal).then(async () => {
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}