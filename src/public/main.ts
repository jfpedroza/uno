/// <reference path="../../node_modules/@types/jquery/index.d.ts" />
/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />

import Socket = SocketIOClient.Socket;
import {Player} from "../models/Player";
import {Card, CardType} from "../models/Card";
import {Color, Colors} from "../models/Color";
import {NumericCard} from "../models/NumericCard";
import {Utils} from "../models/Utils";
import {NotificationTypes, NotifPositions, UnoNotification} from "../models/Notification";

let socket: Socket;
let stage = 1;
let player: Player = null;
let players: Player[] = [];
let currentPlayer: Player = null;
let currentCard: Card = null;
let currentColor: Color = null;
let direction: boolean;
const pageSize = 7;
let page = 1;
let choosenColor: Color = null;
let cardCounts: any;
let nameEditable = true;
let round = 1;

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
        p.points = ply.points;
    } else {
        console.error("P is NULL");
    }

    if (player != null && player.id == p.id) {
        player = p;
        player.cards = Utils.createCards(ply.cards);
    }

    if ((player != null && player.id != ply.id) || stage > 2) {
        updatePlayer(p, true);
    }
});

socket.on("show-message", function (message: string) {
    alert(message);
});

socket.on("show-notification", function (notification: UnoNotification) {
    showNotification(notification);
});

socket.on("start-game", function (ply: Player, cCard: Card, cColor: Color, dir: boolean, r: number) {
    player = ply;
    player.cards = Utils.createCards(ply.cards);
    currentCard = Utils.createCard(cCard);
    currentColor = cColor;
    direction = dir;
    setRound(r);
    setStage(3);
});

socket.on("set-current-player", function (current: Player) {
    setCurrentPlayer(current);
    let notif: UnoNotification = {
        title: "Cambio de turno",
        message: currentPlayer.id == player.id ? "Es tu turno" : `<b>${currentPlayer.name}</b> tiene el turno`,
        type: currentPlayer.id == player.id ? NotificationTypes.Success : NotificationTypes.Info,
        position: NotifPositions.BottomLeft
    };

    showNotification(notif);
});

socket.on("set-direction", function (dir: boolean) {
    direction = dir;
    renderDirection();
});

socket.on("set-current-card", function (card: Card, ply: Player) {
    setCurrentCard(Utils.createCard(card));

    if (ply.id != player.id) {

        let notif: UnoNotification = {
            title: "Se puso una carta",
            message: `<b>${currentPlayer.name}</b> puso ${currentCard.getName()}`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        showNotification(notif);
    }
});

socket.on("set-current-color", function (color: Color, ply: Player) {
    currentColor = color;
    setCurrentColor();

    if (ply.id != player.id) {

        let notif: UnoNotification = {
            title: "Cambio de color",
            message: `<b>${currentPlayer.name}</b> puso el color en ${color.name}`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        showNotification(notif);
    }

});

socket.on("add-cards", function(cards: Card[], fault: string) {
    cards = Utils.createCards(cards);
    player.cards.push(... cards);
    showNewCardsModal(cards, fault);
    renderCards();
    validateCards();

    if (currentPlayer.id == player.id && cards.length == 1) {
        if (!validateCard(cards[0])) {
            socket.emit("turn-ended", player);
        }
    }
});

socket.on("update-card-count", function (counts: number[]) {
    cardCounts = counts;
    renderCardCounts();
});

socket.on("game-already-started", function () {
    let notif: UnoNotification = {
        title: "Partida iniciada",
        message: `No puedes entrar porque la partida ya inició`,
        type: NotificationTypes.Error,
        position: NotifPositions.TopCenter
    };

    showNotification(notif);
});

socket.on("end-game", function (winner: Player) {
    if (player.id == winner.id) {
        $("#img-win-lose").attr("src", "img/win.png");
        $("#winner-player").text(`Ganaste con ${winner.points} puntos`);
    } else {
        $("#img-win-lose").attr("src", "img/lose.png");
        $("#winner-player").text(`${winner.name} ganó con ${winner.points} puntos`);
    }
    setStage(4);
});

socket.on("end-round", function (winner: Player, winPoints: number) {
    nameEditable = false;
    showRoundEndModal(winner, winPoints);
});

socket.on("logged-out", function (ply: Player) {
    ply = getPlayer(ply.id);
    let notif: UnoNotification = {
        title: "Cierre de sesión",
        message: `<b>${ply.name}</b> cerró sesión`,
        type: NotificationTypes.Info,
        position: NotifPositions.BottomLeft
    };

    showNotification(notif);
    players.slice(players.indexOf(ply), 1);
    renderPlayers();
});

$(function() {
    configureChooseColorModal();
    configureRoundEndModal();
    configureToastr();
    btnRestartClick();
    btnLogoutClick();
    btnEnterClick();
    btnSetClick();
    btnStartClick();
    btnPaginateLeftClick();
    btnPaginateRightClick();
    btnPutCardClick();
    selectColorClick();
    btnPickFromDeckClick();
    btnUnoClick();
    btnNoClick();
    setStage(1);
});

function btnRestartClick() {
    $("#restart-btn").click(function(e) {
        e.preventDefault();
        restart();
    });
}

function btnLogoutClick() {
    $("#log-out-btn").click(function(e) {
        e.preventDefault();
        logout();
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

function btnPaginateLeftClick() {
    $("#paginate-left img").click(function () {
        if (!$("#paginate-left").hasClass("disabled")) {
            setPage(page - 1);
        }
    });
}

function btnPaginateRightClick() {
    $("#paginate-right img").click(function () {
        if (!$("#paginate-right").hasClass("disabled")) {
            setPage(page + 1);
        }
    });
}

function btnPutCardClick() {
    $("#my-cards").on("click", ".put-card-btn", function (e) {
        e.preventDefault();
        let id = $(this).closest("div").attr("id");
        let cardIndex = parseInt(id.substr(5));
        let card = player.cards[cardIndex];

        socket.emit("select-card", card);

        if (card.type == CardType.PlusFour || card.type == CardType.ColorChange) {
            openChooseColorModal();
        }
    });
}

function selectColorClick() {
    $(".choose-color").click(function () {
        $("#choose-color-" + choosenColor.codeName).html("");
        let id = $(this).attr("id");
        let color = id.substr(13);
        switch (color) {
            case "blue":
                choosenColor = Colors.BLUE;
                break;
            case "green":
                choosenColor = Colors.GREEN;
                break;
            case "red":
                choosenColor = Colors.RED;
                break;
            case "yellow":
                choosenColor = Colors.YELLOW;
                break;
        }

        $("#choose-color-" + choosenColor.codeName).html("<h2>Seleccionado</h2>");
    });
}

function btnPickFromDeckClick() {
    $("#deck .put-card-btn").click(function (e) {
        e.preventDefault();
        socket.emit("pick-from-deck", player);
    });
}

function btnUnoClick() {
    $("#uno-btn").click(function () {
        socket.emit("say-uno", player);
    });
}

function btnNoClick() {
    $("#no-btn").click(function () {
        socket.emit("didnt-say-uno", player);
    });
}

function setStage(s: number) {
    $("#stage-" + stage).hide(1000);
    stage = s;
    $("#stage-" + stage).show(1000, onStageChange);
    if (stage > 1) {
        $("#round").show();
        $("#log-out-btn").show();
    } else {
        $("#round").hide();
        $("#log-out-btn").hide();
    }
}

function onStageChange() {
    if (stage == 2) {
        renderPlayers();
        socket.emit("stage-2-ready", player);
    }
    else if (stage == 3) {
        setCurrentCard(currentCard);
        setCurrentColor();
        renderPlayers();
        renderCards();
        renderDirection();

        socket.emit("stage-3-ready");
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

            if (player.id == p.id && nameEditable) {
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
                $("#my-player").html(`
                            <h3 class="player-name">${p.name}</h3>
                            <h6>Cartas: <span class="player-card-number">0</span></h6>
                            <h6>Puntos: <span class="player-points">${p.points}</span></h6>`);
            } else {
                plys.append(`<div class="player" id="player-${p.id}">
                            <h3 class="player-name">${p.name}</h3>
                            <h6>Cartas: <span class="player-card-number">0</span></h6>
                            <h6>Puntos: <span class="player-points">${p.points}</span></h6>
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
            animateNumber($(`${id} .player-points`), p.points, 300);
        } else {
            $(`${id} .player-points`).html(`${p.points}`);
        }

        if (player.id == p.id) {
            renderCards();
            validateCards();
        }
    }
}

function setCurrentColor() {

    $("#current-color").removeClass("red green blue yellow")
        .addClass(currentColor.codeName);
}

function renderCards() {
    $(".card-uno").remove();
    let cards = $("#my-cards");
    player.cards.forEach((c, i) => {
        cards.append(`<div class="card-uno" id="card-${i}">
                            <img class="image" src="img/${c.getImageName()}" height="150"/>
                            <a href="#" class="put-card-btn"><img src="img/check.png"/></a>
                        </div>`);
    });

    setPage(1);
}

function setCurrentPlayer(current: Player) {
    if (currentPlayer != null) {
        if (currentPlayer.id == player.id) {
            $(`#my-player`).removeClass("active");
        } else {
            $(`#player-${currentPlayer.id}`).removeClass("active");
        }
    }
    currentPlayer = current;
    if (currentPlayer.id == player.id) {
        $(`#my-player`).addClass("active");
    } else {
        $(`#player-${currentPlayer.id}`).addClass("active");
    }

    validateCards();
}

function renderDirection() {
    let code = direction ? "cw" : "acw";
    $("#arrow-left").attr("src", `img/arrow-${code}-left.png`);
    $("#arrow-right").attr("src", `img/arrow-${code}-right.png`);
}

function setCurrentCard(card: Card) {
    if (currentCard !== card) {
        currentCard = card;
    }

    $("#current-card").attr("src", "img/" + currentCard.getImageName());
}

function setPage(p: number) {
    $(".card-uno").removeClass("visible");
    page = p;
    for (let i = (page - 1) * pageSize; i < page * pageSize; i++) {
        if (i < player.cards.length) {
            $(`#card-${i}`).addClass("visible");
        }
    }

    if (page == 1) {
        $("#paginate-left").addClass("disabled");
    } else {
        $("#paginate-left").removeClass("disabled");
    }

    if (page * pageSize < player.cards.length) {
        $("#paginate-right").removeClass("disabled");
    } else {
        $("#paginate-right").addClass("disabled");
    }
}

function setRound(r: number) {
    round = r;
    $("#round").html(`Round: ${round}`);
}

function validateCard(card: Card): boolean {
    if (card.type == currentCard.type) {
        if (currentCard.type == CardType.Numeric) {
            if (card.color.code == currentColor.code) {
                return true;
            } else {
                return (card as NumericCard).num == (currentCard as NumericCard).num;
            }
        } else {
            return true;
        }
    } else if (card.type == CardType.PlusFour || card.type == CardType.ColorChange) {
        return true;
    } else {
        return card.color.code == currentColor.code;
    }
}

function validateCards() {
    if (currentPlayer.id == player.id) {
        player.cards.forEach((c, i) => {
            if (validateCard(c)) {
                $(`#card-${i}`).addClass("valid");
            } else {
                $(`#card-${i}`).removeClass("valid");
            }
        });
    } else {
        $(".card-uno").removeClass("valid");
    }
}

function renderCardCounts() {
    players.forEach(p => {
        let id = `#player-${p.id}`;
        if (player.id == p.id) {
            id = "#my-player";
        }

        animateNumber($(`${id} .player-card-number`), cardCounts[p.id], 300);
    });
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

function openChooseColorModal() {
    choosenColor = currentColor;
    $("#choose-color-" + choosenColor.codeName).html("<h2>Seleccionado</h2>");
    $("#choose-color-modal").modal("show");
}

function configureChooseColorModal() {

    let modal = $("#choose-color-modal");
    modal.modal({
        backdrop: true,
        keyboard: false,
        show: false
    });

    modal.on("hide.bs.modal", function () {
        $("#choose-color-" + choosenColor.codeName).html("");
        socket.emit("select-color", choosenColor);
        socket.emit("turn-ended", player);
    });
}

function showNewCardsModal(cards: Card[], fault: string) {
    let modal = $("#new-cards-modal");
    let content = $("#new-card-content");
    content.html("");

    if (fault) {
        content.append(`<div class="row"><h4>Pena: ${fault}</h4></div>`);
    }

    let row: JQuery;

    cards.forEach((card, i) => {
        if (i % 2 == 0) {
            row = $("<div class='row'></div>");
            row.appendTo(content);
        }

        row.append(`<div class="col">
                        <img src="img/${card.getImageName()}"/>
                    </div>`);
    });

    modal.modal({
        backdrop: false,
        keyboard: true,
        show: true
    });
}

function showRoundEndModal(winner: Player, winPoints: number) {
    let modal = $("#round-end-modal");
    let content = $("#round-end-content");

    if (winner.id == player.id) {
        content.html(`<h3>Ganaste la ronda</h3><h5>${winner.points} puntos</h5>`);
    } else {
        content.html(`<h3>${winner.name} ganó la ronda</h3><h5>${winPoints} puntos</h5>`);
    }

    modal.modal("show");
}

function configureRoundEndModal() {
    let modal = $("#round-end-modal");
    modal.modal({
        backdrop: false,
        keyboard: true,
        show: false
    });

    modal.on("hide.bs.modal", function () {
        setStage(2);
        setRound(round + 1);
    });
}

function logout() {
    socket.emit("log-out", player);
    location.reload(true);
}

function showNotification(notification: UnoNotification) {
    if (notification.position == null) {
        notification.position = NotifPositions.TopRight;
    }

    toastr.options.positionClass = "toast-" + notification.position.name;
    if (notification.title != null) {
        toastr[notification.type.name](notification.message, notification.title);
    } else {
        toastr[notification.type.name](notification.message);
    }
}

function configureToastr() {

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": 300,
        "hideDuration": 1000,
        "timeOut": 3000,
        "extendedTimeOut": 1000,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
}