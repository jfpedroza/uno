import {Player} from "./models/Player";
import {Deck} from "./models/Deck";
import {Card, CardType} from "./models/Card";
import {Color} from "./models/Color";
import Socket = SocketIO.Socket;
import {Utils} from "./models/Utils";
import {NotificationTypes, NotifPositions, UnoNotification} from "./models/Notification";
import {Constants, Game} from "./models/Game";

export class ServerGame implements Game {

    public players: Player[];
    public currentPlayer: Player;
    public winner: Player;
    public deck: Deck;
    public auxDeck: Deck;
    public currentCard: Card;
    public currentColor: Color;
    public direction: boolean;
    public sockets: Array<Socket>;
    public gameStarted: boolean;
    public round: number;

    public constructor(public io: SocketIO.Server) {
        this.players = [];
        this.currentPlayer = null;
        this.winner = null;
        this.deck = null;
        this.auxDeck = null;
        this.currentCard = null;
        this.currentColor = null;
        this.direction = true;
        this.sockets = [];
        this.gameStarted = false;
        this.round = 1;
    }

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

    public getPlayer(id: number): Player {
        const result = this.players.filter(p => p.id == id);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

    public getNextPlayer(shouldSkip: boolean): Player {
        let dif = 1;
        if (this.currentCard.type == CardType.Skip && shouldSkip) {
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
                console.log("1");
                p.addArray(this.deck.popAmount(Constants.initialCards));
                console.log("2");
                this.emit(p, "start-game", p, this.currentCard, this.currentColor, this.direction, this.round);
                console.log("3");
            });
            console.log("11");
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

    public updatePlayer(player: Player) {
        this.getPlayer(player.id).name = player.name;
        this.emitAll("update-player", player);
    }

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
            if (this.winner != null) {
                this.emit(player, "update-player", this.winner);
            }
        }
    }

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

    public selectColor(color: Color) {
        this.currentColor = color;
        this.emitAll("set-current-color", this.currentColor, this.currentPlayer);
    }

    public turnEnded(player: Player) {
        this.currentPlayer = this.getNextPlayer(false);
        this.emitAll("set-current-player", this.currentPlayer);
    }

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

    public getCardFromDeck(): Card {
        if (this.deck.size == 0) {
            this.deck = this.auxDeck;
            this.deck.suffle();
            this.auxDeck = new Deck();
        }

        return this.deck.pop();
    }

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

    private unreadyPlayers() {
        this.players.forEach(p => p.ready = false);
    }

    private win() {
        this.winner = this.currentPlayer;
        let newPoints = 0;
        this.players.forEach(p => {
            if (p.id != this.winner.id) {
                let points = this.winner.points;
                let cardPoints = p.getCardPoints();
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

    private getCardCount() {
        let array: any = {};
        this.players.forEach(p => {
            array[p.id] = p.cards.length;
        });

        return array;
    }

    private updateCardCount() {
        this.emitAll("update-card-count", this.getCardCount());
    }

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

    public getSocket(player: Player): Socket {
        return this.sockets[player.id];
    }

    public emit(player: Player, event: string, ... args: any[]) {
        this.getSocket(player).emit(event, ... args);
    }

    public emitAll(event: string, ... args: any[]) {
        this.io.sockets.emit(event, ... args);
    }

    public emitAllBut(player: Player, event: string, ... args: any[]) {
        this.players.forEach(p => {
            if (p.id != player.id) {
                this.emit(p, event, args);
            }
        });
    }
}