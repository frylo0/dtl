export function RegExpEscape(string) {
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}