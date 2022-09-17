const { Client, Collection } = require("discord.js");
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const express = require('express');
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: [`${process.env.CLIENT_URL}`, "http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["sessionId", "Content-Type", "Authorization", "authorization"],
    exposedHeaders: ["sessionId"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
};
app.use(cors(corsOptions));

const client = new Client({ intents: 4097 });
module.exports = app;

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