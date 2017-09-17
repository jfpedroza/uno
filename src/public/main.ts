/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />

/**
 * Punto de entrada del cliente, escucha todos los mensajes del servidor.
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Player} from "../models/Player";
import {Card, CardType} from "../models/Card";
import {Color, Colors} from "../models/Color";
import {NotificationTypes, NotifPositions, UnoNotification} from "../models/Notification";
import {ClientGame} from "./ClientGame";
import {Game} from "../models/Game";
import {UIHelper} from "./UIHelper";

let game: ClientGame;

let socket = io.connect(`http://${document.location.hostname}:${document.location.port}`, { "forceNew": true });
game = new ClientGame(socket);

socket.on("restart", () => {
    location.reload(true);
});

socket.on("players", (plys: Player[]) => {
    game.players = plys;
    game.ui.renderPlayers();
});

socket.on("update-player", (ply: Player) => {
    game.updatePlayer(ply);
});

socket.on("show-message", (message: string) => {
    alert(message);
});

socket.on("show-notification", (notification: UnoNotification) => {
    UIHelper.showNotification(notification);
});

socket.on("start-game", (player: Player, currentCard: Card, currentColor: Color, direction: boolean, round: number) => {
    game.startGame(player, currentCard, currentColor, direction, round);
    game.ui.setStage(3);
});

socket.on("set-current-player", (current: Player) => {
    game.setCurrentPlayer(current);
});

socket.on("set-direction", (dir: boolean) => {
    game.setDirection(dir);
});

socket.on("set-current-card", (card: Card, player: Player) => {
    game.setCurrentCard(card, player);
});

socket.on("set-current-color", (color: Color, player: Player) => {
    game.setCurrentColor(color, player);
});

socket.on("add-cards", (cards: Card[], fault: string) => {
    game.addCards(cards, fault);
});

socket.on("update-card-count", (counts: number[]) => {
    game.cardCounts = counts;
    game.ui.renderCardCounts();
});

socket.on("game-already-started", () => {
    let notif: UnoNotification = {
        title: "Partida iniciada",
        message: `No puedes entrar porque la partida ya inició`,
        type: NotificationTypes.Error,
        position: NotifPositions.TopCenter
    };

    UIHelper.showNotification(notif);
});

socket.on("end-game", (winner: Player) => {
    if (game.player.id == winner.id) {
        $("#img-win-lose").attr("src", "img/win.png");
        $("#winner-player").text(`Ganaste con ${winner.points} puntos`);
    } else {
        $("#img-win-lose").attr("src", "img/lose.png");
        $("#winner-player").text(`${winner.name} ganó con ${winner.points} puntos`);
    }
    game.ui.setStage(4);
});

socket.on("end-round", (winner: Player, winPoints: number) => {
    game.ui.nameEditable = false;
    game.ui.showRoundEndModal(winner, winPoints);
});

socket.on("logged-out", (ply: Player) => {
    game.loggedOut(ply);
});

$(() => {
    game.ui.configure();
    game.ui.clickEvents();
    game.ui.setStage(1);
});

