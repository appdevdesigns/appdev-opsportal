
var path = require('path');
var fs = require('fs');
var AD = require('ad-utils');

(function() {

    var localOptions = {};

    // if there is a local options.js file, use that instead
    var pathOptions = path.join(__dirname,  'options.js');
    if (fs.existsSync(pathOptions)) {
        localOptions = require(pathOptions);
    }

    AD.module.setup(localOptions);

})();


// countly-sdk-web is a dependency listed in package.json
// On some installations, it may be installed in the 'appdev-opsportal' tree.
// On other installations, it may be installed in the base sails tree.
// Need to check both and create the symlink accordingly.

var modulePath = path.join(__dirname, '..');
var deepCountlyPath = path.join(modulePath, 'node_modules', 'countly-sdk-web');
var flatCountlyPath = path.join(modulePath, '..', 'countly-sdk-web');
var symlinkPath = path.join(modulePath, '..', '..', 'assets', 'countly-sdk-web');

if (fs.existsSync(deepCountlyPath)) {
    fs.symlinkSync(deepCountlyPath, symlinkPath, 'dir');
}
else if (fs.existsSync(flatCountlyPath)) {
    fs.symlinkSync(flatCountlyPath, symlinkPath, 'dir');
}
else {
    console.log('Could not locate the "countly-sdk-web" module');
}
