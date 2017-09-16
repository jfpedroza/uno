/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
*/

import {Constants, Game} from "../models/Game";
import {Color} from "../models/Color";
import {Card, CardType} from "../models/Card";
import {Player} from "../models/Player";
import Socket = SocketIOClient.Socket;
import {NumericCard} from "../models/NumericCard";
import pageSize = Constants.pageSize;
import {Utils} from "../models/Utils";
import {NotificationTypes, NotifPositions, UnoNotification} from "../models/Notification";
import {UIHelper} from "./UIHelper";

/**
 * La clase ClientGame representa el juego del lado del cliente.
 *
 * @class ClientGame
 * @implements Game
 */
export class ClientGame implements Game {

    /**
     * La propiedad socket representa el socket del cliente.
     *
     * @property socket
     * @type {Socket}
     * @public
     */
    public socket: Socket;

    /**
     * La propiedad players representa el array de los jugadores en juego.
     *
     * @inheritDoc
     * @type Player
     */
    public players: Player[] = [];

    /**
     * La propiedad player representa el jugador en juego.
     *
     * @inheritDoc
     * @type Player
     */
    public player: Player;

    /**
     * La propiedad currentPlayer representa el jugador en turno.
     *
     * @inheritDoc
     * @type Player
     */
    public currentPlayer: Player;

    /**
     * La propiedad winner representa al jugador ganador.
     *
     * @inheritDoc
     * @type Player
     */
    public winner: Player;

    /**
     * La propiedad currentCard representa la carta en juego.
     *
     * @inheritDoc
     * @type Card
     */
    public currentCard: Card;

    /**
     * La propiedad currentColor representa el color en juego.
     *
     * @inheritDoc
     * @type Color
     */
    public currentColor: Color;

    /**
     * La propiedad direction representa la direccion del juego.
     *
     * @inheritDoc
     * @type {boolean}
     */
    public direction: boolean = true;

    /**
     * La propiedad round representa la ronda de juego en la que está, tiene valor por defecto 1.
     *
     * @inheritDoc
     * @default 1
     */
    public round: number = 1;

    /**
     * @property stage
     * @type {number}
     * @default 1
     */
    public stage: number = 1;

    /**
     * @property page
     * @type {number}
     * @default 1
     */
    public page: number = 1;

    /**
     * @property cardCounts
     * @type any
     */
    public cardCounts: any;

    /**
     * @property nameEditable
     * @type {boolean}
     * @default true
     */
    public nameEditable = true;

    /**
     * @property ui
     * @type {UIHelper}
     */
    public ui: UIHelper;

    /**
     * @property instance
     * @type {ClientGame}
     */
    public static instance: ClientGame;

    /**
     * @constructor
     * @param {SocketIOClient.Socket} socket
     */
    public constructor(socket: Socket) {
        this.socket = socket;
        this.player = null;
        this.currentCard = null;
        this.currentColor = null;
        this.winner = null;
        this.currentPlayer = null;
        this.cardCounts = null;
        this.ui = new UIHelper(this);
        ClientGame.instance = this;
    }

    /**
     * El metodo setNewPlayer crea el nuevo jugador y lo envia al servidor.
     *
     * @method setNewPlayer
     * @public
     */
    public setNewPlayer() {
        this.player = new Player(new Date().getTime(), "New Player");
        this.socket.emit("new-player", this.player);
    }

    /**
     * envia la señal y el jugador del cliente para iniciar el juego.
     *
     * @method start
     * @public
     */
    public start() {
        this.socket.emit("start", this.player);
    }

    /**
     * El metodo startGame recibe el jugador, las cartas, el color, la dirección y la ronda para iniciar el juego.
     *
     * @method stratGame
     * @param {Player} ply
     * @param {Card} currentCard
     * @param {Color} currentColor
     * @param {boolean} direction
     * @param {number} round
     * @public
     */
    public startGame(ply: Player, currentCard: Card, currentColor: Color, direction: boolean, round: number) {
        this.player = ply;
        this.player.cards = Utils.createCards(ply.cards);
        this.currentCard = Utils.createCard(currentCard);
        this.currentColor = currentColor;
        this.direction = direction;
        this.setRound(round);
    }

