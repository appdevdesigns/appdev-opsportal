// Dependencies
steal(
   "opstools/RBAC/models/PermissionAction.js",
   // Initialization
   function() {
      //Define the unit tests
      describe("testing model AD.models.opstools.RBAC.PermissionAction ", function() {
         before(function() {});

         it("model definition exists ", function() {
            assert.isDefined(
               AD.models.opstools,
               " :=> should have been defined "
            );
            assert.isDefined(
               AD.models.opstools.RBAC,
               " :=> should have been defined "
            );
            assert.isDefined(
               AD.models.opstools.RBAC.PermissionAction,
               " :=> should have been defined "
            );
            assert.isNotNull(
               AD.Model.get("opstools.RBAC.PermissionAction"),
               " :=> did not return null"
            );
         });
      });
   }
);
