export interface Color {
    code: string;
    name: string;
    codeName: string;
}

export namespace Colors {
    export const BLUE: Color = {name: "Azul", code: "AZ", codeName: "blue"};
    export const RED: Color = {name: "Rojo", code: "R", codeName: "red"};
    export const GREEN: Color = {name: "Verde", code: "V", codeName: "green"};
    export const YELLOW: Color = {name: "Amarillo", code: "AM", codeName: "yellow"};
    export const ALL: Color = {name: "Todos", code: "", codeName: ""};
}