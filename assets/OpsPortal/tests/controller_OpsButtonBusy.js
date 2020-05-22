// Dependencies
steal(
   "OpsPortal/controllers/OpsButtonBusy.js",
   // Initialization
   function() {
      // the div to attach the controller to
      var divID = "test_OpsButtonBusy";

      // add the div to the window
      var buildHTML = function() {
         var html = ['<div id="' + divID + '">', "</div>"].join("\n");

         $("body").append($(html));
      };

      //Define the unit tests
      describe("testing controller AD.controllers.OpsPortal.OpsButtonBusy ", function() {
         var testController = null;

         before(function() {
            buildHTML();

            // Initialize the controller
            testController = new AD.controllers.OpsPortal.OpsButtonBusy(
               $("#" + divID),
               { some: "data" }
            );
         });

         it("controller definition exists ", function() {
            assert.isDefined(
               AD.controllers.OpsPortal,
               " :=> should have been defined "
            );
            assert.isDefined(
               AD.controllers.OpsPortal.OpsButtonBusy,
               " :=> should have been defined "
            );
            assert.isNotNull(
               AD.Control.get("OpsPortal.OpsButtonBusy"),
               " :=> returns our controller. "
            );
         });
      });
   }
);
