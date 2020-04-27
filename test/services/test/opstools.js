/**
 * This file specifies any default Ops Portal Tool Definitions
 * provided by this modlue.
 *
 */
module.exports = [
   {
      key: "test.setuppath",
      permissions: "adcore.admin, adcore.developer, opsportal.rbac.view",
      icon: "fa-users",
      label: "opp.toolPermissions",
      context: "opsportal",
      controller: "RBAC",
      isController: true,
      options: {},
      version: "0"
   }
];
