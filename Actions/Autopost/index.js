const CryptoJS = require("crypto-js");
const _ = require('lodash');
const { Session } = require("ecoledirecte.js");
const api = require("../../Api/index");
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
            return;
        })
        const sessionAsg = new api.Session();
        const compteAsgar = await sessionAsg.login(user.username, passwordEC).catch(() => {
            return;
        })
        if (!compte || !compteAsgar) return;
        if (compte.type !== "student") return;

        const notes = await compte.getGrades().catch(() => { })
        const homeworks = await compte.getHomework(Date.now(), true).catch(() => { })
        const schedule = await compte.getTimetable([client.getTheDate(), client.getTheDate()]).catch(() => { })
        const messages = await compte.getMessages().catch(() => { });

        const schoollife = await compteAsgar.getSchoolLife();

        users.push(
            {
                compte: compte,
                assgarCompte: compteAsgar,
                userId: user.userID,
                notes: notes,
                homeworks: homeworks,
                schedule: client.getCanceledClasses(schedule),
                messages: messages,
                schoollife: schoollife.absencesRetards
            }
        )
    })
}

module.exports.send = async (client) => {
    users.map(async (user) => {
        const member = await client.users.fetch(user.userId).catch(() => { })
        if (client.isEmpty(member)) return;

        await user.compte.getGrades().then(async (notes) => {
            await sendNote(member, user, notes, client);
        }).catch(() => { })

        await user.compte.getHomework(Date.now(), true).then(async (homeworks) => {
            await sendHomework(member, user, homeworks, client);
        }).catch(() => { })

        await user.compte.getTimetable([client.getTheDate(), client.getTheDate()]).then(async (schedule) => {
            await sendCanceledClass(member, user, schedule, client);
        }).catch(() => { })

        await user.compte.getMessages().then(async (messages) => {
            await sendMessages(member, user, messages, client);
        }).catch(() => { });

        await user.assgarCompte.getSchoolLife().then(async (schoollife) => {
            await sendSLS(member, user, schoollife.absencesRetards, client);
        }).catch(() => { });

    })
    return true;
}