

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
let gameStarted = false;
let round = 1;

io.on("connection", function(socket) {
    console.log("A new client has connected");

    socket.on("restart", function () {
        players = [];
        sockets = [];
        gameStarted = false;
        round = 1;
        winner = null;
        io.sockets.emit("restart");
    });

    socket.on("new-player", function (player: Player) {
        if (!gameStarted) {
            console.log(`New player ID: ${player.id}`);
            players.push(new Player(player.id, player.name));
            sockets[player.id] = socket;
            io.sockets.emit("players", players);
        } else {
            socket.emit("game-already-started");
        }
    });

    socket.on("update-player", function (player: Player) {
        getPlayer(player.id).name = player.name;
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

        } else if (players.some(p => !p.ready)) {
            let notif: UnoNotification = {
                title: "No se pudo iniciar el juego",
                message: `No todos los jugadores están listos`,
                type: NotificationTypes.Error,
                position: NotifPositions.TopCenter
            };
            socket.emit("show-notification", notif);

        } else {
            gameStarted = true;
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
            direction = true;
            players.forEach(p => {
                p.cards = [];
                p.addArray(deck.popAmount(initialCards));
                sockets[p.id].emit("start-game", p, currentCard, currentColor, direction, round);
            });
        }
    });

    socket.on("stage-3-ready", function () {
        socket.emit("update-card-count", Utils.getCardCount(players));
        socket.emit("set-current-player", currentPlayer);
        if (winner != null) {
            socket.emit("update-player", winner);
        }
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

        if (currentPlayer.cards.length > 5) {

            if (currentCard.type == CardType.PlusFour || currentCard.type == CardType.PlusTwo) {
                let amount = 2;
                if (currentCard.type == CardType.PlusFour) {
                    amount = 4;
                }

                let cards = getCardsFromDeck(amount);
                let player = getNextPlayer(false);
                player.addArray(cards);
                sockets[player.id].emit("add-cards", cards);
                io.sockets.emit("update-card-count", Utils.getCardCount(players));

                let notif: UnoNotification = {
                    title: "Alguien tiene nuevas cartas",
                    message: `<b>${player.name}</b> tiene ${amount} nuevas cartas`,
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
        } else {
            winner = currentPlayer;
            let newPoints = 0;
            players.forEach(p => {
                if (p.id != winner.id) {
                    let points = winner.points;
                    let cardPoints = p.getCardPoints();
                    newPoints += p.getCardPoints();
                }
            });

            winner.points += newPoints;

            if (winner.points >= 500) {
                io.sockets.emit("end-game", winner);
            } else {
                round++;
                unreadyPlayers();
                io.sockets.emit("end-round", winner, newPoints);
            }
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
        let card = getCardFromDeck();
        getPlayer(player.id).add(card);
        sockets[player.id].emit("add-cards", [ card]);
        io.sockets.emit("update-card-count", Utils.getCardCount(players));

        let notif: UnoNotification = {
            title: "Carta del mazo",
            message: `<b>${player.name}</b> tomó una carta del mazo`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        players.forEach(p => {
            if (p.id != player.id) {
                sockets[p.id].emit("show-notification", notif);
            }
        });
    });

    socket.on("say-uno", function (player: Player) {
        player = getPlayer(player.id);

        let notif: UnoNotification = {
            title: "Alguien dijo uno",
            message: `<b>${player.name}</b> dijo uno`,
            type: NotificationTypes.Warning,
            position: NotifPositions.BottomLeft
        };

        if (player.cards.length > 1) {
            let cards = getCardsFromDeck(2);
            player.addArray(cards);
            socket.emit("add-cards", cards, "no tienes solo una carta");
            io.sockets.emit("update-card-count", Utils.getCardCount(players));
            notif.message += ". Fue penalizado por no tener solo una carta.";
        } else {
            player.saidUno = true;
        }

        players.forEach(p => {
            if (p.id != player.id) {
                sockets[p.id].emit("show-notification", notif);
            }
        });
    });

    socket.on("didnt-say-uno", function (player: Player) {
        player = getPlayer(player.id);
        let fault = true;
        players.forEach(p => {
           if (p.cards.length == 1 && !p.saidUno) {
               fault = false;
               didntSayUno(p);
               return false;
           }
        });

        if (fault) {
            let cards = getCardsFromDeck(2);
            player.addArray(cards);
            socket.emit("add-cards", cards, "no hay nadie sin decir uno");
            io.sockets.emit("update-card-count", Utils.getCardCount(players));

            let notif: UnoNotification = {
                title: "Alguien tiene nuevas cartas",
                message: `<b>${player.name}</b> tiene 2 nuevas cartas porque no hay nadie sin decir uno`,
                type: NotificationTypes.Info,
                position: NotifPositions.BottomLeft
            };

            players.forEach(p => {
                if (p.id != player.id) {
                    sockets[p.id].emit("show-notification", notif);
                }
            });
        }
    });

    socket.on("stage-2-ready", function (player: Player) {
        player = getPlayer(player.id);
        player.ready = true;
    });

    socket.on("log-out", function (player: Player) {
        player = getPlayer(player.id);

        let next = getNextPlayer(false);
        players.splice(players.indexOf(player), 1);

        if (players.length > 1) {
            sockets[player.id].disconnect(true);
            players.forEach(p => {
                sockets[p.id].emit("logged-out", player);
                sockets[p.id].emit("update-card-count", Utils.getCardCount(players));
            });

            if (player.id == currentPlayer.id) {
                currentPlayer = next;
                io.sockets.emit("set-current-player", currentPlayer);
            }
        } else {
            winner = players[0];
            io.sockets.emit("end-game", winner);
        }
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

function getPlayer(id: number): Player {
    const result = players.filter(p => p.id == id);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function getCardFromDeck(): Card {
    if (deck.size == 0) {
        deck = auxDeck;
        deck.suffle();
        auxDeck = new Deck();
    }

    return deck.pop();
}

function getCardsFromDeck(amount: number): Card[] {

    if (deck.size < amount) {
        let rem = amount - deck.size;
        let cards = deck.popAmount(deck.size);
        deck = auxDeck;
        deck.suffle();
        auxDeck = new Deck();
        cards.push(... deck.popAmount(rem));
    } else {
        return deck.popAmount(amount);
    }
}

function didntSayUno(player: Player) {
    let cards = getCardsFromDeck(2);
    player.addArray(cards);
    sockets[player.id].emit("add-cards", cards, "no dijiste uno");
    io.sockets.emit("update-card-count", Utils.getCardCount(players));

    let notif: UnoNotification = {
        title: "Alguien tiene nuevas cartas",
        message: `<b>${player.name}</b> tiene 2 nuevas cartas por no decir uno`,
        type: NotificationTypes.Info,
        position: NotifPositions.BottomLeft
    };

    players.forEach(p => {
        if (p.id != player.id) {
            sockets[p.id].emit("show-notification", notif);
        }
    });
}

function unreadyPlayers() {
    players.forEach(p => p.ready = false);
}