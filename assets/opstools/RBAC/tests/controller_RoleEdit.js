// Dependencies
steal(
   "opstools/RBAC/controllers/RoleEdit.js",
   // Initialization
   function() {
      // the div to attach the controller to
      var divID = "test_RoleEdit";

      // add the div to the window
      var buildHTML = function() {
         var html = ['<div id="' + divID + '">', "</div>"].join("\n");

         $("body").append($(html));
      };

      //Define the unit tests
      describe("testing controller AD.controllers.opstools.RBAC.RoleEdit ", function() {
         var testController = null;

         before(function() {
            buildHTML();

            // Initialize the controller
            testController = new AD.controllers.opstools.RBAC.RoleEdit(
               $("#" + divID),
               { some: "data" }
            );
         });

         it("controller definition exists ", function() {
            assert.isDefined(
               AD.controllers.opstools,
               " :=> should have been defined "
            );
            assert.isDefined(
               AD.controllers.opstools.RBAC,
               " :=> should have been defined "
            );
            assert.isDefined(
               AD.controllers.opstools.RBAC.RoleEdit,
               " :=> should have been defined "
            );
            assert.isNotNull(
               AD.Control.get("opstools.RBAC.RoleEdit"),
               " :=> returns our controller. "
            );
         });
      });
   }
);
