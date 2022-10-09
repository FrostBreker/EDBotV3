const _ = require('lodash');
const { edHomeworks } = require('../../Embeds/ED');

function sendHomeworks(dUser, user, homeworks, client) {
    if (!client.isEmpty(homeworks) && !client.isEmpty(user.homeworks)) {
        if (!_.isEqual(user.homeworks, homeworks)) {
            const sortedArray = client.getDifference(homeworks, user.homeworks);
            sortedArray.map(async (s) => {
                if (s.job === undefined) return;
                if (user.userId === "284792282249428993") client.addHomeworkToNotion(`${s.subject.name}`, s.job.content.text, s.job.givenAt, s.date);

                return await dUser.send({ embeds: [edHomeworks(s, dUser, client)] }).then(() => {
                    client.makeOrUpdateStats("dm", "devoir", dUser.tag);
                    return client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendHomeworks