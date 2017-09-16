import {Player} from "./Player";
import {Card} from "./Card";
import {Color} from "./Color";

/**
 * La clase Game representa una interfaz común entre el cliente y el servidor.
 * @interface Game
 */
export interface Game {
    /**
     * La propiedad players representa el array de jugadores del juego.
     *
     * @property players
     * @type {Player[]}
     */
    players: Player[];

    /**
     * La propiedad currentPlayer representa el jugador que tiene el turno.
     *
     * @property currentPlayer
     * @type {Player}
     */
    currentPlayer: Player;

    /**
     * La propiedad winner representa el ganador de una ronda o del juego.
     *
     * @property winner
     * @type {Player}
     */
    winner: Player;

    /**
     * La propiedad currentCard representa la carta que está en juego actualmente.
     *
     * @property currentCard
     * @type {Card}
     */
    currentCard: Card;

    /**
     * La propiedad currentColor representa el color que está en juego actualmente.
     *
     * @property currentColor
     * @type {Color}
     */
    currentColor: Color;

    /**
     * La propiedad direction representa el sentido del juego, true si va en sentido horario y false si es antihorario.
     *
     * @property direction
     * @type {boolean}
     */
    direction: boolean;

    /**
     * La propiedad round representa la ronda actual del juego.
     *
     * @property round
     * @type {number}
     */
    round: number;

    /**
     * La función start inicia el juego.
     */
    start: Function;

    /**
     * La función getPlayer recibe una id de jugador y devuelve un objeto de tipo Player.
     *
     * @param {number} id
     * @returns {Player}
     */
    getPlayer(id: number): Player;

    /**
     * La función updatePlayer actualiza un jugador determinado en el array de jugadores.
     *
     * @param {Player} player
     */
    updatePlayer(player: Player): void;

    /**
     * La función selectCard selecciona la carta especificada como carta actual y la elimina de las cartas del jugador.
     *
     * @param {Card} card
     */
    selectCard(card: Card): void;

    /**
     * La función pickFromDeck toma una carta del mazo y se la da al jugador que la solicitó.
     */
    pickFromDeck: Function;

    /**
     * La función sayUno se llama cuando algún jugador dice uno presionando el botón correspondiente.
     * Marca al jugador como que dijo uno y penaliza en caso de tener más de una carta.
     */
    sayUno: Function;

    /**
     * La función didntSayUno se llama cuando algún jugador dice que alguien no dijo uno.
     * Penaliza a los jugadores que no dijeron uno. También al jugador que solicitó si no hay nadie sin decir uno.
     */
    didntSayUno: Function;

    /**
     * La función logOut cierra la sesión de un jugador.
     */
    logOut: Function;
}

/**
 * Contiene constantes globales en el juego.
 *
 * @namespace Constants
 */
export namespace Constants {

    /**
     * Representa el mínimo de jugadores del juego
     *
     * @const minPlayer
     * @type {number}
     */
    export const minPlayers: number = 2;

    /**
     * Representa el máximo de jugadores del juego
     *
     * @const maxPlayers
     * @type {number}
     */
    export const maxPlayers: number = 4;

    /**
     * Representa la cantidad de cartas con las que inicia un jugador
     *
     * @const initialCards
     * @type {number}
     */
    export const initialCards: number = 7;

    /**
     * Representa el mínimo de jugadores del juego
     *
     * @const pageSize
     * @type {number}
     */
    export const pageSize: number = 7;
}