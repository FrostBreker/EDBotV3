const { MessageEmbed } = require("discord.js");
const { baseImageURI } = require("../config");

module.exports = {
    auth: () => {
        const embed = new MessageEmbed()
            .setTitle("😒 - Non connecter")
            .setDescription("> Vous n'êtes pas connecté à EcoleDirecte, utilisez un compte `ELEVE`.")
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: baseImageURI })
            .setImage("https://i.ibb.co/Q8whNGn/Conexion.gif")
            .addFields(
                { name: '\u200B', value: "**https://ecoledirectebot.xyz/profil.html**" }
            )
            .setTimestamp()
            .setColor(430591)
        return embed;
    },
    noHomework: () => {
        const embed = new MessageEmbed()
            .setTitle("> 🎉🎉** Rien pour ajourd'hui ** 🎉🎉")
            .setDescription("Profiter, vous n'avez aucun travail aujourd'hui n'hésitez pas à vous avancer !")
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: baseImageURI })
            .setImage("https://tenor.com/SuTp.gif")
            .setTimestamp()
            .setColor(430591)

        return embed;
    },
    wrongV: () => {
        const embed = new MessageEmbed()
            .setTitle("> ⚠️ Mauvaise version ⚠️")
            .setDescription("**Les commandes avec préfix ne sont plus disponibles ! Utiliser les `slashs commands` si elle ne sont pas disponible contactez un administrateur pour qu'il réinvite le BOT en cliquant sur le bouton ci-dessous.**")
            .setFooter({ text: 'Ⓒ EcoleDirecteBOT | 🌐', iconURL: baseImageURI })
            .setTimestamp()
            .setColor(430591)

        return embed;
    }
}