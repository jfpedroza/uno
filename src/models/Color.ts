/**
 *
 * Interface Color define metodos y propiedades del objeto Color.
 *
 * @interface Color
 * @property code {string}
 * @property name {string}
 * @property codeName {string}
 * @version 1.0
 */
export interface Color {
    code: string;
    name: string;
    codeName: string;
}

/**
 * Namespace Colors define un espacio de nombres constantes asociandolos con el objeto Color correspondiente para facilitar su control.
 *
 * @namespace Colors
 * @const BLUE [Color} Objeto de tipo Color.
 * @const RED [Color} Objeto de tipo Color.
 * @const GREEN [Color} Objeto de tipo Color.
 * @const YELLOW [Color} Objeto de tipo Color.
 * @const ALL [Color} Objeto de tipo Color.
 */
export namespace Colors {
    export const BLUE: Color = {name: "Azul", code: "AZ", codeName: "blue"};
    export const RED: Color = {name: "Rojo", code: "R", codeName: "red"};
    export const GREEN: Color = {name: "Verde", code: "V", codeName: "green"};
    export const YELLOW: Color = {name: "Amarillo", code: "AM", codeName: "yellow"};
    export const ALL: Color = {name: "Todos", code: "", codeName: ""};
}