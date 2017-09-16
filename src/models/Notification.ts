/**
 * @author Kevin Serrano <kevinjsa2708@gmail.com>
 */

/**
 * Interface UnoNotification define metodos y propiedades de las notificaciones a implementar.
 *
 * @interface UnoNotification
 * @version 1.0
 */
export interface UnoNotification {

    /**
     * La propiedad title representa el titulo de la notificación.
     *
     * @property title
     * @type {string}
     */
    title?: string;

    /**
     * La propiedad message representa el mensaje de la notificación.
     *
     * @property message
     * @type {string}
     */
    message: string;

    /**
     * La propiedad type representa el tipo de la notificación.
     *
     * @property type
     * @type {NotificationType}
     */
    type: NotificationType;

    /**
     * La propiedad position representa la posición de la notificación.
     *
     * @property position
     * @type {NotificationPosition}
     */
    position?: NotificationPosition;
}

/**
 * Interface NotificationType define metodos y propiedades del tipo notificaciones a implementar.
 *
 * @interface NotificationType
 * @version 1.0
 */
export interface NotificationType {

    /**
     * La propiedad name representa el nombre del tipo de notificación.
     *
     * @property name
     * @type {string}
     */
    name: string;
}

/**
 * Namespace NotificationTypes define constantes y las asocia a objetos para poder accesarlas.
 *
 * @namespace NotificationTypes
 * @version 1.0
 */
export namespace NotificationTypes {
    /**
     * La constante Success representa el tipo de la notificación.
     *
     * @const Success
     * @type {{name: string}}
     */
    export const Success: NotificationType = { name: "success"};
    /**
     * La constante Info representa el tipo de la notificación.
     *
     * @const Info
     * @type {{name: string}}
     */
    export const Info: NotificationType = { name: "info"};
    /**
     * La constante Warning representa el tipo de la notificación.
     *
     * @const Warning
     * @type {{name: string}}
     */
    export const Warning: NotificationType = { name: "warning"};
    /**
     * La constante Error representa el tipo de la notificación.
     *
     * @const Error
     * @type {{name: string}}
     */
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
 * @version 1.0
 */
export namespace NotifPositions {

    /**
     * La constate TopRight representa la posición de la notificación.
     *
     * @const TopRight
     * @type {{name: string}}
     */
    export const TopRight: NotificationPosition = { name: "top-right"};

    /**
     * La constate BottomRight representa la posición de la notificación.
     *
     * @const BottomRight
     * @type {{name: string}}
     */
    export const BottomRight: NotificationPosition = { name: "bottom-right"};

    /**
     * La constate TopLeft representa la posición de la notificación.
     *
     * @const TopLeft
     * @type {{name: string}}
     */
    export const TopLeft: NotificationPosition = { name: "top-left"};

    /**
     * La constate BottomLeft representa la posición de la notificación.
     *
     * @const BottomLeft
     * @type {{name: string}}
     */
    export const BottomLeft: NotificationPosition = { name: "bottom-left"};

    /**
     * La constate TopCenter representa la posición de la notificación.
     *
     * @const TopCenter
     * @type {{name: string}}
     */
    export const TopCenter: NotificationPosition = { name: "top-center"};

    /**
     * La constate BottomCenter representa la posición de la notificación.
     *
     * @const BottomCenter
     * @type {{name: string}}
     */
    export const BottomCenter: NotificationPosition = { name: "bottom-center"};
}