export interface UnoNotification {
    title?: string;
    message: string;
    type: NotificationType;
    position?: NotificationPosition;
}

export interface NotificationType {
    name: string;
}

export namespace NotificationTypes {
    export const Success: NotificationType = { name: "success"};
    export const Info: NotificationType = { name: "info"};
    export const Warning: NotificationType = { name: "warning"};
    export const Error: NotificationType = { name: "error"};
}

export interface NotificationPosition {
    name: string;
}

export namespace NotifPositions {
    export const TopRight: NotificationPosition = { name: "top-right"};
    export const BottomRight: NotificationPosition = { name: "bottom-right"};
    export const TopLeft: NotificationPosition = { name: "top-left"};
    export const BottomLeft: NotificationPosition = { name: "bottom-left"};
    export const TopCenter: NotificationPosition = { name: "top-center"};
    export const BottomCenter: NotificationPosition = { name: "bottom-center"};
}