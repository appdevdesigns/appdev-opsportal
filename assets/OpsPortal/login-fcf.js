$(document).ready(function() {
   //  Find all the displayable <divs>
   var allDisplays = $(".form-display");

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
   $("[form-show]").each(function(indx, el) {
      // when it is clicked, then make sure only that div is shown
      var $el = $(el);
      $el.click(function() {
         showIt($el.attr("form-show"));
      });
   });

   //Active InActive of Links

   $("ul.op-list li a").click(function(e) {
      //remove all pre-existing active classes
      $(".selected").removeClass("selected");

      //add the active class to the link we clicked
      $(this).addClass("selected");

      event.preventDefault();
   });

   //SELECTED with DOWN notch

   $("ul.op-list li a").click(function(e) {
      //remove all pre-existing active classes
      $(".selected-dn").removeClass("selected-dn");

      //add the active class to the link we clicked
      $(this)
         .parent(".op-list li")
         .addClass("selected-dn");

      event.preventDefault();
   });
});
