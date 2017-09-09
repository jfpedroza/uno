export interface Color {
    code: string;
    name: string;
}

export namespace Colors {
    export const BLUE: Color = {name: "Azul", code: "AZ"};
    export const RED: Color = {name: "Rojo", code: "R"};
    export const GREEN: Color = {name: "Verde", code: "V"};
    export const YELLOW: Color = {name: "Amarillo", code: "AM"};
    export const ALL: Color = {name: "Todos", code: ""};
}