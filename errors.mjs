export const ERROR = {
   TPL_NOT_EXIST: 'tpl-not-exist',
   USING_NOT_EXISTING: 'using-not-existing',
   USING_DIRECTORY: 'using-directory',
};
Object.defineProperties(ERROR, {
   matchAny: {
      enumerable: false,
      value: (string) => {
         for (let prop in ERROR) {
            if (string === ERROR[prop])
               return true;
         }
         return false;
      }
   }
});
