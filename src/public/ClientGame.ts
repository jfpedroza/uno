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

export class ClientGame implements Game {

    public socket: Socket;
    public players: Player[] = [];
    public player: Player;
    public currentPlayer: Player;
    public winner: Player;
    public currentCard: Card;
    public currentColor: Color;
    public direction: boolean = true;
    public round: number = 1;
    public stage: number = 1;
    public page: number = 1;
    public cardCounts: any;
    public nameEditable = true;
    public ui: UIHelper;
    public static instance: ClientGame;

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

    public setNewPlayer() {
        this.player = new Player(new Date().getTime(), "New Player");
        this.socket.emit("new-player", this.player);
    }

    public start() {
        this.socket.emit("start", this.player);
    }

    public startGame(ply: Player, currentCard: Card, currentColor: Color, direction: boolean, round: number) {
        this.player = ply;
        this.player.cards = Utils.createCards(ply.cards);
        this.currentCard = Utils.createCard(currentCard);
        this.currentColor = currentColor;
        this.direction = direction;
        this.setRound(round);
    }

    public getPlayer(id: number): Player {
        const result = this.players.filter(p => p.id == id);
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    }

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

    public setPlayerName(name: string) {
        this.player.name = name;
        this.socket.emit("update-player", this.player);
    }

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

    public setDirection(dir: boolean) {
        this.direction = dir;
        this.ui.renderDirection();
    }

    public selectCard(card: Card) {
        this.socket.emit("select-card", card);

        if (card.type == CardType.PlusFour || card.type == CardType.ColorChange) {
            this.ui.openChooseColorModal();
        }
    }

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

    public pickFromDeck() {
        this.socket.emit("pick-from-deck", this.player);
    }

    public sayUno() {
        this.socket.emit("say-uno", this.player);
    }

    public didntSayUno() {
        this.socket.emit("didnt-say-uno", this.player);
    }

    public setStage(stage: number) {
        this.ui.setStage(this.stage, stage);
        this.stage = stage;
    }

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

    public setRound(r: number) {
        this.round = r;
        $("#round").html(`Round: ${this.round}`);
    }

    public renderCardCounts() {
        this.players.forEach(p => {
            let id = `#player-${p.id}`;
            if (this.player.id == p.id) {
                id = "#my-player";
            }

            this.ui.animateNumber($(`${id} .player-card-number`), this.cardCounts[p.id], 300);
        });
    }

    public logOut() {
        this.socket.emit("log-out", this.player);
        location.reload(true);
    }

    public restart() {
        this.socket.emit("restart");
    }

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