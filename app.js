const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');//For Embedding Ejs
app.use(express.static("public"));//For accessing static files

app.use(bodyParser.urlencoded({//For incorporating Body Parser
  extended: true
}));

mongoose.set('useFindAndModify', false);
// FOr connecting the mongodb Server through Moongoose
mongoose.connect("mongodb+srv://admin-Karanvir:scoobydooby$38@cluster0.ura5d.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Schema for the Items
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

// Adding the default items in an array!!
const item1 = new Item({
  name: "Welcome to your todoList"
});
const item2 = new Item({
  name: "Hit the + button to add new Items"
});
const item3 = new Item({
  name: "<-- Hit this to delete the item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List  = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, founditems) {
    if (err) {
      console.log(err);
    } else {
      if (founditems.length === 0) {
        // Adding the default items to the mongodb Database
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("The default items have been added successfully  to Databse");
          }
        });
        res.redirect("/")
      } else {
        res.render("list", {
          listTitle: "Today",
          newItemLists: founditems
        });
      }
    }
  });

});

app.get("/:customlistName", function(req,res){
  const customlistName = _.capitalize(req.params.customlistName);

  List.findOne({name: customlistName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new List
        const list  = new List({
          name: customlistName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+ customlistName);
      }
      else{
        //show an existing list
        res.render("list",{listTitle:foundList.name, newItemLists: foundList.items});
      }
    }
  });


});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{undefined
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkeditemId = req.body.checkbox;
  const listTitle =req.body.listTitle;

  if(listTitle==="Today"){
    Item.findByIdAndRemove(checkeditemId,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("item has been deleted successfuly!!")
        res.redirect("/");
      }

    });
  }
  else{
     List.findOneAndUpdate({name: listTitle},{$pull:{items:{_id: checkeditemId}}},function(err,foundList){
       if(!err){
         res.redirect("/"+ listTitle);
       }
     });
  }

});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newItemLists: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfuly");
})
