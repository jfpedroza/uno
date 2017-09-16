/**
 * Interface UnoNotification define metodos y propiedades de las notificaciones a implementar.
 *
 * @interface UnoNotification
 * @property title {string}
 * @property message {string}
 * @property type {NotificationType}
 * @property position {NotificationPosition}
 * @version 1.0
 */
export interface UnoNotification {
    title?: string;
    message: string;
    type: NotificationType;
    position?: NotificationPosition;
}

/**
 * Interface NotificationType define metodos y propiedades del tipo notificaciones a implementar.
 *
 * @interface NotificationType
 * @property name {string}
 * @version 1.0
 */
export interface NotificationType {
    name: string;
}

/**
 * Namespace NotificationTypes define constantes y las asocia a objetos para poder accesarlas.
 *
 * @namespace NotificationTypes
 * @const Success
 * @const Info
 * @const Warning
 * @const Error
 * @version 1.0
 */
export namespace NotificationTypes {
    export const Success: NotificationType = { name: "success"};
    export const Info: NotificationType = { name: "info"};
    export const Warning: NotificationType = { name: "warning"};
    export const Error: NotificationType = { name: "error"};
}

/**
 * Interface NotificationPosition define metodos y propiedades de la posición de las notificaciones a implementar.
 *
 * @interface NotificationPosition
 * @property name {string}
 * @version 1.0
 */
export interface NotificationPosition {
    name: string;
}

/**
 * Namespace NotifPositions define constantes y las asocia a objetos para poder accesarlas.
 *
 * @namespace NotifPositions
 * @const TopRight
 * @const BottomRight
 * @const TopLeft
 * @const BottomLeft
 * @const TopCenter
 * @const BottomCenter
 * @version 1.0
 */
export namespace NotifPositions {
    export const TopRight: NotificationPosition = { name: "top-right"};
    export const BottomRight: NotificationPosition = { name: "bottom-right"};
    export const TopLeft: NotificationPosition = { name: "top-left"};
    export const BottomLeft: NotificationPosition = { name: "bottom-left"};
    export const TopCenter: NotificationPosition = { name: "top-center"};
    export const BottomCenter: NotificationPosition = { name: "bottom-center"};
}