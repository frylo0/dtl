export function kebabcase(str) {
   return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
}

export function camelcase(str) {
   return str.slice(0, 1).toLowerCase() + str.slice(1);
}

export function lowercase(name) {
    return name.toLowerCase();
}

export function uppercase(name) {
    return name.toUpperCase();
}