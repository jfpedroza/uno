/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Game} from "../models/Game";
import {Color} from "../models/Color";
import {Card, CardType} from "../models/Card";
import {Player} from "../models/Player";
import Socket = SocketIOClient.Socket;
import {NumericCard} from "../models/NumericCard";
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
     * @inheritDoc
     */
    public players: Player[] = [];

    /**
     * @inheritDoc
     */
    public player: Player;

    /**
     * @inheritDoc
     */
    public currentPlayer: Player;

    /**
     * @inheritDoc
     */
    public winner: Player;

    /**
     * @inheritDoc
     */
    public currentCard: Card;

    /**
     * @inheritDoc
     */
    public currentColor: Color;

    /**
     * @inheritDoc
     * @default true
     */
    public direction: boolean = true;

    /**
     * @inheritDoc
     * @default 1
     */
    public round: number = 1;

    /**
     * Objeto que almacena la cantidad de cartas de los jugadores. Las propiedades son las ids de los jugadores.
     *
     * @property cardCounts
     * @type any
     */
    public cardCounts: any;

    /**
     * Representa la UI del juego.
     *
     * @property ui
     * @type {UIHelper}
     */
    public ui: UIHelper;

    /**
     * Instancia única del juego.
     *
     * @property instance
     * @type {ClientGame}
     */
    public static instance: ClientGame;

    /**
     * @constructor
     * @param {SocketIOClient.Socket} socket Socket conectado al servidor.
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
     * @param {Player} ply Mi jugador.
     * @param {Card} currentCard Carta actual inicial.
     * @param {Color} currentColor Color inicial.
     * @param {boolean} direction Dirección inicial.
     * @param {number} round Ronda inicial.
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
     * @inheritDoc
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
     * @inheritDoc
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

        if (this.player != null && this.ui.stage >= 2) {
            this.ui.updatePlayer(p, true);
        }
    }

    /**
     * El metodo setPlayerName recibe como parametro el nombre que desea actualizar y envia el mensaje al servidor para que sea enviado a los demas clientes.
     *
     * @method setPlayerName
     * @param {string} name Nuevo nombre del jugador.
     * @public
     */
    public setPlayerName(name: string) {
        this.player.name = name;
        this.socket.emit("update-player", this.player);
    }

    /**
     * El metodo setCurrentPlayer recibe como parametro un jugador lo establece como el actual.
     *
     * @method setCurrentPlayer
     * @param {Player} current Nuevo jugador actual.
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

        UIHelper.showNotification(notif);
    }

    /**
     * El metodo setDirection recibe como paramtro el bool de la dirección y llama al metodo renderDirection para dibujar la dirección.
     *
     * @method setDirection
     * @param {boolean} dir Nueva dirección.
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
     * @param {Card} card Carta a seleccionar.
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
     * @param {Card} card Nueva carta actual.
     * @param {Player} ply Jugador que la cambió.
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

            UIHelper.showNotification(notif);
        }
        this.ui.setCurrentCard();
    }

    /**
     * El metod setCurrentColor cambia el color actual por el de la carta que puso el jugador en turno.
     *
     * @method setCurrentColor
     * @param {Color} color Nuevo color.
     * @param {Player} ply Jugador que cambió el color.
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

            UIHelper.showNotification(notif);
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
     * El metodo validateCard recibe la carta a validar y retorna true/false dependiendo si puede o no jugar la carta.
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
     * El metodo validateCards valida cual(es) de las cartas del jugador pueden ser utilizadas en su turno según la carta y el color en juego.
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
     * @param {Card[]} cards Nuevas cartas a agregar.
     * @param {string} fault Si no es null contiene la falta por la que se recibieron nuevas cartas.
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
     * El metodo setRound recibe el numero de ronda en la que está y dibuja en el html "Round: number".
     *
     * @method setRound
     * @param {number} r Nueva ronda.
     * @public
     */
    public setRound(r: number) {
        this.round = r;
        $("#round").html(`Round: ${this.round}`);
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
     * @param {Player} ply Jugador que cerró sesión
     */
    public loggedOut(ply: Player) {
        ply = this.getPlayer(ply.id);
        let notif: UnoNotification = {
            title: "Cierre de sesión",
            message: `<b>${ply.name}</b> cerró sesión`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        UIHelper.showNotification(notif);

        this.players.splice(this.players.indexOf(ply), 1);
        this.ui.renderPlayers();
        if (this.ui.stage > 2) {
            this.setCurrentPlayer(this.currentPlayer);
        }
    }
}