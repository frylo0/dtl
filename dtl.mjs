/** 
 * @package Directory TempLate creator
 */

/*
 * Author:  Fedor Nikonov (fritylo)
 * Date:    03.05.2022 16:05:46
 * Company: frity corp.
 */

import fs from 'fs';
import process from 'process';

const argv = process.argv.slice(2);
const tplSourceDir = '~/directory-templates';

function main() {
   const dump = d => console.log(...(Object.entries(d).map(([n, v], i, arr) => [i !== 0 ? '\n' : '', `• ${n} =`, v])).reduce((p, c) => p.concat(c)));
   dump({argv});
}

main();
