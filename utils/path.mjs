import path from 'path';

export function relatizePath(filenameAbs) {
   return path.relative(process.cwd(), filenameAbs);
}
