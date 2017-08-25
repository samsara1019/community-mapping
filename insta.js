// AMD
require(["instafeed"], function(Instafeed) {

});

// CommonJS
var Instafeed = require("instafeed");

var feed = new Instafeed({
    get: 'tagged',
    tagName: 'awesome',
    clientId: '1575647334.2918651.a2a7d4ed49d54162bf2aa709dbbd8851',
    template: '<a href="{{link}}"><img src="{{image}}" /></a>'
});
feed.run();