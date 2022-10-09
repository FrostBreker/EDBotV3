const _ = require('lodash');
const { schoolLife } = require('../../Embeds/ED');

function sendSL(dUser, user, schoollife, client) {
    if (!client.isEmpty(schoollife) && !client.isEmpty(user.schoollife)) {
        if (!_.isEqual(user.schoollife, schoollife)) {
            const sortedArray = client.getDifference(schoollife, user.schoollife);
            sortedArray.map(async (vs) => {
                return await dUser.send({ embeds: [schoolLife(dUser, vs, client)] }).then(async () => {
                    client.makeOrUpdateStats("dm", "vie-scolaire", dUser.tag);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendSL