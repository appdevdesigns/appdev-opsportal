var assert = require("chai").assert;

var AD = require("ad-utils");
var _ = require("lodash");
var request = null;

var oldLog = null;

describe("OPSPortal.NavBar.Area.exists", function() {
   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      // request = AD.test.request(function(err){
      //     done(err);
      // });
      done();
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   it("should return true for our defined test area : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.Area.exists("test-area", function(err, isThere) {
         assert.isNull(err, " should not have returned an error.");
         assert.isBoolean(isThere, " should have returned a bool ");
         assert.ok(isThere, " should have found our entry.");
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(isThere) {
            assert.isBoolean(isThere, " should have returned a bool ");
            assert.ok(isThere, " should have found our entry.");
            onDone();
         });
   });

   it("should return false for undefined test areas : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.Area.exists("test-area-not-here", function(
         err,
         isThere
      ) {
         assert.isNull(err, " should not have returned an error.");
         assert.isBoolean(isThere, " should have returned a bool ");
         assert.isNotOk(isThere, " should not have found our entry.");
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(isThere) {
            assert.isBoolean(isThere, " should have returned a bool ");
            assert.isNotOk(isThere, " should not have found our entry.");
            onDone();
         });
   });
});

describe("OPSPortal.NavBar.Area.create", function() {
   var newEntry = {
      key: "test-area-new-entry",
      icon: "fa-cubes",
      isDefault: 0,
      label: "opp.areaTest",
      context: "opsportal"
   };

   var numEntries = 0;

   function findNumEntries(cb) {
      OPConfigArea.find().exec(function(err, areas) {
         cb(err, areas.length);
      });
   }

   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      findNumEntries(function(err, length) {
         numEntries = length;
         done();
      });
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // it should create a new entry
   it("should create a new entry : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // now make sure that our num Entries have increased:
            findNumEntries(function(err, length) {
               assert.equal(
                  length,
                  numEntries + 1,
                  " should have another entry in DB "
               );
               numEntries = length; // update expected numEntries
               done();
            });
         }
      }

      OPSPortal.NavBar.Area.create(newEntry, function(err, newArea) {
         assert.isNull(err, " should not have returned an error.");
         assert.isDefined(newArea, " should have returned the new area ");
         assert.equal(newEntry.key, newArea.key, " matching keys.");
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(newArea) {
            assert.isDefined(newArea, " should have returned the new area ");
            assert.equal(newEntry.key, newArea.key, " matching keys.");
            onDone();
         });
   });

   // it should fail silently if trying to create an entry that already exists
   it("should fail silently if trying to create an entry that already exists : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // now make sure that our num Entries have NOT increased:
            findNumEntries(function(err, length) {
               assert.equal(
                  length,
                  numEntries,
                  " should NOT have another entry in DB "
               );
               done();
            });
         }
      }

      OPSPortal.NavBar.Area.create(newEntry, function(err, newArea) {
         assert.isNull(err, " should not have returned an error.");
         assert.isNull(newArea, " should not have returned a new area.");
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(newArea) {
            assert.isNull(newArea, " should not have returned a new area.");
            onDone();
         });
   });

   // it should return an error if areaDef is not provided
   it("should return an error if areaDef is not provided : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.Area.create(function(err, newArea) {
         assert.isNotNull(err, " should have returned an error.");
         assert.equal(
            err.code,
            "E_MISSINGPARAM",
            " error should have code: E_MISSINGPARAM "
         );
         assert.isUndefined(newArea, " should not have returned a new area.");
         onDone();
      })
         .fail(function(err) {
            assert.isNotNull(err, " should have returned an error.");
            assert.equal(
               err.code,
               "E_MISSINGPARAM",
               " error should have code: E_MISSINGPARAM "
            );
            onDone();
         })
         .then(function(newArea) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });
});

describe("OPSPortal.NavBar.Area.link", function() {
   var linkDef = {
      keyArea: "test-area",
      keyTool: "test-existing-tool",
      instance: {
         icon: "fa-icon-new",
         permissions: "adcore.admin,adcore.developer",
         options: { is: "there" }
      }
   };

   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      done();
   });
   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // it should return an error if missing linkDef
   it("should return an error if missing linkDef : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.Area.link(function(err) {
         assert.isNotNull(err, " should have returned an error.");
         assert.equal(
            err.code,
            "E_MISSINGPARAM",
            " error should have code: E_MISSINGPARAM "
         );
         onDone();
      })
         .fail(function(err) {
            assert.isNotNull(err, " should have returned an error.");
            assert.equal(
               err.code,
               "E_MISSINGPARAM",
               " error should have code: E_MISSINGPARAM "
            );
            onDone();
         })
         .then(function() {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });

   // it should return an error if missing .keyArea, .keyTool, or .instance params
   it("should return an error if missing .keyArea, .keyTool, or .instance params : ", function(done) {
      var fieldsToTest = ["keyArea", "keyTool", "instance"];

      // recursiveTest
      // test each key in sequence.
      function recursiveTest(list, cb) {
         if (list.length == 0) {
            cb();
         } else {
            var numCalled = 0;
            function currentDone() {
               // make sure we process both the cb() and dfd returns
               // before continuing.

               numCalled++;
               if (numCalled >= 2) {
                  recursiveTest(list, cb);
               }
            }

            var field = list.shift();
            var currLinkDef = _.clone(linkDef);
            delete currLinkDef[field];
            OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
               assert.isNotNull(err, " should have returned an error.");
               assert.equal(
                  err.code,
                  "E_MISSINGPARAM",
                  " error should have code: E_MISSINGPARAM "
               );
               currentDone();
            })
               .fail(function(err) {
                  assert.isNotNull(err, " should have returned an error.");
                  assert.equal(
                     err.code,
                     "E_MISSINGPARAM",
                     " error should have code: E_MISSINGPARAM "
                  );
                  currentDone();
               })
               .then(function() {
                  assert.ok(false, " should not have gotten here.");
                  currentDone();
               });
         }
      }

      recursiveTest(fieldsToTest, function() {
         // all tests should have completed
         done();
      });
   });

   // it should return an error if .keyArea not found
   it("should return an error if .keyArea not found : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      var currLinkDef = _.clone(linkDef);
      currLinkDef.keyArea = "area-not-here";

      OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
         assert.isNotNull(err, " should have returned an error.");
         assert.equal(
            err.code,
            "E_AREANOTFOUND",
            " error should have code: E_AREANOTFOUND "
         );
         onDone();
      })
         .fail(function(err) {
            assert.isNotNull(err, " should have returned an error.");
            assert.equal(
               err.code,
               "E_AREANOTFOUND",
               " error should have code: E_AREANOTFOUND "
            );
            onDone();
         })
         .then(function() {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });

   // it should return an error if .keyTool not found
   it("should return an error if .keyTool not found : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      var currLinkDef = _.clone(linkDef);
      currLinkDef.keyTool = "tool-not-here";

      OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
         assert.isNotNull(err, " should have returned an error.");
         assert.equal(
            err.code,
            "E_TOOLNOTFOUND",
            " error should have code: E_TOOLNOTFOUND "
         );
         onDone();
      })
         .fail(function(err) {
            assert.isNotNull(err, " should have returned an error.");
            assert.equal(
               err.code,
               "E_TOOLNOTFOUND",
               " error should have code: E_TOOLNOTFOUND "
            );
            onDone();
         })
         .then(function() {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });

   // it should create a new Tool instance when not already connected to an Area
   it("should create a new Tool instance when not already connected to an Area : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            checkAreaLink(done);
         }
      }

      var currLinkDef = _.clone(linkDef);

      OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
         assert.isUndefined(err, " should not have returned an error.");
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function() {
            assert.ok(true, " should have gotten here. ");
            onDone();
         });

      function checkAreaLink(cb) {
         OPConfigArea.find({ key: currLinkDef.keyArea })
            .populateAll()
            .exec(function(err, areas) {
               assert.isNull(err, "this should not be an error.");
               assert.isDefined(areas, " should have gotten a result");
               assert.isDefined(areas[0], " should have found a result");
               assert.isDefined(
                  areas[0].tools,
                  " should have some tools defined"
               );

               var isFound = false;
               _.forEach(areas[0].tools, function(tool) {
                  if (tool.key == currLinkDef.keyTool) {
                     isFound = true;
                  }
               });

               assert.ok(isFound, " should have found the linked tool! ");

               cb();
            });
      }
   });

   // it current tool instance's permissions should have matched exactly with our linkDef
   it("current tool instance's permissions should have matched exactly with our linkDef : ", function(done) {
      var currLinkDef = _.clone(linkDef);

      verifyPermissionsMatch(currLinkDef, done);
   });

   // it should UPDATE an existing Tool instance if already connected to an Area
   it("should UPDATE an existing Tool instance if already connected to an Area: ", function(done) {
      var numTools = 0;
      function getNumTools(cb) {
         OPConfigTool.find().exec(function(err, tools) {
            cb(err, tools.length);
         });
      }

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            getNumTools(function(err, length) {
               assert.equal(
                  numTools,
                  length,
                  " should not have created another Tool Instance"
               );

               // now verify updated values
               getToolInstance(currLinkDef, function(err, tool) {
                  _.forIn(newValues, function(val, key) {
                     assert.equal(
                        tool[key],
                        currLinkDef.instance[key],
                        " should have updated our icon value"
                     );
                  });

                  verifyPermissionsMatch(currLinkDef, done);
               });
            });
         }
      }

      var currLinkDef = _.clone(linkDef);
      var newValues = {
         icon: "new.icon",
         isDefault: 1,
         isController: 1
      };
      _.forIn(newValues, function(val, key) {
         currLinkDef.instance[key] = val;
      });

      // handle change in permissions seperatly
      currLinkDef.instance.permissions = "adcore.admin,opsportal.view";

      getNumTools(function(err, length) {
         numTools = length;

         OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
            assert.isUndefined(err, " should not have returned an error.");
            onDone();
         })
            .fail(function(err) {
               assert.ok(false, " should not have gotten here.");
               onDone();
            })
            .then(function() {
               assert.ok(true, " should have gotten here. ");
               onDone();
            });
      });
   });

   // it should MERGE provided .instance.options to existing tool instance
   it("should MERGE provided .instance.options to existing tool instance: ", function(done) {
      var orignialOptions = {};

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // now verify updated values
            getToolInstance(currLinkDef, function(err, tool) {
               _.forIn(newValues, function(val, key) {
                  assert.equal(
                     tool.options[key],
                     newValues[key],
                     " should have updated our icon value"
                  );
               });

               _.forIn(orignialOptions, function(v, k) {
                  if (_.isUndefined(newValues[k])) {
                     assert.equal(
                        tool.options[k],
                        orignialOptions[k],
                        " should not have updated an original value"
                     );
                  }
               });

               done();
            });
         }
      }

      var currLinkDef = _.clone(linkDef);
      var newValues = {
         is: "different",
         also: "this"
      };
      currLinkDef.instance.options = newValues;

      getToolInstance(currLinkDef, function(err, tool) {
         orignialOptions = tool.options;

         OPSPortal.NavBar.Area.link(currLinkDef, function(err) {
            assert.isUndefined(err, " should not have returned an error.");
            onDone();
         })
            .fail(function(err) {
               assert.ok(false, " should not have gotten here.");
               onDone();
            })
            .then(function() {
               assert.ok(true, " should have gotten here. ");
               onDone();
            });
      });
   });
});

