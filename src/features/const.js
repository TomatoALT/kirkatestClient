const current_v = require('../../package.json').version

module.exports.gameLoaded = (urlid) => {
    try {
        if (urlid.includes("https://kirka.io/games/")) {
            return true;
        } else {
            return false;
        }
    } 
    catch(err) {
        console.log(err);
        return false;
    }
}

module.exports.version = current_v;