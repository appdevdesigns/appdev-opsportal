module.exports = {
   "env": {
      "node": true,
      "browser": true,
      "jquery": true
   },

   "parserOptions": {
      "ecmaVersion": 8,
      "sourceType": "module"
   },

   globals: {
      "_": "readonly",
      "AB": "readonly",
      "ABApplication": "readonly",
      "AD": "readonly",
      "can": "readonly",
      "cordova" : "readonly",
      "Countly" : "readonly",
      "Dropzone" : "readonly",
      "EXIF" : "readonly",
      "Framework7": "readonly",
      "OP": "readonly",
      "steal": "readonly",
      "System": "readonly",
      "webix": "readonly",
      "$$": "readonly"
   },

   // "parser": "babel-eslint",
   extends: ["eslint:recommended", "prettier"], // extending recommended config and config derived from eslint-config-prettier
   plugins: ["prettier"], // activating esling-plugin-prettier (--fix stuff)
   rules: {
      "prettier/prettier": [
         // customizing prettier rules (unfortunately not many of them are customizable)
         "error",
         {
            "arrowParens": "always",
            "endOfLine": "lf",
            "printWidth": 80,
            "tabWidth": 3
         }
      ],
      "no-console": 0, // "off", 
      // eqeqeq: ["error", "always"] // adding some custom ESLint rules
   }
};
