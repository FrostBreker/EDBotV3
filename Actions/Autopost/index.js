const CryptoJS = require("crypto-js");
const _ = require('lodash');
const { Session } = require("ecoledirecte.js");
require("dotenv").config();
const ALG = process.env.ALG;
globalThis.users = [];
const { sendNote, sendHomework, sendCanceledClass, sendMessages, sendSLS } = require("./AcionsIndex")

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
        if (compte.type !== "student") return;

        const notes = await compte.getGrades().catch(() => { })
        const homeworks = await compte.getHomework(Date.now(), true).catch(() => { })
        const schedule = await compte.getTimetable([client.getTheDate(), client.getTheDate()]).catch(() => { })
        const messages = await compte.getMessages().catch(() => { });

        const assgarCompte = await client.asgarConnect({ id: user.userID });
        const schoollife = await assgarCompte.getSchoolLife();

        users.push(
            {
                compte: compte,
                assgarCompte: assgarCompte,
                userId: user.userID,
                notes: notes,
                homeworks: homeworks,
                schedule: client.getCanceledClasses(schedule),
                messages: messages,
                schoollife: schoollife
            }
        )
    })
}

module.exports.send = async (client) => {
    users.map(async (user) => {
        const member = await client.users.fetch(user.userId).catch(() => { })
        if (!member) return;

        await user.compte.getGrades().then((notes) => {
            sendNote(member, user, notes, client);
        }).catch(() => { })

        await user.compte.getHomework(Date.now(), true).then((homeworks) => {
            sendHomework(member, user, homeworks, client);
        }).catch(() => { })

        await user.compte.getTimetable([client.getTheDate(), client.getTheDate()]).then((schedule) => {
            sendCanceledClass(member, user, schedule, client);
        }).catch(() => { })

        await user.compte.getMessages().then((messages) => {
            sendMessages(member, user, messages, client);
        }).catch(() => { });

        await user.assgarCompte.getSchoolLife().then((schoollife) => {
            sendSLS(member, user, schoollife, client);
        }).catch(() => { });

    })
    return true;
}