var assert = require("chai").assert;

var AD = require("ad-utils");
var _ = require("lodash");
var path = require("path");
var request = null;

var oldLog = null;

// sample ToolDef to use in our Unit Test transactions.
var ToolDef = {
   key: "test.definition",
   permissions: "test.perm.1,test.perm.2",
   icon: "fa-test",
   label: "test.label",
   context: "test.context",
   controller: "TextController",
   isController: true,
   options: {},
   version: "0"
};

describe("OPSPortal.NavBar.ToolDefinition.create", function() {
   function verifyNewDef(newDef, refDef) {
      if (_.isUndefined(refDef)) {
         refDef = ToolDef;
      }
      assert.isNotNull(
         newDef,
         " should have returned a definition object that is not null"
      );
      assert.isDefined(newDef, " should have returned a definition object ");
      assert.equal(newDef.key, refDef.key, " definition should match ToolDef");
   }

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

   // should fail if the def object is not provided.
   it("should fail if the def object is not provided : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.ToolDefinition.create(function(err) {
         assert.isDefined(err, " should have returned an error.");
         assert.isNotNull(
            err,
            " should have returned an error that is not null"
         );
         assert.isDefined(err.code, " should have a code returned. ");
         assert.equal(
            err.code,
            "E_MISSINGPARAM",
            " should return code: E_MISSINGPARAM"
         );
         onDone();
      })
         .fail(function(err) {
            assert.ok(true, " should have gotten here.");
            onDone();
         })
         .then(function(isThere) {
            assert.ok(false, "should not have gotten here.");
            onDone();
         });
   });

   // it should fail if the required fields are not set:
   it("should fail if the required fields are not set : ", function(done) {
      var numChecked = 0;

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= numChecked) {
            assert.ok(true, " all checks failed! ");
            done();
         }
      }

      var ignoreFields = ["id", "createdAt", "updatedAt"];
      var fields = _.keys(sails.models.opconfigtooldefinition.attributes);

      fields.forEach(function(field) {
         if (ignoreFields.indexOf(field) == -1) {
            var currDef = _.clone(ToolDef);
            delete currDef[field];

            numChecked++;

            // make this async, so our counters are only == after all calls are made.
            _.delay(function() {
               OPSPortal.NavBar.ToolDefinition.create(currDef, function(
                  err,
                  createdDefinition
               ) {
                  assert.isDefined(err, " error object should be defined. ");
                  assert.isNotNull(err, " error object should not be null. ");

                  if (err) {
                     onDone();
                  } else {
                     assert.ok(false, " should have returned an error.");
                  }
               });
            }, 25);
         }
      });
   });

   // only creates a new definition if the toolDef doesn't already exist
   // returns a definition if created
   it("only creates a new definition if the toolDef.key doesn't already exist : ", function(done) {
      var numEntries = 0;

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // count of entries should have increased:
            AD.test.model.count(OPConfigToolDefinition, function(err, count) {
               if (err) {
                  done(err);
               } else {
                  assert.ok(
                     count > numEntries,
                     " should have created another entry."
                  );
                  done();
               }
            });
         }
      }

      // function verifyNewDef (newDef) {
      //     assert.isNotNull( newDef, ' should have returned a definition object that is not null');
      //     assert.isDefined( newDef, ' should have returned a definition object ');
      //     assert.equal(newDef.key, ToolDef.key, ' definition should match ToolDef');
      // }

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.

            OPSPortal.NavBar.ToolDefinition.create(ToolDef, function(
               err,
               newDef
            ) {
               assert.isNull(err, " error object should be null. ");
               verifyNewDef(newDef);
               onDone();
            })
               .fail(function(err) {
                  assert.ok(false, " should not have gotten here.");
                  onDone();
               })
               .then(function(newDef) {
                  verifyNewDef(newDef);
                  onDone();
               });
         }
      });
   });

   // doesn't create a new entry if toolDef.key already exists
   // returns a definition if not created.
   it("doesn't create a new entry if toolDef.key already exists : ", function(done) {
      var numEntries = 0;

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // count of entries should have increased:
            AD.test.model.count(OPConfigToolDefinition, function(err, count) {
               if (err) {
                  done(err);
               } else {
                  assert.ok(
                     count == numEntries,
                     " should NOT have created another entry."
                  );
                  done();
               }
            });
         }
      }

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.
            var currDef = _.clone(ToolDef);
            currDef.key = "test-existing-tool"; // same as what is already in fixture
            OPSPortal.NavBar.ToolDefinition.create(currDef, function(
               err,
               newDef
            ) {
               assert.isNull(err, " error object should be null. ");
               verifyNewDef(newDef, currDef);
               onDone();
            })
               .fail(function(err) {
                  assert.ok(false, " should not have gotten here.");
                  onDone();
               })
               .then(function(newDef) {
                  verifyNewDef(newDef, currDef);
                  onDone();
               });
         }
      });
   });
});

describe("OPSPortal.NavBar.ToolDefinition.exists", function() {
   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      done();
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // should return true if .key already exists
   it("should return true if .key already exists : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.ToolDefinition.exists(ToolDef.key, function(
         err,
         isThere
      ) {
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

   // should return false if .key doesn't already exist
   it("should return false if .key doesn't already exist : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.ToolDefinition.exists(
         ToolDef.key + "not-there",
         function(err, isThere) {
            assert.isNull(err, " should not have returned an error.");
            assert.isBoolean(isThere, " should have returned a bool ");
            assert.isNotOk(isThere, " should not have found an entry.");
            onDone();
         }
      )
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(isThere) {
            assert.isBoolean(isThere, " should have returned a bool ");
            assert.isNotOk(isThere, " should not have found an entry.");
            onDone();
         });
   });
});

describe("OPSPortal.NavBar.ToolDefinition.setup", function() {
   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      done();
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // should return an error if called without any defs
   it("should return an error if called without any defs : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.ToolDefinition.setup(function(err) {
         assert.isDefined(err, " should have returned an error.");
         assert.isNotNull(
            err,
            " should have returned an error that is not null"
         );
         onDone();
      })
         .fail(function(err) {
            assert.ok(true, " should have gotten here.");
            onDone();
         })
         .then(function(isThere) {
            assert.ok(false, "should not have gotten here.");
            onDone();
         });
   });

   // should be able to process a single def value
   // a new entry should be created!
   it(" should be able to process a single def value : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // a new entry should be created!
            AD.test.model.count(OPConfigToolDefinition, function(err, count) {
               if (err) {
                  done(err);
               } else {
                  assert.ok(
                     count > numEntries,
                     " should have created another entry."
                  );
                  done();
               }
            });
         }
      }

      var numEntries = 0;

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.

            var currDef = _.clone(ToolDef);
            currDef.key += ".setup.single";

            OPSPortal.NavBar.ToolDefinition.setup(currDef, function(err) {
               assert.isNull(err, " should not have returned an error");
               onDone();
            })
               .fail(function(err) {
                  assert.ok(false, " should not have gotten here.");
                  onDone();
               })
               .then(function() {
                  assert.ok(true, "should have gotten here.");
                  onDone();
               });
         }
      });
   });

   // should be able to process an array of def values
   // an existing entry should not be created
   // new entries should be created
   // but an existing entry with a new version should be updated!
   it(" should be able to process an array of def values : ", function(done) {
      // this entry is same as already existing, so no new one created:
      var currDef1 = _.clone(ToolDef);
      currDef1.key += ".setup.single";
      currDef1.version = "1"; // but existing entry should be updated.

      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // a new entry should be created!
            AD.test.model.count(OPConfigToolDefinition, function(err, count) {
               if (err) {
                  done(err);
               } else {
                  assert.ok(
                     count == numEntries + 1,
                     " should have created 1 entry."
                  );

                  // but an existing entry with a new version should be updated!
                  OPConfigToolDefinition.find({ key: currDef1.key }).exec(
                     function(err, list) {
                        if (err) {
                           done(err);
                        } else {
                           assert.isArray(list, " should have found results ");
                           assert.isDefined(
                              list[0],
                              " should have found our entry"
                           );
                           assert.equal(
                              list[0].version,
                              currDef1.version,
                              " should have updated our version"
                           );
                           done();
                        }
                     }
                  );
               }
            });
         }
      }

      var numEntries = 0;

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.

            // this one is new, so it should be created.
            var currDef2 = _.clone(ToolDef);
            currDef2.key += ".setup.array";

            var values = [currDef1, currDef2];

            OPSPortal.NavBar.ToolDefinition.setup(values, function(err) {
               assert.isNull(err, " should not have returned an error");
               onDone();
            })
               .fail(function(err) {
                  assert.ok(false, " should not have gotten here.");
                  onDone();
               })
               .then(function() {
                  assert.ok(true, "should have gotten here.");
                  onDone();
               });
         }
      });
   });

   // should handle an empty array of values.
   // should not result in an error.
   it(" should handle an empty array of values : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            // a new entry should be created!
            AD.test.model.count(OPConfigToolDefinition, function(err, count) {
               if (err) {
                  done(err);
               } else {
                  assert.ok(
                     count == numEntries,
                     " should not have created an entry."
                  );
                  done();
               }
            });
         }
      }

      var numEntries = 0;

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.

            var values = [];

            OPSPortal.NavBar.ToolDefinition.setup(values, function(err) {
               assert.isNull(err, " should not have returned an error");
               onDone();
            })
               .fail(function(err) {
                  assert.ok(false, " should not have gotten here.");
                  onDone();
               })
               .then(function() {
                  onDone();
               });
         }
      });
   });
});

