module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "globals": {
        "$": false,
        "jQuery": false,
        "google": false,
        "Chart": false,
        "id": false
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": 2,
        "linebreak-style": [2, "unix"],
        "quotes": [2, "double"],
        "semi": [2, "always"],
        "no-console": 2
    }
};