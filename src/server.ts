

import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as path from "path";
import * as dotenv from "dotenv";
import {Player} from "./models/Player";
import {Deck} from "./models/Deck";
import {Card, CardType} from "./models/Card";
import {Color} from "./models/Color";
import {NumericCard} from "./models/NumericCard";
import {Utils} from "./models/Utils";
import {NotificationTypes, NotifPositions, UnoNotification} from "./models/Notification";

dotenv.config({ path: ".env" });

const app = express();
const server = new http.Server(app);
const io = socketio(server);

app.set("port", process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")/*, { maxAge: 31557600000 }*/));

const minPlayers = 2;
const maxPlayers = 4;
const initialCards = 7;

let players: Player[] = [];
let currentPlayer: Player = null;
let winner: Player = null;
let deck: Deck = null;
let auxDeck: Deck = null;
let currentCard: Card = null;
let currentColor: Color = null;
let direction: boolean;
let sockets: Array<SocketIO.Socket> = [];

io.on("connection", function(socket) {
    console.log("A new player has connected");

    socket.on("restart", function () {
        players = [];
        sockets = [];
        io.sockets.emit("restart");
    });

    socket.on("new-player", function (player: Player) {
        console.log("New player: ", player);
        players.push(new Player(player.id, player.name));
        sockets[player.id] = socket;
        io.sockets.emit("players", players);
    });

    socket.on("update-player", function (player: Player) {
        players.forEach(p => {
            if (p.id == player.id) {
                p.name = player.name;
                return false;
            }
        });
        io.sockets.emit("update-player", player);
    });

    socket.on("start", function () {
        if (sockets[players[0].id] !== socket) {
            let notif: UnoNotification = {
                title: "No se pudo iniciar el juego",
                message: `Solo el primer jugador puede iniciar el juego`,
                type: NotificationTypes.Error,
                position: NotifPositions.TopCenter
            };
            socket.emit("show-notification", notif);

        } else if (players.length < minPlayers) {
            let notif: UnoNotification = {
                title: "No se pudo iniciar el juego",
                message: `No hay suficientes jugadores. Mínimo ${minPlayers} jugadores`,
                type: NotificationTypes.Error,
                position: NotifPositions.TopCenter
            };
            socket.emit("show-notification", notif);

        } else if (players.length > maxPlayers) {
            let notif: UnoNotification = {
                title: "No se pudo iniciar el juego",
                message: `Hay demasiados jugadores. Máximo ${maxPlayers} jugadores`,
                type: NotificationTypes.Error,
                position: NotifPositions.TopCenter
            };
            socket.emit("show-notification", notif);

        } else {
            deck = new Deck();
            deck.fill();
            deck.suffle();
            auxDeck = new Deck();
            let i = 0;
            do {
                if (currentCard != null) {
                    deck.putFirst(currentCard);
                }
                currentCard = deck.pop();
                currentColor = currentCard.color;
            } while (currentCard.type != CardType.Numeric);

            currentPlayer = players[0];
            winner = null;
            direction = true;
            players.forEach(p => {
                p.addArray(deck.popAmount(initialCards));
                sockets[p.id].emit("start-game", p, currentCard, currentColor, direction);
            });
        }
    });

    socket.on("ready", function () {
        socket.emit("update-card-count", Utils.getCardCount(players));
        socket.emit("set-current-player", currentPlayer);
    });

    socket.on("select-card", function (card: Card) {
        auxDeck.push(currentCard);
        currentCard = Utils.createCard(card);
        let index = 0;
        currentPlayer.cards.forEach((c, i) => {
            if (Utils.compareCard(c, currentCard)) {
                index = i;
                return false;
            }
        });

        currentPlayer.cards.splice(index, 1);

        io.sockets.emit("set-current-card", currentCard, currentPlayer);
        socket.emit("update-player", currentPlayer);
        io.sockets.emit("update-card-count", Utils.getCardCount(players));

        if (currentCard.type == CardType.PlusFour || currentCard.type == CardType.PlusTwo) {
            let amount = 2;
            if (currentCard.type == CardType.PlusFour) {
                amount = 4;
            }

            let cards = deck.popAmount(amount);
            let player = getNextPlayer(false);
            player.addArray(cards);
            sockets[player.id].emit("add-cards", cards);
            io.sockets.emit("update-card-count", Utils.getCardCount(players));

            let notif: UnoNotification = {
                title: "Alguien tiene nuevas cartas",
                message: `${player.name} tiene ${amount} nuevas cartas`,
                type: NotificationTypes.Info,
                position: NotifPositions.BottomLeft
            };

            players.forEach(p => {
                if (p.id != player.id) {
                    sockets[p.id].emit("show-notification", notif);
                }
            });
        }

        if (currentCard.type != CardType.ColorChange && currentCard.type != CardType.PlusFour) {
            if (currentColor.code != currentCard.color.code) {
                currentColor = currentCard.color;
                io.sockets.emit("set-current-color", currentColor, currentPlayer);
            }

            if (currentCard.type == CardType.Return) {
                direction = !direction;
                io.sockets.emit("set-direction", direction);
            }

            currentPlayer = getNextPlayer(true);
            io.sockets.emit("set-current-player", currentPlayer);
        }
    });

    socket.on("select-color", function (color: Color) {
        currentColor = color;
        io.sockets.emit("set-current-color", currentColor, currentPlayer);
    });

    socket.on("turn-ended", function (player: Player) {
        currentPlayer = getNextPlayer(false);
        io.sockets.emit("set-current-player", currentPlayer);
    });

    socket.on("pick-from-deck", function (player: Player) {
        let card = deck.pop();
        players.forEach(p => {
            if (p.id == player.id) {
                p.add(card);
                return false;
            }
        });
        sockets[player.id].emit("add-cards", [ card]);

        let notif: UnoNotification = {
            title: "Carta del mazo",
            message: `${player.name} tomó una carta del mazo`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        players.forEach(p => {
            if (p.id != player.id) {
                sockets[p.id].emit("show-notification", notif);
            }
        });
    });
});

server.listen(app.get("port"), function() {
    console.log("Server running at http://localhost:" + app.get("port"));
});

function getNextPlayer(shouldSkip: boolean): Player {
    let dif = 1;
    if (currentCard.type == CardType.Skip && shouldSkip) {
        dif = 2;
    }

    if (!direction) {
        dif = -dif;
    }

    let index = players.indexOf(currentPlayer);
    let newIndex = index + dif;

    if (newIndex < 0) {
        newIndex += players.length;
    }

    if (newIndex >= players.length) {
        newIndex -= players.length;
    }

    return players[newIndex];
}