type StringOrArray = string | Array<any>;

/**
 * ### Check if a comma exists in the given string.
 *
 * @param {string} str - The string to be checked.
 * @return {boolean} True if a comma exists in the string, false otherwise.  
 * @mysql2-query-manager-helper
 */
export const isCommaExist = (str: string): boolean => {
    return /,/.test(str);
}

/**
 * Checks if the provided string or array is not empty.
 *
 * @param {StringOrArray} data - The data to be checked.
 * @return {boolean} Returns true if the data is not empty, false otherwise.
 */
export const isNotEmpty = (data: StringOrArray): boolean => {
    if (typeof data === 'string') {
        return !!data;
    } else {
        return data.length > 0;
    }
}

/**
 * Takes a string value and prepares it for use, also escapes single quote.
 *
 * @param {string} value - The value to be prepared.
 * @return {string} - The prepared value.
 */
export const prepareValue = (value: string): string => {
    return `'${value.replace(/'/g, `''`)}'`;
}

export default {
    isCommaExist, isNotEmpty, prepareValue
}