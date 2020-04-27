/**
 * This file specifies any default Ops Portal Tool Definitions
 * provided by this modlue.
 *
 */
module.exports = [
   {
      key: "opsportal.rbac",
      permissions: "opsportal.rbac.view",
      icon: "fa-users",
      label: "Ops Portal Permissions",
      // context:'opsportal',
      controller: "RBAC",
      isController: true,
      options: {},
      version: "0"
   }
   // {
   //     key:'opsportal.theme',
   //     permissions:'opsportal.theme.view',
   //     icon:'fa-file-image-o',
   //     label:'Ops Portal Theme',
   //     // context:'opsportal',
   //     controller:'OPTheme',
   //     isController:true,
   //     options:{},
   //     version:'0'
   // },
];
