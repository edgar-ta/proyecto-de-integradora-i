
/**
 * Renames an object's property in place
 * 
 * @param {Object} object 
 * @param {string} previousName 
 * @param {string} newName 
 */
export default function renameProperty(object, previousName, newName) {
    if (previousName in object) {
        const value = object[previousName];
        delete object[previousName];
        object[newName] = value;
        return;
    }
    throw new Error(`The key '${previousName}' is not present in the object. The object has keys ${Object.keys(object)}`);
}

