/**
 * @author Kevin Serrano <kevinjsa2708@gmail.com>
 */

import {ClientGame} from "./ClientGame";
import {Player} from "../models/Player";
import {NotifPositions, UnoNotification} from "../models/Notification";
import {Card} from "../models/Card";
import {Color, Colors} from "../models/Color";
import {Constants} from "../models/Game";

/**
 * La clase UIHelper contiene métodos para manipular la interfaz gráfica, también maneja los eventos de clic y los modales.
 *
 * @class UIHelper
 */
export class UIHelper {

    /**
     * Almacena la instancia del juego a la que está asociada esta UI.
     *
     * @property game
     * @type {ClientGame
     */
    game: ClientGame;

    /**
     * Representa el color escogido en el modal de selección de color.
     *
     * @property chosenColor
     * @type {Color}
     */
    chosenColor: Color;

    /**
     * Representa la página de cartas que se están mostrando.
     * 
     * @property page
     * @type {number}
     * @default 1
     */
    public page: number = 1;

    /**
     * Representa la parta del juego en la que se encuentra el jugador.
     *
     * @property stage
     * @type {number}
     * @default 1
     */
    public stage: number = 1;

    /**
     * Determina si el nombre se puede cambiar en el stage 2 o no.
     *
     * @property nameEditable
     * @type {boolean}
     * @default true
     */
    public nameEditable = true;

    /**
     * @constructor
     * @param {ClientGame} game El juego al que estará asociado esta UI.
     */
    public constructor(game: ClientGame) {
        this.game = game;
        this.chosenColor = null;
    }

    /**
     * Configura los modales y las notificaciones.
     *
     * @method configure
     */
    public configure() {
        this.configureChooseColorModal();
        this.configureRoundEndModal();
        UIHelper.configureToastr();
    }

    /**
     * Registra todos los eventos de clic del juego.
     *
     * @method clickEvents
     */
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

