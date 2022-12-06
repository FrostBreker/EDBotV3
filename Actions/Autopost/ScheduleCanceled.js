const _ = require('lodash');
const { edScheduleCanceled } = require('../../Embeds/ED');

function sendCanceledClass(dUser, user, schedule, client) {
    if (!client.isEmpty(schedule) && !client.isEmpty(user.schedule)) {
        if (!_.isEqual(user.schedule, client.getCanceledClasses(schedule))) {
            const sortedArray = client.getDifference(client.getCanceledClasses(schedule), user.schedule);
            sortedArray.map(async (s) => {
                return await dUser.send({ embeds: [edScheduleCanceled(s, dUser, client)] }).then(async () => {
                    client.makeOrUpdateStats("dm", "emploi-du-temps", dUser);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendCanceledClass;