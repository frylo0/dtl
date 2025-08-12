export const ERROR = {
   TPL_NOT_EXIST: 'tpl-not-exist',
   USING_NOT_EXISTING: 'using-not-existing',
   USING_DIRECTORY: 'using-directory',
   COMBINE_PATH_NAME_PATH_ARG: 'combine-path-name-path-arg',
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
