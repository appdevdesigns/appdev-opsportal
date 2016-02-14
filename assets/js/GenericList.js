
steal(
        // List your Controller's dependencies here:
        'styles/genericList.css',
        'js/GenListDOM.ejs',
        'js/GenListItem.ejs',
function(){
System.import('appdev').then(function() {
    steal.import('can/control/control', 'appdev/ad').then(function() {


    AD.controllers.GenericList = can.Control.extend({


        init: function( element, options ) {
//            var self = this;
            this.options = AD.defaults({
                    dom_listarea:'.genlist-list',
                    notification_selected:null,
                    templateDOM: '/js/GenListDOM.ejs',
                    templateItem: '/js/GenListItem.ejs',
                    title: 'List',
                    onAdd:null,
                    onEdit:null,
                    description:null
            }, options);

            this.dataSource = this.options.dataSource; // AD.models.Projects;

            this.initDOM();
            this.loadItems();


        },



        clear:function() {
            this.data();
        },



        clearItemList: function() {
            var items = this.element.find(this.options.dom_listarea);
            items.children().each(function(index, item){
                item.remove();
                });
        },



        data:function(dataList) {
            this.dataSource = dataList;
            this.loadItems();
        },



        initDOM: function() {

            this.element.html(can.view(this.options.templateDOM, {
                title: this.options.title,
                description: this.options.description
            } ));


            this.button = {};

            this.button.add = this.element.find('.genlist-button-add');
            if (this.options.onAdd) {
                this.button.add.click( this.options.onAdd );
            } else {
                this.button.add.hide();
            }

            this.button.edit = this.element.find('.genlist-button-edit');
            if (this.options.onEdit) {
                this.button.edit.click( this.options.onEdit );
            } else {
                this.button.edit.hide();
            }

        },

		resize: function(height) {
		    // the height of our list should =
		    // given height
		    // - height of our mastHead
		    // - 5px buffer between mastHead and list
		    // - 15px margin on bottom

		    this.element.find('.genlist-widget-inner').css("height", height+'px');

		    var mastheadHeight = this.element.find(".opsportal-widget-masthead").outerHeight(true);
			
			// what is the point of subtracting 15? Adds a gap above the bottom button...removing it for now.
			//this.element.find('.hris-nav-list').css("height", (height -mastheadHeight -5 -15) + "px");
			this.element.find('.opsportal-nav-list').css("height", (height -mastheadHeight -5) + "px");

			// now we apply a padding to our widget container so that the list drops below the masthead
			this.element.find(".genlist-widget-inner")
			    .css("padding-top", (mastheadHeight+5) + "px");

        },


        loadItem: function(item, listArea) {
            var self = this;

            if (!listArea) {
                listArea = this.element.find(this.options.dom_listarea);
            }

            var domFrag = can.view(this.options.templateItem, { item: item });
            listArea[0].appendChild(domFrag);

            var itemLI = listArea.find('[gen-list-del-id='+item.getID()+']');
            itemLI.data('ad-model', item);

            //// now on each model displayed, listen to it's destroyed event
            // when destroyed, .remove() this domFrag.
            if (item.bind) {
                var bindThis = function(model, frag) {

                    var delThis = function (ev, attr){
                        if (attr == 'destroyed') {
                            self.element.find('[gen-list-del-id='+model.id+']').remove();
                        }
                    };
                    model.bind('change',delThis);

                };
                bindThis(item, domFrag);
            }

        },



        loadItems: function() {
 //           var self = this;

            var listArea = this.element.find(this.options.dom_listarea);

            this.clearItemList();

            if (this.dataSource) {
                for (var i=0; i<this.dataSource.length; i++) {
                    this.loadItem(this.dataSource[i], listArea);
                }
            }
        },



        'li.genlist-item click': function($el, ev) {

            //  hris-active hris-active-object
            this.element.find('.genlist-active').each(function(index, item) {
                $(item).removeClass('genlist-active genlist-active-object');
            });

            // add the selected class to this li
            $el.addClass('genlist-active');
            $el.addClass('genlist-active-object');

            // send a message
            if (this.options.notification_selected) {
                var model = $el.data('ad-model');
                AD.comm.hub.publish(this.options.notification_selected, { model: model });
            }

            ev.preventDefault();
        }


    });

///// LEFT OFF:
////  Implementing GenericList.js
////  verify we can embedd a model in domFrag (loadItem()) and then access
////  the model on '.genlist-item click'
////  - add in notifications: notify_on_select
////
});    
});
});
