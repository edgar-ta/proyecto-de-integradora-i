/**
 * 
 * @param {string} message 
 * @param {"error" | "information" | "success"} messageType 
 * @returns {string}
 */
export function getMessageParams(message, messageType) {
    return (new URLSearchParams({ message, messageType })).toString();
}
