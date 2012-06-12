
// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  //  Model
  // ----------

  // Our basic **PhoneData** model has `name`, `surName`, `phoneNumber` 
  // and `type` attributes.
  var PhoneData = Backbone.Model.extend({

    // Default attributes for the PhoneData item.
    defaults: function() {
      return {
        name: "empty name...",
        surName: "empty surName...",
        PhoneData: "empty phoneNumber...",
        type: "empty type..."
      };
    },

    // Ensure that each phoneData created has `name`, `surName` and `phoneNumber`.
    initialize: function() {
      if (!this.get("name")) {
        this.set({"name": this.defaults().name});
      }
      if (!this.get("surName")) {
        this.set({"surName": this.defaults().surName});
      }
      if (!this.get("phoneNumber")) {
        this.set({"phoneNumber": this.defaults().phoneNumber});
      }
    },

    // Remove this phoneData from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }

  });

  // PhoneData Collection
  // ---------------

  // The collection of phoneData is backed by *localStorage* instead of a remote
  // server.
  var PhoneBook = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: PhoneData,

    // Save all of the phoneData items under the `"phoneBook-backbone"` namespace.
    localStorage: new Store("phoneBook-backbone")

  });

  // Create our global collection of **PhoneData**.
  var PhoneBooks = new PhoneBook();

  // PhoneData Item View
  // --------------

  // The DOM element for a PhoneNumber item...
  var PhoneDataView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"   : "edit",
      "click a.destroy"  : "clear",
      "click #saveButton" : "close"
    },

    // The PhoneDataView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **PhoneData** and a **PhoneDataView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the names of the PhoneData item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.inputName = this.$('#name');
      this.inputSurName = this.$('#surname');
      this.inputPhoneNumber = this.$('#phonenumber');
      this.inputType = this.$('#type');
      return this;
    },


    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.inputName.focus();
    },

    // Close the `"editing"` mode, saving changes to the PhoneNumber.
    close: function() {
      var nameValue = this.inputName.val();
      var surNameValue = this.inputSurName.val();
      var phoneNumberValue = this.inputPhoneNumber.val();
      var typeValue = this.inputType.val();

      if (!nameValue) this.clear();
      
      this.model.save({name: nameValue,surName: surNameValue,phoneNumber: phoneNumberValue,type: typeValue});

      this.$el.removeClass("editing");
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppViewt** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#bookapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #new-button":  "create"
    },

    // At initialization we bind to the relevant events on the `phonebooks`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting phoneNumbers that might be saved in *localStorage*.
    initialize: function() {

      this.inputName = this.$("#new-name");
      this.inputSurName = this.$("#new-surname");
      this.inputPhoneNumber = this.$("#new-phonenumber");
      this.inputType = this.$("#new-type");

      PhoneBooks.bind('add', this.addOne, this);
      PhoneBooks.bind('reset', this.addAll, this);
      PhoneBooks.bind('all', this.render, this);

      this.footer = this.$('footer');
      this.main = $('#main');

      PhoneBooks.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {


      if (PhoneBooks.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({remaining: PhoneBooks.length}));
      } else {
        this.main.hide();
        this.footer.hide();
      }
    },

    // Add a single phoneNumber item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(phoneData) {
      var view = new PhoneDataView({model: phoneData});
      this.$("#phone-list").append(view.render().el);
    },

    // Add all items in the **PhoneBooks** collection at once.
    addAll: function() {
      PhoneBooks.each(this.addOne);
    },

    // If you hit return in the main input field, create new **phoneNumber** model,
    // persisting it to *localStorage*.
    create: function() {
      if (!this.inputName.val() || !this.inputSurName.val() || !this.inputPhoneNumber.val() || !this.inputType.val()) return;
      PhoneBooks.create({name: this.inputName.val(),surName: this.inputSurName.val(),phoneNumber: this.inputPhoneNumber.val(),type: this.inputType.val()});
      this.inputName.val('');
      this.inputSurName.val('');
      this.inputPhoneNumber.val('');
      this.inputType.val('');
    }


  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
