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

let game: ClientGame;

let socket = io.connect(`http://${document.location.hostname}:${document.location.port}`, { "forceNew": true });
game = new ClientGame(socket);

socket.on("restart", function () {
    location.reload(true);
});

socket.on("players", function (plys: Player[]) {
    game.players = plys;
    game.renderPlayers();
});

socket.on("update-player", function (ply: Player) {
    game.updatePlayer(ply);
});

socket.on("show-message", function (message: string) {
    alert(message);
});

socket.on("show-notification", function (notification: UnoNotification) {
    game.ui.showNotification(notification);
});

socket.on("start-game", function (player: Player, currentCard: Card, currentColor: Color, direction: boolean, round: number) {
    game.startGame(player, currentCard, currentColor, direction, round);
    game.setStage(3);
});

socket.on("set-current-player", function (current: Player) {
    game.setCurrentPlayer(current);
});

socket.on("set-direction", function (dir: boolean) {
    game.setDirection(dir);
});

socket.on("set-current-card", function (card: Card, player: Player) {
    game.setCurrentCard(card, player);
});

socket.on("set-current-color", function (color: Color, player: Player) {
    game.setCurrentColor(color, player);
});

socket.on("add-cards", function(cards: Card[], fault: string) {
    game.addCards(cards, fault);
});

socket.on("update-card-count", function (counts: number[]) {
    game.cardCounts = counts;
    game.renderCardCounts();
});

socket.on("game-already-started", function () {
    let notif: UnoNotification = {
        title: "Partida iniciada",
        message: `No puedes entrar porque la partida ya inició`,
        type: NotificationTypes.Error,
        position: NotifPositions.TopCenter
    };

    game.ui.showNotification(notif);
});

socket.on("end-game", function (winner: Player) {
    if (game.player.id == winner.id) {
        $("#img-win-lose").attr("src", "img/win.png");
        $("#winner-player").text(`Ganaste con ${winner.points} puntos`);
    } else {
        $("#img-win-lose").attr("src", "img/lose.png");
        $("#winner-player").text(`${winner.name} ganó con ${winner.points} puntos`);
    }
    game.setStage(4);
});

socket.on("end-round", function (winner: Player, winPoints: number) {
    game.nameEditable = false;
    game.ui.showRoundEndModal(winner, winPoints);
});

socket.on("logged-out", function (ply: Player) {
    game.loggedOut(ply);
});

$(function() {
    game.ui.configure();
    game.ui.clickEvents();
    game.setStage(1);
});

