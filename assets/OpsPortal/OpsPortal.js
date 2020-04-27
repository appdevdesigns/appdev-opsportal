// steal( {
//     id: 'appdev/appdev.js',
//     waits: !1,
//     has: 'js/jquery.min.js canjs/can.jquery.js appdev/ad.js js/OpenAjax.js appdev/comm/hub.js appdev/util/uuid.js js/async.js appdev/util/async.js appdev/config/config.js appdev/model/model.js appdev/labels/lang.js appdev/labels/label.js appdev/sal/web-jquery.js appdev/comm/service.js js/dependencies/sails.io.js appdev/comm/socket.js appdev/widgets/ad_ui_reauth/ad_ui_reauth.css appdev/widgets/ad_ui_reauth/ad_ui_reauth.js appdev/auth/reauth.js appdev/UIController.js appdev/control/control.js appdev/appdev.js'.split( ' ' )
// } );
var allPortals = $("[appdev-opsportal]");
System.import("appdev").then(function() {
   steal.import("appdev/ad").then(function() {
      if (allPortals.length == 0) {
         // default to previous #portal method.
         AD.ui.loading.attach("#portal");
      } else {
         AD.ui.loading.attach(allPortals[0]);
      }
      AD.ui.loading.text(
         '<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>'
      ); //' OpsPortal ...');
      AD.ui.loading.resources(19); // increase the number of resources to load

      loadJqueryUi();
   });
});

function loadJqueryUi() {
   steal.import("jquery-ui").then(function() {
      // Change JQueryUI plugin names to fix name collision
      // with Bootstrap.
      $.widget.bridge("uitooltip", $.ui.tooltip);
      $.widget.bridge("uibutton", $.ui.button);

      loadBootstrapStyle();
   });
}

function loadBootstrapStyle() {
   steal
      .import(
         "bootstrap",
         "bootstrap.css",
         "styles/bootstrap-theme.min.css",
         "styles/jquery.sidr.dark.css",
         "moment",
         "js/jquery.sidr.min",
         "bootstrap-datetimepicker.css",

         "webix-opsportal", // theme for webix

         // "bootstrapValidator.css",
         "bootbox",
         // 'notify.js',
         // 'GenericList.js',
         "FilteredBootstrapTable",
         "OpsButtonBusy",
         "font-awesome.css"
      )
      .then(function() {
         loadBootstrapPlugins();
      });
}

function loadBootstrapPlugins() {
   AD.ui.loading.completed(12); // this many have just been completed.

   steal
      .import(
         "bootstrap-table",
         "bootstrap-table.css",

         "OpsWebixDataCollection.js",
         "OpsWebixForm.js",

         // "bootstrapValidator.js",
         "bootstrap-datetimepicker", // <<--- needs moment.js loaded first.
         "OpsPortal/controllers/OpsPortal",

         "feedback/feedback.min.css",
         "feedback/feedback.min",

         "site/labels/OpsPortal",
         "site/labels/OpNavEdit"
      )
      .then(function() {
         setupSocket();
      });
}

function setupSocket() {
   AD.ui.loading.completed(7); //

   // search the DOM for [appdev-opsportal] attribute

   if (allPortals.length > 0) {
      allPortals.each(function(indx, portal) {
         new AD.controllers.OpsPortal.OpsPortal(portal);
      });
   } else {
      console.log("opsportal: defaulting to old #portal loading method.");
      // attach our OpsPortal to this ID :
      new AD.controllers.OpsPortal.OpsPortal("#portal");
   }

   // register our socket connection
   AD.comm.socket
      .get({ url: "/opsportal/socket/register" })
      .fail(function(err) {
         console.error(err);
      })
      .then(function() {
         console.log("... OPSPORTAL:  socket registered.");
      });
}

// steal(

//         'appdev'
// ).then(

//     function() {

//         // now make sure our AD.ui.jQuery is $ for our application:
//         (function($) {

//             steal(

//                 function() {

//                     // verify all these 3rd party libraries are loaded on our Web Page:
//                     AD.ui.bootup.requireSeries([

//                         [
//                             {
//                                 // return true if loaded
//                                 cond:function() { return ('undefined' != typeof window.jQuery ); },
//                                 // lib:'http://code.jquery.com/jquery-1.11.1.min.js'
// lib:'js/jquery.min.js'
//                             }
//                         ],
//                         [
//                             {
//                                 cond:function() { return ((window.jQuery)&&(window.jQuery.ui)); },
//                                 // lib:'http://code.jquery.com/ui/1.11.0/jquery-ui.min.js'
// lib:'js/jquery-ui.min.js'
//                             },
//                             { tag:'bootstrap.min.js',       lib:'bootstrap/js/bootstrap.min.js'},
// //{ tag:'bootstrap.js',       lib:'bootstrap/js/bootstrap.js'},
//                             { tag:'bootstrap.min.css',      lib:'bootstrap/css/bootstrap.min.css' },
//                             { tag:'jquery.sidr.dark',       lib:'styles/jquery.sidr.dark.css' }
//                         ],
//                         [
//                             { tag:'jquery.sidr.min',        lib:'js/jquery.sidr.min.js' },
//                             { tag:'bootstrap-datepicker',   lib:'bootstrap/js/bootstrap-datepicker.js' },
//                             { tag:'bootstrap-wijmo',        lib:'styles/bootstrap-wijmo.css' },

//                             //// Load Wijimo!  The monolithic UI Graphing Library for sweet Eye Candy!
// // we really should use the cdn.
// // but for dev purposes, we are currently using local copies:
//                             // { tag:'jquery-wijmo.css',       lib:'http://cdn.wijmo.com/themes/aristo/jquery-wijmo.css' },
//                             // { tag:'wijmo-pro.all.3.20142.45.min.css',       lib:'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.css'},
//                             // { tag:'wijmo-open.all',         lib:'http://cdn.wijmo.com/jquery.wijmo-open.all.3.20142.45.min.js' },
//                             // { tag:'wijmo-pro.all',          lib:'http://cdn.wijmo.com/jquery.wijmo-pro.all.3.20142.45.min.js' },
// { tag:'jquery-wijmo.css',       lib:'styles/jquery-wijmo.css' },
// { tag:'wijmo-pro.all.3.20142.45.min.css',       lib:'styles/jquery.wijmo-pro.all.3.20142.45.min.css'},
// { tag:'wijmo-open.all',         lib:'js/jquery.wijmo-open.all.3.20142.45.min.js' }
//                         ],
//                         [
// { tag:'wijmo-pro.all',          lib:'js/jquery.wijmo-pro.all.3.20142.45.min.js' }
//                         ]

//                     ]);
//                 }
//             ).then(

//                     '//OpsPortal/controllers/OpsPortal.js',
//                     '/site/labels/OpsPortal',
//                     // "http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css"
// 'styles/font-awesome.css'
//             ).then(function(){

// //// TODO: get the divID from the calling url:  /opsportal/bootup/[divID]:

//                 // attach our OpsPortal to this ID :
//                 new AD.controllers.OpsPortal.OpsPortal('#portal');

//             });

//         })(AD.ui.jQuery);

//     }

// );
