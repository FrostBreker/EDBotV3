const _ = require('lodash');
const { grades } = require('../../Embeds/ED');

function sendGrades(dUser, user, notes, client) {
    if (!client.isEmpty(notes) && !client.isEmpty(user.notes)) {
        if (!_.isEqual(user.notes, notes)) {
            const sortedArray = client.getDifferenceForGrades(notes, user.notes);
            sortedArray.map(async (s) => {
                return await dUser.send({ embeds: [grades(s, dUser, client)] }).then(async () => {
                    client.makeOrUpdateStats("dm", "notes", dUser.tag);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendGrades