

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
                p.cards = player.cards;
                return false;
            }
        });
        io.sockets.emit("update-player", player);
    });

    socket.on("start", function () {
        if (sockets[players[0].id] !== socket) {
            socket.emit("show-message", `Solo el primer jugador puede iniciar el juego`);
        } else if (players.length < minPlayers) {
            socket.emit("show-message", `No hay suficientes jugadores. Mínimo ${minPlayers} jugadores`);
        } else if (players.length > maxPlayers) {
            socket.emit("show-message", `Hay demasiados jugadores. Máximo ${maxPlayers} jugadores`);
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

        socket.emit("set-current-player", currentPlayer);
    });
});

server.listen(app.get("port"), function() {
    console.log("Server running at http://localhost:" + app.get("port"));
});