/**
 * @author Jhon Pedroza <jhonfpedroza@gmail.com>
 */

import {Player} from "./models/Player";
import {Deck} from "./models/Deck";
import {Card, CardType} from "./models/Card";
import {Color} from "./models/Color";
import Socket = SocketIO.Socket;
import {Utils} from "./models/Utils";
import {NotificationTypes, NotifPositions, UnoNotification} from "./models/Notification";
import {Constants, Game} from "./models/Game";

/**
 * La clase ServerGame representa el juego del lado del servidor
 * @class ServerGame
 * @implements Game
 */
export class ServerGame implements Game {

    /**
     * @inheritDoc
     */
    public players: Player[];

    /**
     * @inheritDoc
     */
    public currentPlayer: Player;

    /**
     * @inheritDoc
     */
    public winner: Player;

    /**
     * Representa el mazo del juego.
     *
     * @property deck
     * @type {Deck}
     */
    public deck: Deck;

    /**
     * Representa el mazo de descartes del juego.
     *
     * @property auxDeck
     * @type {Deck}
     */
    public auxDeck: Deck;

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
     * La propiedad sockets almacena el array de dockets del cliente, es un array asociativo.
     *
     * @property sockets
     * @type {Array<Socket>}
     */
    public sockets: Array<Socket>;

    /**
     * Es una bandera que representa si el juego ha iniciado o no.
     *
     * @property
     * @type {boolean}
     * @default false
     */
    public gameStarted: boolean = false;

    /**
     * @inheritDoc
     * @default 1
     */
    public round: number = 1;

    /**
     * @constructor
     * @param {SocketIO.Server} io El manejador de sockets de socket.io.
     */
    public constructor(public io: SocketIO.Server) {
        this.players = [];
        this.currentPlayer = null;
        this.winner = null;
        this.deck = null;
        this.auxDeck = null;
        this.currentCard = null;
        this.currentColor = null;
        this.sockets = [];
    }