    /**
     * Actualiza un jugador en la pantalla.
     *
     * @method updatePlayer
     * @param {Player} p El jugador que se quiere actualizar.
     * @param {boolean} animate Si debe animar las propiedades numéricas o no.
     */
    public updatePlayer(p: Player, animate: boolean) {
        if (this.stage == 2) {
            if (this.game.player.id != p.id) {
                $(`#player-stg2-${p.id} .player-name`).html(`${p.name}`);
            }

            if (animate) {
                this.animateNumber($(`#player-stg2-${p.id} .player-points`), p.points, 300);
            } else {
                $(`#player-stg2-${p.id} .player-points`).html(`${p.points}`);
            }
        } else if (this.stage == 3) {
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

    /**
     * Anima el cambio del valor numérico de un elemento.
     *
     * @param el Elemento que contiene el número.
     * @param {number} newValue El nuevo valor del elemento.
     * @param {number} time El tiempo entre cada cambio del número.
     */
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

    /**
     * Dibuja todas las cartas en pantalla.
     *
     * @method renderCards
     */
    public renderCards() {
        $(".card-uno").remove();
        let cards = $("#my-cards");
        this.game.player.cards.forEach((c, i) => {
            cards.append(`<div class="card-uno" id="card-${i}">
                            <img class="image" src="img/${c.getImageName()}" height="150"/>
                            <a href="#" class="put-card-btn"><img src="img/check.png"/></a>
                        </div>`);
        });

        this.setPage(1);
    }

    /**
     * El metodo renderPlayers dibuja los jugadores en la pantalla
     *
     * @method renderPlayers
     * @public
     */
    public renderPlayers() {
        if (this.stage == 2) {
            const table = $("#player-table tbody");
            table.html("");
            this.game.players.forEach(p => {

                if (this.game.player.id == p.id && this.nameEditable) {
                    table.append(`<tr id="player-stg2-${p.id}">
                                <td class="player-name"><input value="${p.name}" class="input" id="player-name" autofocus></td>
                                <td class="player-points">${p.points}</td>
                                <td><button class="button" id="btn-set">Set</button></td>
                              </tr>`);
                } else {
                    table.append(`<tr id="player-stg2-${p.id}">
                                <td class="player-name">${p.name}</td>
                                <td class="player-points">${p.points}</td>
                              </tr>`);
                }
            });
        } else if (this.stage == 3) {
            $(".player").remove();
            let plys = $(".players");
            this.game.players.forEach(p => {
                if (this.game.player.id == p.id) {
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

    /**
     * Dibuja el sentido actual del juego.
     *
     * @method renderDirection
     */
    public renderDirection() {
        let code = this.game.direction ? "cw" : "acw";
        $("#arrow-left").attr("src", `img/arrow-${code}-left.png`);
        $("#arrow-right").attr("src", `img/arrow-${code}-right.png`);
    }

    /**
     * Le metodo renderCardCounts dibuja y anima el numero de cartas del jugador.
     *
     * @method renderCardCounts
     * @public
     */
    public renderCardCounts() {
        this.game.players.forEach(p => {
            let id = `#player-${p.id}`;
            if (this.game.player.id == p.id) {
                id = "#my-player";
            }

            this.animateNumber($(`${id} .player-card-number`), this.game.cardCounts[p.id], 300);
        });
    }

    /**
     * Dibuja el color actual en la pantalla.
     *
     * @method setCurrentColor
     */
    public setCurrentColor() {

        $("#current-color").removeClass("red green blue yellow")
            .addClass(this.game.currentColor.codeName);
    }

    /**
     * Dibuja la carta actual en pantalla.
     *
     * @method setCurrentCard
     */
    public setCurrentCard() {
        $("#current-card").attr("src", "img/" + this.game.currentCard.getImageName());
    }

    /**
     * Abre el modal para selecciona un color.
     *
     * @method openChooseColorModal
     */
    public openChooseColorModal() {
        this.chosenColor = this.game.currentColor;
        $("#choose-color-" + this.chosenColor.codeName).html("<h2>Seleccionado</h2>");
        $("#choose-color-modal").modal("show");
    }

    /**
     * Muesntra la notificación en pantalla.
     *
     * @method showNotification
     * @param {UnoNotification} notification La notificación que se quiere mostrar.
     * @static
     */
    public static showNotification(notification: UnoNotification) {
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

    /**
     * Muentra el modal con las nuevas cartas que recibió el jugador.
     *
     * @method showNewCardsModal
     * @param {Card[]} cards Las nuevas cartas.
     * @param {string} fault Si no es null contiene la falta por la que se recibieron nuevas cartas.
     */
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

    /**
     * Muentra un diciendo que la ronda acabó.
     *
     * @method showRoundEndModal
     * @param {Player} winner
     * @param {number} winPoints
     */
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

    /**
     * Cambia de stage el juego animando el cambio.
     *
     * @method setStage
     * @param {number} s EL nuevo stage.
     */
    public setStage(s: number) {
        $("#stage-" + this.stage).hide(1000);
        this.stage = s;
        $("#stage-" + this.stage).show(1000, this.onStageChange);
        if (this.stage > 1) {
            $("#round").show();
            $("#log-out-btn").show();
        } else {
            $("#round").hide();
            $("#log-out-btn").hide();
        }
    }
    
    /**
     * El metodo setPage recibe la página de las cartas que se quiere mostrar.
     *
     * @method setPage
     * @param {number} p Nueva página.
     * @public
     */
    public setPage(p: number) {
        $(".card-uno").removeClass("visible");
        this.page = p;
        for (let i = (this.page - 1) * Constants.pageSize; i < this.page * Constants.pageSize; i++) {
            if (i < this.game.player.cards.length) {
                $(`#card-${i}`).addClass("visible");
            }
        }

        if (this.page == 1) {
            $("#paginate-left").addClass("disabled");
        } else {
            $("#paginate-left").removeClass("disabled");
        }

        if (this.page * Constants.pageSize < this.game.player.cards.length) {
            $("#paginate-right").removeClass("disabled");
        } else {
            $("#paginate-right").addClass("disabled");
        }
    }

    /**
     * El metodo onStageChange dibuja lo referente para cada una de las Stage.
     *
     * @method onStageChange
     * @public
     */
    public onStageChange() {
        let game = ClientGame.instance;
        if (game.ui.stage == 2) {
            game.ui.renderPlayers();
        }
        else if (game.ui.stage == 3) {
            game.ui.setCurrentCard();
            game.ui.setCurrentColor();
            game.ui.renderPlayers();
            game.ui.renderCards();
            game.ui.renderDirection();
        }

        game.socket.emit("stage-ready", game.player, game.ui.stage);
    }
    
    /**
     * Configura el modal de selección color.
     *
     * @method configureChooseColorModal
     */
    private configureChooseColorModal() {

        let modal = $("#choose-color-modal");
        modal.modal({
            backdrop: true,
            keyboard: false,
            show: false
        });

        let _this = this;
        let game = this.game;
        modal.on("hide.bs.modal", () => {
            $("#choose-color-" + _this.chosenColor.codeName).html("");
            game.socket.emit("select-color", _this.chosenColor);
            game.socket.emit("turn-ended", game.player);
        });
    }

    /**
     * Configura el modal de fin de ronda.
     *
     * @method configureRoundEndModal
     */
    private configureRoundEndModal() {
        let modal = $("#round-end-modal");
        modal.modal({
            backdrop: false,
            keyboard: true,
            show: false
        });

        modal.on("hide.bs.modal", ()=> {
            this.setStage(2);
            this.game.setRound(this.game.round + 1);
        });
    }

    /**
     * Configura el la biblioteca de notificaciones toastr.
     *
     * @method configureToastr
     * @static
     */
    private static configureToastr() {

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

    /**
     * Configura el evento de selección de color.
     *
     * @method selectColorClick
     */
    public selectColorClick() {

        let _this = this;
        $(".choose-color").click(function() {
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

    /**
     * Configura el evento de reinicio.
     *
     * @method btnRestartClick
     */
    private btnRestartClick() {
        $("#restart-btn").click((e) => {
            e.preventDefault();
            this.game.restart();
        });
    }

    /**
     * Configura el evento de cierre de sesión.
     *
     * @method btnLogoutClick
     */
    private btnLogoutClick() {
        $("#log-out-btn").click((e) => {
            e.preventDefault();
            this.game.logOut();
        });
    }

    /**
     * Configura el evento de entrar al juego.
     *
     * @method btnEnterClick
     */
    private btnEnterClick() {
        $("#btn-enter").click(e => {
            this.game.setNewPlayer();
            this.setStage(2);
        });
    }

    /**
     * Configura el evento de cambio de nombre de jugador.
     *
     * @method btnSetClick
     */
    private btnSetClick() {
        $("#player-table").on('click', '#btn-set', () => {
            this.game.setPlayerName(<string>$("#player-name").val());
        });
    }

    /**
     * Configura el evento de selección de color.
     *
     * @method btnStartClick
     */
    private btnStartClick() {
        $("#btn-start").click((e) => {
            this.game.start();
        });
    }

    /**
     * Configura el evento de paginar a la izquierda.
     *
     * @method btnPaginateLeftClick
     */
    private btnPaginateLeftClick() {
        $("#paginate-left img").click(() => {
            if (!$("#paginate-left").hasClass("disabled")) {
                this.setPage(this.page - 1);
            }
        });
    }

    /**
     * Configura el evento de paginar a la derecha.
     *
     * @method btnPaginateRightClick
     */
    private btnPaginateRightClick() {
        $("#paginate-right img").click(() => {
            if (!$("#paginate-right").hasClass("disabled")) {
                this.setPage(this.page + 1);
            }
        });
    }

    /**
     * Configura el evento de poner carta.
     *
     * @method btnPutCardClick
     */
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

    /**
     * Configura el evento de tomar una carta del mazo.
     *
     * @method btnPickFromDeckClick
     */
    private btnPickFromDeckClick() {
        $("#deck .put-card-btn").click((e) => {
            e.preventDefault();
            this.game.pickFromDeck();
        });
    }

    /**
     * Configura el evento de decir uno.
     *
     * @method btnUnoClick
     */
    private btnUnoClick() {
        $("#uno-btn").click(() => {
            this.game.sayUno();
        });
    }

    /**
     * Configura el evento de no dijo uno.
     *
     * @method btnNoClick
     */
    private btnNoClick() {
        $("#no-btn").click(() => {
            this.game.didntSayUno();
        });
    }
}