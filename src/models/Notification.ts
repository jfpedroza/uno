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
 * Interface NotificationType define un tipo de notificación.
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
     * @type {NotificationType}
     */
    export const Success: NotificationType = { name: "success"};
    /**
     * La constante Info representa el tipo de la notificación.
     *
     * @const Info
     * @type {NotificationType}
     */
    export const Info: NotificationType = { name: "info"};
    /**
     * La constante Warning representa el tipo de la notificación.
     *
     * @const Warning
     * @type {NotificationType}
     */
    export const Warning: NotificationType = { name: "warning"};
    /**
     * La constante Error representa el tipo de la notificación.
     *
     * @const Error
     * @type {NotificationType}
     */
    export const Error: NotificationType = { name: "error"};
}

/**
 * Interface NotificationPosition define una posición de notificación.
 *
 * @interface NotificationPosition
 * @property name {string}
 * @version 1.0
 */
export interface NotificationPosition {

    /**
     * La propiedad name representa el nombre de la posición de notificación.
     *
     * @property name
     * @type {string}
     */
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
     * @type {NotificationPosition}
     */
    export const TopRight: NotificationPosition = { name: "top-right"};

    /**
     * La constate BottomRight representa la posición de la notificación.
     *
     * @const BottomRight
     * @type {NotificationPosition}
     */
    export const BottomRight: NotificationPosition = { name: "bottom-right"};

    /**
     * La constate TopLeft representa la posición de la notificación.
     *
     * @const TopLeft
     * @type {NotificationPosition}
     */
    export const TopLeft: NotificationPosition = { name: "top-left"};

    /**
     * La constate BottomLeft representa la posición de la notificación.
     *
     * @const BottomLeft
     * @type {NotificationPosition}
     */
    export const BottomLeft: NotificationPosition = { name: "bottom-left"};

    /**
     * La constate TopCenter representa la posición de la notificación.
     *
     * @const TopCenter
     * @type {NotificationPosition}
     */
    export const TopCenter: NotificationPosition = { name: "top-center"};

    /**
     * La constate BottomCenter representa la posición de la notificación.
     *
     * @const BottomCenter
     * @type {NotificationPosition}
     */
    export const BottomCenter: NotificationPosition = { name: "bottom-center"};
}