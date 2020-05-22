// Dependencies
steal(
   "opstools/RBAC/models/PermissionScope.js",
   // Initialization
   function() {
      //Define the unit tests
      describe("testing model AD.models.opstools.RBAC.PermissionScope ", function() {
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
               AD.models.opstools.RBAC.PermissionScope,
               " :=> should have been defined "
            );
            assert.isNotNull(
               AD.Model.get("opstools.RBAC.PermissionScope"),
               " :=> did not return null"
            );
         });
      });
   }
);