//////
////// Some Utility fn()
//////

function getToolInstance(def, cb) {
   OPConfigArea.find({ key: def.keyArea })
      .populateAll()
      .exec(function(err, areas) {
         var foundTool = null;
         _.forEach(areas[0].tools, function(tool) {
            if (tool.key == def.keyTool) {
               foundTool = tool;
            }
         });

         if (foundTool) {
            OPConfigTool.find({ id: foundTool.id })
               .populateAll()
               .exec(function(err, tools) {
                  cb(err, tools[0]);
               });
         } else {
            cb(err, foundTool);
         }
      });
}

function getPermissionArray(toolInstance, cb) {
   var perms = [];
   _.forEach(toolInstance.permissions, function(permission) {
      perms.push(permission.action_key);
   });
   cb(null, perms);
}

function verifyPermissionsMatch(def, cb) {
   // get the tool instance from this definition
   getToolInstance(def, function(err, tool) {
      // get the permission key array from this tool
      getPermissionArray(tool, function(err, currPermissions) {
         // verifty they match the definition

         var expectedPermissions = _.map(
            def.instance.permissions.split(","),
            function(value) {
               return value.trim();
            }
         );

         assert.lengthOf(
            _.difference(expectedPermissions, currPermissions),
            0,
            " should not be any unused expected permissions. "
         );
         assert.lengthOf(
            _.difference(currPermissions, expectedPermissions),
            0,
            " should not be any additional current permissions. "
         );
         cb();
      });
   });
}