describe("OPSPortal.NavBar.ToolDefinition.setupPath", function() {
   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      done();
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // should fail if no path provided
   it("should fail if no path provided : ", function(done) {
      OPSPortal.NavBar.ToolDefinition.setupPath(function(err) {
         assert.isDefined(err, " should have returned an error.");
         assert.isNotNull(
            err,
            " should have returned an error that is not null"
         );
         assert.isDefined(err.code, " should have a code returned. ");
         assert.equal(
            err.code,
            "E_MISSINGPARAM",
            " should return code: E_MISSINGPARAM"
         );
         done();
      });
   });

   // should fail if path doesn't exist
   it("should fail if path doesn't exist : ", function(done) {
      OPSPortal.NavBar.ToolDefinition.setupPath(
         path.join("not", "there.js"),
         function(err) {
            assert.isDefined(err, " should have returned an error.");
            assert.isNotNull(
               err,
               " should have returned an error that is not null"
            );
            done();
         }
      );
   });

   // should load new definitions if path exists
   it("should load new definitions if path exists : ", function(done) {
      var numEntries = 0;

      AD.test.model.count(OPConfigToolDefinition, function(err, count) {
         if (err) {
            done(err);
         } else {
            numEntries = count; // starting number of entries.

            OPSPortal.NavBar.ToolDefinition.setupPath(
               path.join(__dirname, "test", "opstools.js"),
               function(err) {
                  assert.isNull(err, " should not have returned an error");

                  // a new entry should be created!
                  AD.test.model.count(OPConfigToolDefinition, function(
                     err,
                     countDone
                  ) {
                     if (err) {
                        done(err);
                     } else {
                        // the test file only has 1 entry in it.
                        assert.ok(
                           countDone == numEntries + 1,
                           " should have created an entry."
                        );
                        done();
                     }
                  });
               }
            );
         }
      });
   });
});

describe("OPSPortal.NavBar.ToolDefinition.update", function() {
   before(function(done) {
      oldLog = ADCore.error.log;
      ADCore.error.log = function() {}; // suppress error logs.

      done();
   });

   after(function(done) {
      ADCore.error.log = oldLog;
      done();
   });

   // should fail if no def provided
   it("should fail if no def provided : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      OPSPortal.NavBar.ToolDefinition.update(function(err) {
         assert.isDefined(err, " should have returned an error.");
         assert.isNotNull(
            err,
            " should have returned an error that is not null"
         );
         assert.isDefined(err.code, " should have a code returned. ");
         assert.equal(
            err.code,
            "E_MISSINGPARAM",
            " should return code: E_MISSINGPARAM"
         );
         onDone();
      })
         .fail(function(err) {
            assert.isDefined(err, " should have returned an error.");
            assert.isNotNull(
               err,
               " should have returned an error that is not null"
            );
            assert.isDefined(err.code, " should have a code returned. ");
            assert.equal(
               err.code,
               "E_MISSINGPARAM",
               " should return code: E_MISSINGPARAM"
            );
            onDone();
         })
         .then(function() {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });

   // should fail if def is missing data.key
   it("should fail if def is missing data.key : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            done();
         }
      }

      var currDef = _.clone(ToolDef);
      delete currDef.key;

      OPSPortal.NavBar.ToolDefinition.update(currDef, function(err) {
         assert.isDefined(err, " should have returned an error.");
         assert.isNotNull(
            err,
            " should have returned an error that is not null"
         );
         assert.isDefined(err.code, " should have a code returned. ");
         assert.equal(
            err.code,
            "E_MISSINGKEY",
            " should return code: E_MISSINGKEY"
         );
         onDone();
      })
         .fail(function(err) {
            assert.isDefined(err, " should have returned an error.");
            assert.isNotNull(
               err,
               " should have returned an error that is not null"
            );
            assert.isDefined(err.code, " should have a code returned. ");
            assert.equal(
               err.code,
               "E_MISSINGKEY",
               " should return code: E_MISSINGKEY"
            );
            onDone();
         })
         .then(function() {
            assert.ok(false, " should not have gotten here.");
            onDone();
         });
   });

   // should update an existing value:
   it("should update an existing value : ", function(done) {
      var numCalled = 0;
      function onDone() {
         numCalled++;
         if (numCalled >= 2) {
            OPConfigToolDefinition.find({ key: currDef.key }).exec(function(
               err,
               list
            ) {
               if (err) {
                  done(err);
               } else {
                  assert.isArray(list, " should have found some matches.");
                  assert.isDefined(list[0], " should have found our entry");
                  assert.equal(
                     list[0].version,
                     currDef.version,
                     " should have upated our data."
                  );
                  done();
               }
            });
         }
      }

      function verifyNewDef(newDef) {
         assert.isDefined(
            newDef,
            " should have returned an updated instance. "
         );
         assert.isNotNull(
            newDef,
            " should have not returned null for updated instance. "
         );
         assert.isNotArray(newDef, " should not return an array.");
         assert.equal(newDef.key, currDef.key, " values should match.");
         assert.equal(
            newDef.version,
            currDef.version,
            " updated values should match"
         );
      }

      var currDef = _.clone(ToolDef);

      currDef.version = "a";

      OPSPortal.NavBar.ToolDefinition.update(currDef, function(err, newDef) {
         assert.isNull(err, " should not have returned an error");
         verifyNewDef(newDef);
         onDone();
      })
         .fail(function(err) {
            assert.ok(false, " should not have gotten here.");
            onDone();
         })
         .then(function(newDef) {
            verifyNewDef(newDef);
            onDone();
         });
   });
});

//////
////// Some Utility fn()
//////
