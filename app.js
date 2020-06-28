// Dependencies //

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// Running the App //
const app = express();

// Setting up "EJS", "Body-Parser", "Express-Static Folder" respectively. //
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connecting to MongoDB Atlas //
mongoose.connect("mongodb+srv://admin-yash:moradabad@cluster0-6uq7s.mongodb.net/todolistDB", {useNewUrlParser: true});


// Mongoose Schema and Model //
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

// Default Items //
const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defautItems = [item1, item2, item3];

// For creating different Lists //
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Get Request for the home route //

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){ 

    if(foundItems.length === 0){    
      Item.insertMany(defautItems, function(err){
        if (err){
        console.log(err);
        } else {
        console.log("Succesfully Done");
        }
    });
    res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

// Get Request for custom express routes //

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List ({
          name: customListName,
          items: defautItems
        });
        
        list.save();
        res.redirect("/" + customListName);
      }else{
        //Show an existng list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  }); 

}); 

// Post Request for home route //

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){   
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/" + listName);
  }


});

// Post Request for Deleting list items //

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }
});

// Ports Setup for app to listen //
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
