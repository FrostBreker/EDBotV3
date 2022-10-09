// ██████ Integrations █████████████████████████████████████████████████████████

// —— Promise based HTTP client for the browser and node.js
const axios = require("axios");

// —————————————————————————————————————————————————————————————————————————————

const Student = require("./Student"),
    Family = require("./Family");

class Session {

    constructor() { }

    async login(login, password) {
        try {
            const response =
                await axios.post(
                    "https://api.ecoledirecte.com/v3/login.awp",
                    `data={"identifiant": "${login}", "motdepasse": "${password}"}`
                );

            if (response.data.code === 505)
                throw new Error(err);

            const account = response.data.data.accounts[0];

            if (account.typeCompte === "E") {
                const student = new Student(this, account);
                this.token = response.data.token;
                return student;
            } else {
                throw new Error("Only students are supported");
            }

            return this

        } catch (err) { throw new Error(err) }
    }

    async request(url, args = {}) {
        try {
            const response =
                await axios.post(
                    url,
                    `data=${JSON.stringify({
                        ...args,
                        ...{ token: this.token }
                    })}`
                );
            return response

        } catch (err) { throw new Error(err) }
    }
}

module.exports = Session;