    /**
     * Inicia sesión creando un nuevo jugador y enviándolo al servidor
     *
     * @param {Player} player El jugador a crear
     * @param {SocketIO.Socket} socket El socket del cliente del jugador
     * @returns {boolean} Si pudo iniciar sesión o no
     */
    public newPlayer(player: Player, socket: Socket): boolean {
        if (!this.gameStarted) {
            console.log(`New player ID: ${player.id}`);
            this.players.push(new Player(player.id, player.name));
            this.sockets[player.id] = socket;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @inheritDoc
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
     * Retorna el siguiente jugador teniendo en cuenta al jugador actual, el parámetro shouldSkip, la dirección y la carta actual.
     *
     * @param {boolean} shouldSkip Indica si debería saltarse un jugador cuando la carta actual es de tipo Skip o PlusTwo.
     * @returns {Player} El siguiente jugador
     */
    public getNextPlayer(shouldSkip: boolean): Player {
        let dif = 1;
        if ((this.currentCard.type == CardType.Skip || this.currentCard.type == CardType.PlusTwo) && shouldSkip) {
            dif = 2;
        }

        if (!this.direction) {
            dif = -dif;
        }

        let index = this.players.indexOf(this.currentPlayer);
        let newIndex = index + dif;

        if (newIndex < 0) {
            newIndex += this.players.length;
        }

        if (newIndex >= this.players.length) {
            newIndex -= this.players.length;
        }

        return this.players[newIndex];
    }

    /**
     * Inicia el jugado inicializando los mazos, tomando una carta inicial y repartiendo las cartas iniciales a los jugadoores.
     * Valida si se puede iniciar el juego.
     *
     * @param {Player} starter EL jugador que intenó iniciar el juego.
     */
    public start(starter: Player) {

        let error = this.validateGame(starter);

        if (error == null) {
            this.gameStarted = true;
            this.deck = new Deck();
            this.deck.fill();
            this.deck.suffle();
            this.auxDeck = new Deck();
            let i = 0;
            do {
                if (this.currentCard != null) {
                    this.deck.putFirst(this.currentCard);
                }
                this.currentCard = this.deck.pop();
                this.currentColor = this.currentCard.color;
            } while (this.currentCard.type != CardType.Numeric);

            this.currentPlayer = this.players[0];
            this.direction = true;

            this.players.forEach(p => {
                p.cards = [];
                p.addArray(this.deck.popAmount(Constants.initialCards));
                this.emit(p, "start-game", p, this.currentCard, this.currentColor, this.direction, this.round);
            });
        } else {
            let notif: UnoNotification = {
                title: "No se pudo iniciar el juego",
                message: error,
                type: NotificationTypes.Error,
                position: NotifPositions.TopCenter
            };
            this.emit(starter, "show-notification", notif);
        }
    }

    /**
     * @inheritDoc
     */
    public updatePlayer(player: Player) {
        this.getPlayer(player.id).name = player.name;
        this.emitAll("update-player", player);
    }

    /**
     * Se llama cuando el cliente dice que un stage está lista al finalizar la animación
     *
     * @param {Player} player El jugador envió el mensaje.
     * @param {number} stage La stage que está lista.
     */
    public stageReady(player: Player, stage: number) {
        if (stage == 2) {
            player = this.getPlayer(player.id);
            player.ready = true;
            if (this.winner != null) {
                this.emit(player, "update-player", this.winner);
            }
        } else if (stage == 3) {
            this.updateCardCount();
            this.emit(player, "set-current-player", this.currentPlayer);
        }
    }

    /**
     * @inheritDoc
     */
    public selectCard(card: Card) {
        this.auxDeck.push(this.currentCard);
        this.currentCard = Utils.createCard(card);
        let index = 0;
        this.currentPlayer.cards.forEach((c, i) => {
            if (Utils.compareCard(c, this.currentCard)) {
                index = i;
                return false;
            }
        });

        this.currentPlayer.cards.splice(index, 1);

        this.emitAll("set-current-card", this.currentCard, this.currentPlayer);
        this.emit(this.currentPlayer, "update-player", this.currentPlayer);
        this.updateCardCount();

        if (this.currentPlayer.cards.length > 0) {

            if (this.currentCard.type == CardType.PlusFour || this.currentCard.type == CardType.PlusTwo) {
                this.onPlusN();
            }

            if (this.currentCard.type != CardType.ColorChange && this.currentCard.type != CardType.PlusFour) {
                if (this.currentColor.code != this.currentCard.color.code) {
                    this.currentColor = this.currentCard.color;
                    this.emitAll("set-current-color", this.currentColor, this.currentPlayer);
                }

                if (this.currentCard.type == CardType.Return) {
                    this.direction = !this.direction;
                    this.emitAll("set-direction", this.direction);
                }

                this.currentPlayer = this.getNextPlayer(true);
                this.emitAll("set-current-player", this.currentPlayer);
            }
        } else {
            this.win();
        }
    }

    /**
     * Selecciona un color como actual
     *
     * @param {Color} color El nuevo color
     */
    public selectColor(color: Color) {
        this.currentColor = color;
        this.emitAll("set-current-color", this.currentColor, this.currentPlayer);
    }

    /**
     *  Se llama cuando un jugador dice que su turno terminó.
     *
     * @param {Player} player El jugador que terminó su turno.
     */
    public turnEnded(player: Player) {
        this.currentPlayer = this.getNextPlayer(false);
        this.emitAll("set-current-player", this.currentPlayer);
    }

    /**
     * Se llama cuando un jugador pide una carta del mazo.
     *
     * @param {Player} player El jugador que solicitó la carta.
     */
    public pickFromDeck(player: Player) {
        let card = this.getCardFromDeck();
        this.getPlayer(player.id).add(card);
        this.emit(player, "add-cards", [ card]);
        this.updateCardCount();

        let notif: UnoNotification = {
            title: "Carta del mazo",
            message: `<b>${player.name}</b> tomó una carta del mazo`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        this.emitAllBut(player, "show-notification", notif);
    }

    /**
     * Devuelve una carta del mazo, revuelve si es necesario.
     *
     * @returns {Card} La carta del mazo.
     */
    public getCardFromDeck(): Card {
        if (this.deck.size == 0) {
            this.deck = this.auxDeck;
            this.deck.suffle();
            this.auxDeck = new Deck();
        }

        return this.deck.pop();
    }

    /**
     * Devuelve un array de carta del mazo, revuelve si es necesario.
     *
     * @param {number} amount El numero de cartas a sacar.
     * @returns {Card[]} El array de cartas del mazo.
     */
    public getCardsFromDeck(amount: number): Card[] {

        if (this.deck.size < amount) {
            let rem = amount - this.deck.size;
            let cards = this.deck.popAmount(this.deck.size);
            this.deck = this.auxDeck;
            this.deck.suffle();
            this.auxDeck = new Deck();
            cards.push(... this.deck.popAmount(rem));
        } else {
            return this.deck.popAmount(amount);
        }
    }

    /**
     * Se llama cuando un jugador dice uno.
     * Penaliza si es necesario.
     *
     * @param {Player} player El jugador que dijo uno.
     */
    public sayUno(player: Player) {
        player = this.getPlayer(player.id);

        let notif: UnoNotification = {
            title: "Alguien dijo uno",
            message: `<b>${player.name}</b> dijo uno`,
            type: NotificationTypes.Warning,
            position: NotifPositions.BottomLeft
        };

        if (player.cards.length > 1) {
            let cards = this.getCardsFromDeck(2);
            player.addArray(cards);
            this.emit(player, "add-cards", cards, "no tienes solo una carta");
            this.updateCardCount();
            notif.message += ". Fue penalizado por no tener solo una carta.";
        } else {
            player.saidUno = true;
        }

        this.emitAllBut(player, "show-notification", notif);
    }

    /**
     * Se llama cuando un jugador presiona el botón de no dijo uno.
     * Penaliza a los jugadores que sea necesario.
     *
     * @param {Player} player El jugador que presinó el botón.
     */
    public didntSayUno(player: Player) {
        player = this.getPlayer(player.id);
        let fault = true;
        this.players.forEach(p => {
            if (p.cards.length == 1 && !p.saidUno) {
                fault = false;
                this.playerDidntSayUno(p);
                return false;
            }
        });

        if (fault) {
            let cards = this.getCardsFromDeck(2);
            player.addArray(cards);
            this.emit(player, "add-cards", cards, "no hay nadie sin decir uno");
            this.updateCardCount();

            let notif: UnoNotification = {
                title: "Alguien tiene nuevas cartas",
                message: `<b>${player.name}</b> tiene 2 nuevas cartas porque no hay nadie sin decir uno`,
                type: NotificationTypes.Info,
                position: NotifPositions.BottomLeft
            };

            this.emitAllBut(player, "show-notification", notif);
        }
    }

    /**
     * Cierra la sesión del jugador que lo solicite.
     * Elimina el jugador del array.
     *
     * @param {Player} player El jugador que quiere cerrar sesión.
     */
    public logOut(player: Player) {
        player = this.getPlayer(player.id);

        let next = this.getNextPlayer(false);
        this.players.splice(this.players.indexOf(player), 1);

        if (this.players.length > 1) {
            this.sockets[player.id].disconnect(true);
            this.emitAll("logged-out", player);
            this.updateCardCount();

            if (player.id == this.currentPlayer.id) {
                this.currentPlayer = next;
                this.emitAll("set-current-player", this.currentPlayer);
            }
        } else {
            this.winner = this.players[0];
            this.emitAll("end-game", this.winner);
        }
    }

    /**
     * Marca a los jugadores como no listos.
     */
    private unreadyPlayers() {
        this.players.forEach(p => p.ready = false);
    }

    /**
     * Se llama cuando alguien gana el juego.
     */
    private win() {
        this.winner = this.currentPlayer;
        let newPoints = 0;
        this.players.forEach(p => {
            if (p.id != this.winner.id) {
                newPoints += p.getCardPoints();
            }
        });

        this.winner.points += newPoints;

        if (this.winner.points >= 500) {
            this.emitAll("end-game", this.winner);
        } else {
            this.round++;
            this.unreadyPlayers();
            this.emitAll("end-round", this.winner, newPoints);
        }
    }

    /**
     * Valida si alguien puede iniciar el juego o no.
     * @param {Player} starter El jugador que quiere iniciar el juego.
     * @returns {string} El mensaje de error, null cuando el jugador puede iniciarl juego
     */
    private validateGame(starter: Player): string {
        if (this.players[0].id != starter.id) {
            return `Solo el primer jugador puede iniciar el juego`;

        } else if (this.players.length < Constants.minPlayers) {
            return `No hay suficientes jugadores. Mínimo ${Constants.minPlayers} jugadores`;

        } else if (this.players.length > Constants.maxPlayers) {
            return `Hay demasiados jugadores. Máximo ${Constants.maxPlayers} jugadores`;

        } else if (this.players.some(p => !p.ready)) {
            return `No todos los jugadores están listos`;
        }
    }

    /**
     * Se llama cuando se pone un +2 o +4
     */
    private onPlusN() {
        let amount = 2;
        if (this.currentCard.type == CardType.PlusFour) {
            amount = 4;
        }

        let cards = this.getCardsFromDeck(amount);
        let player = this.getNextPlayer(false);
        player.addArray(cards);
        this.emit(player, "add-cards", cards);
        this.updateCardCount();

        let notif: UnoNotification = {
            title: "Alguien tiene nuevas cartas",
            message: `<b>${player.name}</b> tiene ${amount} nuevas cartas`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        this.emitAllBut(player, "show-notification", notif);
    }

    /**
     * Retorna un array asociativo donde el índice es la id del jugador y el valor es el número de cartas del jugador.
     * @returns {any} Array asociativo con el número de cartas.
     */
    private getCardCount() {
        let array: any = {};
        this.players.forEach(p => {
            array[p.id] = p.cards.length;
        });

        return array;
    }

    /**
     * Le envía un mensaje a todos los clientes para que actualicen el número de cartas de los jugadores.
     */
    private updateCardCount() {
        this.emitAll("update-card-count", this.getCardCount());
    }

    /**
     * Se llama cuando un jugador no dijo uno y otro jugador lo reportó.
     * Penaliza al jugador que no dijo uno.
     * @param {Player} player El jugador que no dijo uno.
     */
    private playerDidntSayUno(player: Player) {
        let cards = this.getCardsFromDeck(2);
        player.addArray(cards);
        this.emit(player, "add-cards", cards, "no dijiste uno");
        this.emitAll("update-card-count", this.getCardCount());

        let notif: UnoNotification = {
            title: "Alguien tiene nuevas cartas",
            message: `<b>${player.name}</b> tiene 2 nuevas cartas por no decir uno`,
            type: NotificationTypes.Info,
            position: NotifPositions.BottomLeft
        };

        this.emitAllBut(player, "show-notification", notif);
    }

    /**
     * Devuelve el socket correspondiente a un jugador.
     *
     * @param {Player} player El jugador que necesita el socket.
     * @returns {SocketIO.Socket} El socket del jugador.
     */
    public getSocket(player: Player): Socket {
        return this.sockets[player.id];
    }

    /**
     * Envía un mensaje al jugador que reciba como parámetro.
     *
     * @param {Player} player El jugador al que se le quiere enviar un mensaje.
     * @param {string} event El mensaje que se quiere enviar
     * @param args Los parámetros del mensaje
     */
    public emit(player: Player, event: string, ... args: any[]) {
        this.getSocket(player).emit(event, ... args);
    }


    /**
     * Envía un mensaje a todos los jugadores conectados
     *
     * @param {string} event El mensaje que se quiere enviar
     * @param args Los parámetros del mensaje
     */
    public emitAll(event: string, ... args: any[]) {
        this.io.sockets.emit(event, ... args);
    }

    /**
     * Envía un mensaje a todos los jugadores menos el especificado
     * @param {Player} player El jugador al que no se le enviará un mensaje
     * @param {string} event El mensaje que se quiere enviar
     * @param args Los parámetros del mensaje
     */
    public emitAllBut(player: Player, event: string, ... args: any[]) {
        this.players.forEach(p => {
            if (p.id != player.id) {
                this.emit(p, event, ... args);
            }
        });
    }
}