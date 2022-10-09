const CryptoJS = require("crypto-js");
const { Session } = require("ecoledirecte.js");
const api = require("../../Api/index");
require("dotenv").config();
const ALG = process.env.ALG;
globalThis.users = [];
const { sendNote, sendHomework, sendCanceledClass, sendMessages, sendSLS } = require("./AcionsIndex");

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
                schoollife: schoollife
            }
        )
    })
}

module.exports.send = async (client) => {
    const newUsers = users;
    for (let i = 0; i < newUsers.length; i++) {
        const user = newUsers[i];
        async function sendAutopost() {
            const dUser = await client.users.fetch(user.userId).catch(() => { })
            if (client.isEmpty(dUser)) return;

            await user.compte.getGrades().then((notes) => {
                sendNote(dUser, user, notes, client);
            }).catch(() => { })

            await user.compte.getHomework(Date.now(), true).then((homeworks) => {
                sendHomework(dUser, user, homeworks, client);
            }).catch(() => { })

            await user.compte.getTimetable([client.getTheDate(), client.getTheDate()]).then((schedule) => {
                sendCanceledClass(dUser, user, schedule, client);
            }).catch(() => { })

            await user.compte.getMessages().then((messages) => {
                sendMessages(dUser, user, messages, client);
            }).catch(() => { });

            await user.assgarCompte.getSchoolLife().then((schoollife) => {
                sendSLS(dUser, user, schoollife, client);
            }).catch(() => { });
        }
        sendAutopost()
    }
}