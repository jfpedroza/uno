/**
 * Interface Color define metodos y propiedades del objeto Color.
 *
 * @interface Color
 * @version 1.0
 */
export interface Color {

    /**
     * La propiedad code representa el codigo del color.
     *
     * @property code
     * @type {string}
     */
    code: string;
    name: string;
    codeName: string;
}

/**
 * Namespace Colors define un espacio de nombres constantes asociandolos con el objeto Color correspondiente para facilitar su control.
 *
 * @namespace Colors
 */
export namespace Colors {
    /**
     * La constante BLUE representa el color azul de la carta.
     *
     * @const BLUE
     * @type {{name: string; code: string; codeName: string}}
     */
    export const BLUE: Color = {name: "Azul", code: "AZ", codeName: "blue"};
    /**
     * La constante RED representa el color rojo de la carta.
     *
     * @const RED
     * @type {{name: string; code: string; codeName: string}}
     */
    export const RED: Color = {name: "Rojo", code: "R", codeName: "red"};
    /**
     * La constante GREEN representa el color verde de la carta.
     *
     * @const GREEN
     * @type {{name: string; code: string; codeName: string}}
     */
    export const GREEN: Color = {name: "Verde", code: "V", codeName: "green"};
    /**
     * La constante YELLOW representa el color amarillo de la carta.
     *
     * @const YELLOW
     * @type {{name: string; code: string; codeName: string}}
     */
    export const YELLOW: Color = {name: "Amarillo", code: "AM", codeName: "yellow"};
    /**
     * La constante ALL representa el cambio de color de la carta.
     *
     * @const ALL
     * @type {{name: string; code: string; codeName: string}}
     */
    export const ALL: Color = {name: "Todos", code: "", codeName: ""};
}