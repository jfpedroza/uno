/**
 * @author Kevin Serrano <kevinjsa2708@gmail.com>
 */

import {ClientGame} from "./ClientGame";
import {Player} from "../models/Player";
import {NotifPositions, UnoNotification} from "../models/Notification";
import {Card} from "../models/Card";
import {Color, Colors} from "../models/Color";

export class UIHelper {
    game: ClientGame;
    chosenColor: Color;

    public constructor(game: ClientGame) {
        this.game = game;
        this.chosenColor = null;
    }

    public configure() {
        this.configureChooseColorModal();
        this.configureRoundEndModal();
        this.configureToastr();
    }

    public clickEvents() {
        this.btnRestartClick();
        this.btnLogoutClick();
        this.btnEnterClick();
        this.btnSetClick();
        this.btnStartClick();
        this.btnPaginateLeftClick();
        this.btnPaginateRightClick();
        this.btnPutCardClick();
        this.selectColorClick();
        this.btnPickFromDeckClick();
        this.btnUnoClick();
        this.btnNoClick();
    }

    public updatePlayer(p: Player, animate: boolean) {
        if (this.game.stage == 2) {
            if (this.game.player.id != p.id) {
                $(`#player-stg2-${p.id} .player-name`).html(`${p.name}`);
            }

            if (animate) {
                this.animateNumber($(`#player-stg2-${p.id} .player-points`), p.points, 300);
            } else {
                $(`#player-stg2-${p.id} .player-points`).html(`${p.points}`);
            }
        } else if (this.game.stage == 3) {
            let id = `#player-${p.id}`;
            if (this.game.player.id == p.id) {
                id = "#my-player";
            }
            if (animate) {
                this.animateNumber($(`${id} .player-points`), p.points, 300);
            } else {
                $(`${id} .player-points`).html(`${p.points}`);
            }

            if (this.game.player.id == p.id) {
                this.renderCards();
                this.game.validateCards();
            }
        }
    }

