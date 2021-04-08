const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

let items = [];
let workItems = [];

app.get("/", function(req, res) {
  let day = date.getDate();

  res.render("list", {
    listTitle: day,
    newItemLists: items
  });

});

app.post("/", function(req, res) {
  let newItem = req.body.newItem;
  if (req.body.list === "Work") {
    workItems.push(newItem);
    res.redirect("/work");
  } else {
    items.push(newItem);
    res.redirect("/");
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



app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
})
