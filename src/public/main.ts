/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />

import Socket = SocketIOClient.Socket;
import {Player} from "../models/Player";
import {Card, CardType} from "../models/Card";
import {Color} from "../models/Color";
import {NumericCard} from "../models/NumericCard";
import {ColorChangeCard} from "../models/ColorChangeCard";
import {PlusFourCard} from "../models/PlusFourCard";
import {PlusTwoCard} from "../models/PlusTwoCard";
import {ReturnCard} from "../models/ReturnCard";
import {SkipCard} from "../models/SkipCard";

let player: Player = null;
let players: Player[] = [];
let currentPlayer: Player = null;
let currentCard: Card = null;
let currentColor: Color = null;

let stage = 1;
let socket: Socket;

socket = io.connect(`http://${document.location.hostname}:${document.location.port}`, { "forceNew": true });

socket.on("restart", function () {
    location.reload(true);
});

socket.on("players", function (plys: Player[]) {
    players = plys;
    renderPlayers();
});

socket.on("update-player", function (ply: Player) {
    let p = getPlayer(ply.id);
    if (p != null) {
        p.name = ply.name;
        p.cards = createCards(ply.cards);
        p.points = ply.points;
    }

    console.log(player == null ? "Player is null" : "Player is not null", ply == null ? "Ply is null" : "Ply is not null");

    if (player.id != ply.id || stage > 2) {
        updatePlayer(ply, true);
    }
});

socket.on("not-enough-players", function (minPlayers: number) {
    alert(`No hay suficientes jugadores. Mínimo ${minPlayers} jugadores`);
});

socket.on("too-many-players", function (maxPlayers: number) {
    alert(`Hay demasiados jugadores. Máximo ${maxPlayers} jugadores`);
});

socket.on("start-game", function (ply: Player, cCard: Card, cColor: Color) {
    player = ply;
    player.cards = createCards(ply.cards);
    currentCard = createCard(cCard);
    currentColor = cColor;
    setStage(3);
});

$(function() {
    btnRestartClick();
    btnEnterClick();
    btnSetClick();
    btnStartClick();
    setStage(1);
});

function btnRestartClick() {
    $("#restart-btn").click(function(e) {
        e.preventDefault();
        restart();
    });
}

function btnEnterClick() {
    $("#btn-enter").click(function(e) {
        player = new Player(new Date().getTime(), "New Player");
        socket.emit("new-player", player);
        setStage(2);
    });
}

function btnSetClick() {
    $("#player-table").on('click', '#btn-set', () => {
        player.name = <string>$("#player-name").val();
        socket.emit("update-player", player);
    });
}

function btnStartClick() {
    $("#btn-start").click(function(e) {
        socket.emit("start");
    });
}

function setStage(s: number) {
    $("#stage-" + stage).hide(1000);
    stage = s;
    $("#stage-" + stage).show(1000, onStageChange);
}

function onStageChange() {
    if (stage == 3) {
        $("#current-card img").attr("src", "img/" + currentCard.getImageName());
        setCurrentColor();
        renderPlayers();
        renderCards();

        socket.emit("ready");
    }
}

function restart() {
    socket.emit("restart");
}

function getPlayer(id: number): Player {
    const result = players.filter(p => p.id == id);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function renderPlayers() {
    if (stage == 2) {
        const table = $("#player-table tbody");
        table.html("");
        players.forEach(p => {

            if (player.id == p.id) {
                table.append(`<tr id="player-stg2-${p.id}">
                                <td><input value="${p.name}" class="input" id="player-name" autofocus></td>
                                <td><button class="button" id="btn-set">Set</button></td>
                              </tr>`);
            } else {
                table.append(`<tr id="player-stg2-${p.id}"><td>${p.name}</td></tr>`);
            }
        });
    } else if (stage == 3) {
        $(".player").remove();
        let plys = $(".players");
        players.forEach(p => {
            if (player.id == p.id) {
                $("#my-player").html(`<h5>${p.name}</h5><h3>${p.points}</h3>`);
            } else {
                plys.append(`<div class="player" id="player-${p.id}">
                            <h5>${p.name}</h5>
                            <h3>${p.points}</h3>
                        </div>`);
            }
        });
    }
}

function updatePlayer(p: Player, animate: boolean) {
    if (stage == 2) {
        $(`#player-stg2-${p.id}`).html(`<td>${p.name}</td>`);
    } else if (stage == 3) {
        let id = `#player-${p.id}`;
        if (player.id == p.id) {
            id = "#my-player";
        }
        if (animate) {
            animateNumber($(`${id} h3`), p.points, 300);
        } else {
            $(`${id}`).html(`<h5>${p.name}</h5><h3>${p.points}</h3>`);
        }
    }
}

function setCurrentColor() {
    let color = "";
    switch (currentColor.code) {
        case "R":
            color = "red";
            break;
        case "V":
            color = "green";
            break;
        case "AZ":
            color = "blue";
            break;
        case "AM":
            color = "yellow";
            break;
        default:
            console.error("Unespected color code: ", currentColor);
            break;
    }

    $("#current-color").removeClass("red green blue yellow")
        .addClass(color);
}

function renderCards() {
    $(".card").remove();
    let cards = $("#my-cards");
    player.cards.forEach((c, i) => {
        cards.append(`<div class="card" id="card-${i}">
                            <img src="img/${c.getImageName()}" width="100"/>
                        </div>`);
    });
}

function createCard(card: Card): Card {
    switch (card.type) {
        case CardType.Numeric:
            return new NumericCard((card as NumericCard).num, card.color);
        case CardType.ColorChange:
            return new ColorChangeCard();
        case CardType.PlusFour:
            return new PlusFourCard();
        case CardType.PlusTwo:
            return new PlusTwoCard(card.color);
        case CardType.Return:
            return new ReturnCard(card.color);
        case CardType.Skip:
            return new SkipCard(card.color);
    }
}

function createCards(cards: Card[]): Card[] {
    return cards.map(card => createCard(card));
}

function animateNumber(el: any, newValue: number, time: number) {
    const value = parseInt(el.text());
    let duration = (newValue - value) * time;
    if (duration < 0) duration = -duration;

    el.prop('Counter', value).animate({
        Counter: newValue
    }, {
        duration: duration,
        easing: 'swing',
        step: function (now: number) {
            el.text(Math.ceil(now));
        }
    });
}