    public animateNumber(el: any, newValue: number, time: number) {
        const value = parseInt(el.text());
        let duration = (newValue - value) * time;
        if (duration < 0) duration = -duration;
        if (duration > 2000) duration = 2000;

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

    public renderCards() {
        $(".card-uno").remove();
        let cards = $("#my-cards");
        this.game.player.cards.forEach((c, i) => {
            cards.append(`<div class="card-uno" id="card-${i}">
                            <img class="image" src="img/${c.getImageName()}" height="150"/>
                            <a href="#" class="put-card-btn"><img src="img/check.png"/></a>
                        </div>`);
        });

        this.game.setPage(1);
    }

    public renderDirection() {
        let code = this.game.direction ? "cw" : "acw";
        $("#arrow-left").attr("src", `img/arrow-${code}-left.png`);
        $("#arrow-right").attr("src", `img/arrow-${code}-right.png`);
    }

    public setCurrentColor() {

        $("#current-color").removeClass("red green blue yellow")
            .addClass(this.game.currentColor.codeName);
    }

    public setCurrentCard() {
        $("#current-card").attr("src", "img/" + this.game.currentCard.getImageName());
    }

    public openChooseColorModal() {
        this.chosenColor = this.game.currentColor;
        $("#choose-color-" + this.chosenColor.codeName).html("<h2>Seleccionado</h2>");
        $("#choose-color-modal").modal("show");
    }

    public showNotification(notification: UnoNotification) {
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

    public showNewCardsModal(cards: Card[], fault: string) {
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

    public showRoundEndModal(winner: Player, winPoints: number) {
        let modal = $("#round-end-modal");
        let content = $("#round-end-content");

        if (winner.id == this.game.player.id) {
            content.html(`<h3>Ganaste la ronda</h3><h5>${winPoints} puntos</h5>`);
        } else {
            content.html(`<h3>${winner.name} ganó la ronda</h3><h5>${winPoints} puntos</h5>`);
        }

        modal.modal("show");
    }

    public setStage(oldStage: number, newStage: number) {
        $("#stage-" + oldStage).hide(1000);
        $("#stage-" + newStage).show(1000, this.game.onStageChange);
        if (newStage > 1) {
            $("#round").show();
            $("#log-out-btn").show();
        } else {
            $("#round").hide();
            $("#log-out-btn").hide();
        }
    }

    private configureChooseColorModal() {

        let modal = $("#choose-color-modal");
        modal.modal({
            backdrop: true,
            keyboard: false,
            show: false
        });

        let _this = this;
        let game = this.game;
        modal.on("hide.bs.modal", function () {
            $("#choose-color-" + _this.chosenColor.codeName).html("");
            game.socket.emit("select-color", _this.chosenColor);
            game.socket.emit("turn-ended", game.player);
        });
    }

    private configureRoundEndModal() {
        let modal = $("#round-end-modal");
        modal.modal({
            backdrop: false,
            keyboard: true,
            show: false
        });

        let game = this.game;
        modal.on("hide.bs.modal", function () {
            game.setStage(2);
            game.setRound(game.round + 1);
        });
    }

    private configureToastr() {

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

    public selectColorClick() {
        let _this = this;
        $(".choose-color").click(function () {
            $("#choose-color-" + _this.chosenColor.codeName).html("");
            let id = $(this).attr("id");
            let color = id.substr(13);
            switch (color) {
                case "blue":
                    _this.chosenColor = Colors.BLUE;
                    break;
                case "green":
                    _this.chosenColor = Colors.GREEN;
                    break;
                case "red":
                    _this.chosenColor = Colors.RED;
                    break;
                case "yellow":
                    _this.chosenColor = Colors.YELLOW;
                    break;
            }

            $("#choose-color-" + _this.chosenColor.codeName).html("<h2>Seleccionado</h2>");
        });
    }

    private btnRestartClick() {
        let game = this.game;
        $("#restart-btn").click(function(e) {
            e.preventDefault();
            game.restart();
        });
    }

    private btnLogoutClick() {
        let game = this.game;
        $("#log-out-btn").click(function(e) {
            e.preventDefault();
            game.logOut();
        });
    }

    private btnEnterClick() {
        let game = this.game;
        $("#btn-enter").click(function(e) {
            game.setNewPlayer();
            game.setStage(2);
        });
    }

    private btnSetClick() {
        let game = this.game;
        $("#player-table").on('click', '#btn-set', () => {
            game.setPlayerName(<string>$("#player-name").val());
        });
    }

    private btnStartClick() {
        let game = this.game;
        $("#btn-start").click(function(e) {
            game.start();
        });
    }

    private btnPaginateLeftClick() {
        let game = this.game;
        $("#paginate-left img").click(function () {
            if (!$("#paginate-left").hasClass("disabled")) {
                game.setPage(game.page - 1);
            }
        });
    }

    private btnPaginateRightClick() {
        let game = this.game;
        $("#paginate-right img").click(function () {
            if (!$("#paginate-right").hasClass("disabled")) {
                game.setPage(game.page + 1);
            }
        });
    }

    private btnPutCardClick() {
        let game = this.game;
        $("#my-cards").on("click", ".put-card-btn", function (e) {
            e.preventDefault();
            let id = $(this).closest("div").attr("id");
            let cardIndex = parseInt(id.substr(5));
            let card = game.player.cards[cardIndex];

            game.selectCard(card);
        });
    }

    private btnPickFromDeckClick() {
        let game = this.game;
        $("#deck .put-card-btn").click(function (e) {
            e.preventDefault();
            game.pickFromDeck();
        });
    }

    private btnUnoClick() {
        let game = this.game;
        $("#uno-btn").click(function () {
            game.sayUno();
        });
    }

    private btnNoClick() {
        let game = this.game;
        $("#no-btn").click(function () {
            game.didntSayUno();
        });
    }
}