    /**
     * El metodo getPlayer recibe como parametro el id del jugador y lo filtra del array de jugadores.
     *
     * @method getPlayer
     * @param {number} id
     * @return {Player}
     * @public
     */
    public getPlayer(id: number): Player {
        const result = this.players.filter(p => p.id == id);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

    /**
     * El metodo updatePlayer recibe el jugador para actializarlo.
     *
     * @method updatePlayer
     * @param {Player} ply
     * @public
     */
    public updatePlayer(ply: Player) {
        let p = this.getPlayer(ply.id);
        if (p != null) {
            p.name = ply.name;
            p.points = ply.points;
        } else {
            console.error("P is NULL");
        }

        if (this.player != null && this.player.id == p.id) {
            this.player = p;
            this.player.cards = Utils.createCards(ply.cards);
        }

        if (this.player != null && this.stage >= 2) {
            console.log("updating player", p);
            this.ui.updatePlayer(p, true);
        }
    }

    /**
     * El metodo setPlayerName recibe como parametro el nombre que desea actualizar y envia el mensaje al servidor para que sea enviado a los demas clientes.
     *
     * @method setPlayerName
     * @param {string} name
     * @public
     */
    public setPlayerName(name: string) {
        this.player.name = name;
        this.socket.emit("update-player", this.player);
    }

    /**
     * El metodo setCurrentPlayer recibe como parametro el jugador y activa al jugador.
     *
     * @method setCurrentPlayer
     * @param {Player} current
     * @public
     */
    public setCurrentPlayer(current: Player) {
        if (this.currentPlayer != null) {
            if (this.currentPlayer.id == this.player.id) {
                $(`#my-player`).removeClass("active");
            } else {
                $(`#player-${this.currentPlayer.id}`).removeClass("active");
            }
        }

        this.currentPlayer = current;
        if (this.currentPlayer.id == this.player.id) {
            $(`#my-player`).addClass("active");
        } else {
            $(`#player-${this.currentPlayer.id}`).addClass("active");
        }

        this.validateCards();

        let notif: UnoNotification = {
            title: "Cambio de turno",
            message: this.currentPlayer.id == this.player.id ? "Es tu turno" : `<b>${this.currentPlayer.name}</b> tiene el turno`,
            type: this.currentPlayer.id == this.player.id ? NotificationTypes.Success : NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        this.ui.showNotification(notif);
    }

    /**
     * El metodo setDirection recibe como paramtro el bool de la dirección y llama al metodo renderDirection para dibujar la dirección.
     *
     * @method setDirection
     * @param {boolean} dir
     * @public
     */
    public setDirection(dir: boolean) {
        this.direction = dir;
        this.ui.renderDirection();
    }

    /**
     * El metodo selectCard recibe la carta como parametro y envia está al servidor.
     * Además, si el tipo de carta el amerita una selección de color abre el modal de selección de color.
     *
     * @method selectCard
     * @param {Card} card
     * @public
     */
    public selectCard(card: Card) {
        this.socket.emit("select-card", card);

        if (card.type == CardType.PlusFour || card.type == CardType.ColorChange) {
            this.ui.openChooseColorModal();
        }
    }

    /**
     * El metodo setCurrentCard cambia la carta actual por la seleccionada por el jugador.
     *
     * @method setCurrentCard
     * @param {Card} card
     * @param {Player} ply
     * @public
     */
    public setCurrentCard(card: Card, ply: Player) {

        card = Utils.createCard(card);

        if (this.currentCard !== card) {
            this.currentCard = card;
        }

        if (ply.id != this.player.id) {

            let notif: UnoNotification = {
                title: "Se puso una carta",
                message: `<b>${this.currentPlayer.name}</b> puso ${this.currentCard.getName()}`,
                type: NotificationTypes.Info,
                position: NotifPositions.BottomLeft
            };

            this.ui.showNotification(notif);
        }
        this.ui.setCurrentCard();
    }

    /**
     * El metod setCurrentColor cambia el color actual por el de la carta que puso el jugador en turno.
     *
     * @method setCurrentColor
     * @param {Color} color
     * @param {Player} ply
     * @public
     */
    public setCurrentColor(color: Color, ply: Player) {
        this.currentColor = color;
        this.ui.setCurrentColor();

        if (ply.id != this.player.id) {

            let notif: UnoNotification = {
                title: "Cambio de color",
                message: `<b>${this.currentPlayer.name}</b> puso el color en ${color.name}`,
                type: NotificationTypes.Info,
                position: NotifPositions.BottomLeft
            };

            this.ui.showNotification(notif);
        }
    }

    /**
     * El metodo pickFromDeck envia un mensaje al servidor para tomar una carta del mazo.
     *
     * @method pickFromDeck
     * @public
     */
    public pickFromDeck() {
        this.socket.emit("pick-from-deck", this.player);
    }

    /**
     * El metodo sayUno envia un mensaje al servidor para anunciar que dijo uno a los demas jugadores.
     *
     * @method sayUno
     * @public
     */
    public sayUno() {
        this.socket.emit("say-uno", this.player);
    }

    /**
     * El metodo didntSayUno envia un mensaje al servidor para anunciar que algún jugador no dijo uno.
     *
     * @method didntSayUno
     * @public
     */
    public didntSayUno() {
        this.socket.emit("didnt-say-uno", this.player);
    }

    /**
     * El metodo setStage habilita el stage del juego en el que se esté.
     *
     * @method setStage
     * @param {number} stage
     * @public
     */
    public setStage(stage: number) {
        this.ui.setStage(this.stage, stage);
        this.stage = stage;
    }

    /**
     * El metodo onStageChange dibujo lo referente para cada una de las Stage.
     *
     * @method onStageChange
     * @public
     */
    public onStageChange() {
        let game = ClientGame.instance;
        if (game.stage == 2) {
            game.renderPlayers();
        }
        else if (game.stage == 3) {
            game.ui.setCurrentCard();
            game.ui.setCurrentColor();
            game.renderPlayers();
            game.ui.renderCards();
            game.ui.renderDirection();
        }

        game.socket.emit("stage-ready", game.player, game.stage);
    }

    /**
     * El metodo validateCard recibe la carta a validar y retorna true/false dependiendo si puede o no jugar la carga que tomó del mazo.
     *
     * @method validateCard
     * @param {Card} card
     * @return {boolean}
     */
    public validateCard(card: Card): boolean {
        if (card.type == this.currentCard.type) {
            if (this.currentCard.type == CardType.Numeric) {
                if (card.color.code == this.currentColor.code) {
                    return true;
                } else {
                    return (card as NumericCard).num == (this.currentCard as NumericCard).num;
                }
            } else {
                return true;
            }
        } else if (card.type == CardType.PlusFour || card.type == CardType.ColorChange) {
            return true;
        } else {
            return card.color.code == this.currentColor.code;
        }
    }

    /**
     * El metodo validateCards valida cual(es) de las cartas del jugador pueden ser utilizadas en su turno según el parametro de la carta y color en juego.
     *
     * @method validateCards
     * @public
     */
    public validateCards() {
        if (this.currentPlayer.id == this.player.id) {
            this.player.cards.forEach((c, i) => {
                if (this.validateCard(c)) {
                    $(`#card-${i}`).addClass("valid");
                } else {
                    $(`#card-${i}`).removeClass("valid");
                }
            });
        } else {
            $(".card-uno").removeClass("valid");
        }
    }

    /**
     * El metodo addCards recibe el array de cartas y la razón por la que las cartas van a ser añadidas al array de cartas del jugador.
     *
     * @method addCards
     * @param {Card[]} cards
     * @param {string} fault
     * @public
     */
    public addCards(cards: Card[], fault: string) {
        cards = Utils.createCards(cards);
        this.player.cards.push(... cards);
        this.ui.showNewCardsModal(cards, fault);
        this.ui.renderCards();
        this.validateCards();

        if (this.currentPlayer.id == this.player.id && cards.length == 1) {
            let anyValid = this.player.cards.some(c => this.validateCard(c));
            if (!anyValid) {
                this.socket.emit("turn-ended", this.player);
            }
        }
    }

    /**
     * El metodo renderPlayers dibuja los jugadores en el stage 2.
     *
     * @method renderPlayers
     * @public
     */
    public renderPlayers() {
        if (this.stage == 2) {
            const table = $("#player-table tbody");
            table.html("");
            this.players.forEach(p => {

                if (this.player.id == p.id && this.nameEditable) {
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
            this.players.forEach(p => {
                if (this.player.id == p.id) {
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
     * El metodo setPage recibe el numero de cartas por pagina y paginá si tienes más de ese numero de cartas.
     *
     * @method setPage
     * @param {number} p
     * @public
     */
    public setPage(p: number) {
        $(".card-uno").removeClass("visible");
        this.page = p;
        for (let i = (this.page - 1) * pageSize; i < this.page * pageSize; i++) {
            if (i < this.player.cards.length) {
                $(`#card-${i}`).addClass("visible");
            }
        }

        if (this.page == 1) {
            $("#paginate-left").addClass("disabled");
        } else {
            $("#paginate-left").removeClass("disabled");
        }

        if (this.page * pageSize < this.player.cards.length) {
            $("#paginate-right").removeClass("disabled");
        } else {
            $("#paginate-right").addClass("disabled");
        }
    }

    /**
     * El metodo setRound recibe el numero de ronda en la que está y dibuja en el html "Round: number".
     *
     * @method setRound
     * @param {number} r
     * @public
     */
    public setRound(r: number) {
        this.round = r;
        $("#round").html(`Round: ${this.round}`);
    }

    /**
     * Le metodo renderCardCounts anima el numero de cartas del jugador.
     *
     * @method renderCardCounts
     * @public
     */
    public renderCardCounts() {
        this.players.forEach(p => {
            let id = `#player-${p.id}`;
            if (this.player.id == p.id) {
                id = "#my-player";
            }

            this.ui.animateNumber($(`${id} .player-card-number`), this.cardCounts[p.id], 300);
        });
    }

    /**
     * El metodo logOut envia un mensaje de desconexión al servidor y recarga el cliente.
     *
     * @method logOut
     * @public
     */
    public logOut() {
        this.socket.emit("log-out", this.player);
        location.reload(true);
    }

    /**
     * El metodo restart envia un mensaje al servidor que actualiza todos los clientes en sesión.
     *
     * @method restart
     * @public
     */
    public restart() {
        this.socket.emit("restart");
    }

    /**
     * El metodo loggedOut recibe como parametro el jugador que cerró sesión notifica a los demas jugadores y lo saca del array de jugadores.
     *
     * @method loggedOut
     * @param {Player} ply
     */
    public loggedOut(ply: Player) {
        ply = this.getPlayer(ply.id);
        let notif: UnoNotification = {
            title: "Cierre de sesión",
            message: `<b>${ply.name}</b> cerró sesión`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        this.ui.showNotification(notif);

        this.players.splice(this.players.indexOf(ply), 1);
        this.renderPlayers();
        this.setCurrentPlayer(this.currentPlayer);
    }
}