$(document).ready(function() {
   //  Find all the displayable <divs>
   var allDisplays = $(".rbac-display");

   var showIt = function(whichOne) {
      allDisplays.each(function(indx, el) {
         var $el = $(el);
         if ($el.hasClass(whichOne)) {
            $el.show();
         } else {
            $el.hide();
         }
      });
   };

   // for each element that has a rbac-show="displayableDiv" attribute
   $("[rbac-show]").each(function(indx, el) {
      // when it is clicked, then make sure only that div is shown
      var $el = $(el);
      $el.click(function(ev) {
         showIt($el.attr("rbac-show"));
         ev.preventDefault();
      });
   });

   //Active InActive of Links

   $("ul.art-hmenu>li").on("click", "a", function(event) {
      $("#menu_wrapper .activelink").removeClass("activelink");
      $(this).addClass("activelink");
   });

   //Tooltip
   $(function() {
      $('[data-toggle="tooltip"]').tooltip();
   });

   //Setup Typeahead Search Bars

   $(".autocomplete-filter").typeahead(
      {
         hint: true,
         highlight: true,
         minLength: 1
      },
      {
         name: "filter",
         displayKey: "value",
         source: function(q, cb) {
            cb([
               { value: "example 1" },
               { value: "examine" },
               { value: "exajerate" }
            ]);
         }
      }
   );

   //For Testing Display with lots of entries in our Tables:
   // copy the last row x20

   var allTables = $("table.table-hover");
   allTables.each(function(i, table) {
      var $table = $(table);
      var lastRow = $table.find("tr:last");
      var tBody = $table.find("tbody");
      for (var i = 1; i <= 20; i++) {
         tBody.append(lastRow.clone());
      }

      $table.bootstrapTable({
         pagination: true
      });
   });

   //Responsiveness of table scroll
   $(window).resize(function() {
      $('table[data-toggle="table"]')
         .add($("table[id]"))
         .bootstrapTable("resetView");
   });

   //Switcheero dropwdown
   $(function() {
      $(".dropdown-menu input,.dropdown-menu select ").click(function(event) {
         event.stopPropagation();
      });
   });

   //Editable table
   $("#permissionlist td a").click(function() {
      var currentTD = $(this)
         .parents("tr")
         .find("td:not(:last-child, :first-child)");

      if ($(this).is(".fa-edit")) {
         $.each(currentTD, function() {
            $(this).prop("contenteditable", true);
         });
         $(this).removeClass("fa-edit");
         $(this).addClass("fa-save");
      } else if ($(this).is(".fa-save")) {
         $.each(currentTD, function() {
            $(this).prop("contenteditable", false);
         });
         $(this).removeClass("fa-save");
         $(this).addClass("fa-edit");
      } else {
         return false;
      }
   });

   //END DOCUMENT READY
});
