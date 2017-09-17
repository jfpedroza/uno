/**
 * Punto de entrada del servidor, escucha todos los mensajes de los clientes.
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import * as express from "express";
import * as http from "http";
import * as socketio from "socket.io";
import * as path from "path";
import * as dotenv from "dotenv";
import {Player} from "./models/Player";
import {Card} from "./models/Card";
import {Color} from "./models/Color";
import {ServerGame} from "./ServerGame";

dotenv.config({ path: ".env" });

const app = express();
const server = new http.Server(app);
const io = socketio(server);

app.set("port", process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, "public")/*, { maxAge: 31557600000 }*/));

let game = new ServerGame(io);

io.on("connection", (socket) => {
    console.log("A new client has connected");

    socket.on("restart", () => {
        game = new ServerGame(io);
        game.emitAll("restart");
    });

    socket.on("new-player", (player: Player) => {
        if (game.newPlayer(player, socket)) {
            game.emitAll("players", game.players);
        } else {
            socket.emit("game-already-started");
        }
    });

    socket.on("update-player", (player: Player) => {
        game.updatePlayer(player);
    });

    socket.on("start", (player: Player) => {
        game.start(player);
    });

    socket.on("stage-ready", (player: Player, stage: number) => {
        game.stageReady(player, stage);
    });

    socket.on("select-card", (card: Card) => {
        game.selectCard(card);
    });

    socket.on("select-color", (color: Color) => {
        game.selectColor(color);
    });

    socket.on("turn-ended", (player: Player) => {
        game.turnEnded(player);
    });

    socket.on("pick-from-deck", (player: Player) => {
        game.pickFromDeck(player);
    });

    socket.on("say-uno", (player: Player) => {
        game.sayUno(player);
    });

    socket.on("didnt-say-uno", (player: Player) => {
        game.didntSayUno(player);
    });

    socket.on("log-out", (player: Player) => {
        game.logOut(player);
    });
});

server.listen(app.get("port"), () => {
    console.log("Server running at http://localhost:" + app.get("port"));
});