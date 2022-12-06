const _ = require('lodash');
const { edMessages } = require('../../Embeds/ED');

function sendMessage(dUser, user, messages, client) {
    if (!client.isEmpty(messages) && !client.isEmpty(user.messages)) {
        if (!_.isEqual(user.messages, messages)) {
            const sortedArray = client.getDifference(messages, user.messages);
            sortedArray.map(async (s) => {
                const content = await s.getContent();
                let refined = []
                content.text.split("\n").map(x => {
                    if (!x.startsWith("[data:image")) {
                        refined.push(x);
                    }
                })
                const ref = refined ? refined.join("\n") : `Inconnue.`;

                return await dUser.send({ embeds: [edMessages(s, ref, dUser, client)] }).then(async () => {
                    client.makeOrUpdateStats("dm", "mail", dUser);
                    await client.updateStats("msg");
                }).catch(() => { })
            })
        }
    }
}

module.exports = sendMessage