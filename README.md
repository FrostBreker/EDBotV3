# EcoleDirecte BOT V3 !

Le BOT ED est un bot discord open source permettant de lier son compte
EcoleDirecte à Discord. Il est en ligne et peut être invité à cette adresse :
https://ecoledirectebot.xyz/

[![Discord Bots](https://top.gg/api/widget/837639493745246228.svg)(https://top.gg/bot/837639493745246228)
[![CodeQL](https://github.com/FrostBreker/EDBotV3/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/FrostBreker/EDBotV3/actions/workflows/codeql-analysis.yml)

# Instalation pour contribution

Après avoir cloner le répo executer la commande `npm i`. Une foit faire modfier
le fichier `config.js` et ajouter un fichier `.env` Le fichier `.env` dois êtres
sous ce format :

```
TOKEN= //Token du bot
PREFIX= //Prefix (inutile pour la derniere version mais à remmplir)
ALG= //Chiffrement
DBCONECTION= //Adresse de connexion mongodb
PORT=26065
CLIENT_URL=http://localhost:3000
```

Une fois fait il vous suffit d'exécuter la commande `npm run watch` pour lancer
en mode de développement.

### N'oubliez pas que le bot n'est disponible en open source pour les contributions et projet personnel il n'est en aucun cas disponible à des fins commerciales ou au projet visant à nuir au bot en lui même !

## Thanks

Thanks to [@asgarrrr](https://www.npmjs.com/package/@asgarrrr/ecoledirecteapi)
and [a2br](https://www.npmjs.com/package/ecoledirecte.js)
