var assert = require("chai").assert;

var AD = require("ad-utils");
var _ = require("lodash");
var request = null;

describe("OPSPortal.NavBar.cache", function() {
   // before(function(done) {
   //     request = AD.test.request(function(err){
   //         done(err);
   //     });
   // });

   it("values for keys not present are undefined : ", function(done) {
      assert.isUndefined(
         OPSPortal.NavBar.cache("not.there"),
         " unknown key should return undefined"
      );
      done();
   });

   it("able to retrieve values that were set : ", function(done) {
      var values = {
         a: 1,
         b: true,
         c: new Date(),
         d: "dddeee"
      };

      _.forIn(values, function(val, key, obj) {
         OPSPortal.NavBar.cache(key, val);
         assert.strictEqual(
            OPSPortal.NavBar.cache(key),
            val,
            " should return same values"
         );
      });

      done();
   });
});
