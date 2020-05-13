// Dependencies
steal(
   //        "../../../../../../assets/appdev/appdev.js"
   "../../../../assets/appdev/appdev.js",
   function() {
      initialize();
   }
);

// Initialization
function initialize() {
   mocha.setup({
      ui: "bdd",
      timeout: 9000,
      reporter: "html"
   });
   expect = chai.expect;
   assert = chai.assert;

   loadRBACfiles();
}

function loadRBACfiles() {
   steal(
      // [appdev-cli] : leave this next comment!
      // load our tests here
      "opstools/RBAC/tests/controller_Scopes.js",
      "opstools/RBAC/tests/model_PermissionScopeObject.js",
      "opstools/RBAC/tests/controller_UserPermissionList.js",
      "opstools/RBAC/tests/controller_RoleEdit.js",
      "opstools/RBAC/tests/model_PermissionAction.js",
      "opstools/RBAC/tests/controller_RoleAdd.js",
      "opstools/RBAC/tests/controller_UserAssignmentAdd.js",
      "opstools/RBAC/tests/controller_Roles.js",
      "opstools/RBAC/tests/controller_Users.js",
      "opstools/RBAC/tests/controller_RBAC.js",
      "opstools/RBAC/tests/app.js",
      function() {
         // Execute the tests
         if (window.mochaPhantomJS) {
            mochaPhantomJS.run();
         } else {
            mocha.run();
         }
      }
   );
}
