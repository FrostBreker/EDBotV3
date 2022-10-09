const { Client, Collection } = require("discord.js");
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const express = require('express');
const cors = require("cors");
const fs = require("fs");

const getDateTime = () => {
    let date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;
}

fs.writeFile(`logs/${getDateTime()}.txt`, '', (err) => { })

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
client.mongoose.init(client.timestampParser(), client);
//Handler and Commands
client.commands = new Collection();
['EventUtil', "CommandUtil"].forEach(handler => { require(`./utils/handlers/${handler}`)(client) });

//Check error
process.on("exit", code => {
    client.logger(`Le processus s'est arrêté avec le code: ${code}!`);
});
process.on("uncaughtException", (err, origin) => {
    client.logger(`uncaughtException: ${err}`, `Origine: ${origin}`);
    console.log(`uncaughtException: ${err}`, `Origine: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
    client.logger(`UNHANDLED_REJECTION: ${reason}\n--------\n\n${promise}`);
    console.log(`UNHANDLED_REJECTION: ${reason}\n--------`, promise);
});
process.on("warning", (...args) => {
    client.logger(...args);
    console.log(...args);
});

//Login
client.login(TOKEN);