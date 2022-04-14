const Student = require("./Student");

class Family {

    constructor(session, account) {

        this.session = session;
        this.data    = account;

    }

    /**
    * Retrieves the student's informations
    * @param {String} token
    */
    async getChild(token) {
        try {

            const childs = this.data.accounts[0].profile.eleves;

            this.members = childs.map(
                (child) => new Student(this.session, child)
            );

            const response = await this.session.request(
                "https://api.ecoledirecte.com/v3/contactetablissement.awp?verbe=get&",
                token
            );

            this.session.token = data.token

            return response.data.data
        } catch (err) {
            throw new Error(err)
        }
    }
}

module.exports = Family