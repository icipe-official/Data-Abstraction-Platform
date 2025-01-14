/**
 * Regular expression to extract object keys and array indexes from path string into an array of strings using built-in string match function.
 *
 * Example: `'8.childobject.array.[2][3].childobject'.match(new RegExp(/[^\.\[\]]+/, 'g'))` results in the array `["8","childobject","array","2","3","childobject"]`
 */
export const KEY_ARRAY_INDEX_REGEX = new RegExp(/[^\.\[\]]+/, 'g')

