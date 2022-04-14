const { Client, Collection } = require("discord.js");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

const client = new Client({ intents: 4097 });
module.exports = client;

//Setup DB
require("./utils/functions")(client);
client.mongoose = require("./utils/mongoose");
client.mongoose.init(client.timestampParser());
//Handler and Commands
client.commands = new Collection();
['EventUtil', "CommandUtil"].forEach(handler => { require(`./utils/handlers/${handler}`)(client) });

//Check error
process.on("exit", code => { console.log(`Le processus s'est arrêté avec le code: ${code}!`); });
process.on("uncaughtException", (err, origin) => { console.log(`uncaughtException: ${err}`, `Origine: ${origin}`); });
process.on("unhandledRejection", (reason, promise) => { console.log(`UNHANDLED_REJECTION: ${reason}\n--------\n`, promise); });
process.on("warning", (...args) => { console.log(...args); });

//Login
client.login(TOKEN);