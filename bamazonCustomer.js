var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var fs = require("fs");
 
// instantiate 
var table = new Table({
    head: ["Item ID", "Item Name", "Price"],
    colWidths: [10, 60, 10]
});
 
// table is an Array, so you can `push`, `unshift`, `splice` and friends 
// table.push(
//     ['First value', 'Second value']
//   , ['First value', 'Second value']
// );


var connection = mysql.createConnection ({
	host: "localhost",
	port: 8889,
	user: "root",
	password: "root",
	database: "bamazon_DB"
});

connection.connect(function(err) {
	if(err) throw(err);
	start();
});

function start() {
	var table = new Table({
    head: ["Item ID", "Item Name", "Price"],
    colWidths: [10, 60, 10]
	});

	connection.query("SELECT * FROM products", function(err, inventory) {
		if (err) throw(err);
		for(var i = 0; i < inventory.length; i++) {
			// console.log("|\n|Item ID: " + results[i].item_id + "|");
			// console.log("|Item name: " + results[i].product_name + "|");
			// console.log("|Price: $" + results[i].price + "|");
			// console.log("|\n|==============================================================|");
			table.push(
				[inventory[i].item_id, inventory[i].product_name, "$" + inventory[i].price]
			);
		}
		console.log("\n\n" + table.toString());
		buyItem(inventory);
	});
}

function buyItem(inventory) {
	inquirer
		.prompt([
			{
				type: "input",
				message: "\n\nenter the product id of the item you would like to buy?\n",
				name: "itemId"
			},
			{
				type: "input",
				message: "\nEnter the quantity you would like to buy?\n",
				name: "itemQuantity"
			}
		]).then(function(response) {
			var itemID = response.itemId - 1;
			if (inventory[itemID].stock_quantity < response.itemQuantity) {
				console.log("Sorry we don't have the sufficient quantity to fulfill your order");
				keepShopping();
			}
			else {
				var query = connection.query(
				    "UPDATE products SET ? WHERE ?",
				    [
				      {
				        stock_quantity: (inventory[itemID].stock_quantity - response.itemQuantity)
				      },
				      {
				        item_id: inventory[itemID].item_id
				      }
				    ],
				    function(err, res) {
				    	if (err) throw (err);
				      	console.log("\n\nTransaction successfull");
				      	console.log("Total was $" + (inventory[itemID].price * response.itemQuantity).toFixed(2));
				      	keepShopping();
				    }
				 );
			}
		});
				
}

function keepShopping() {
	inquirer
		.prompt([
			{
				type: "confirm",
				message: "Do you want to buy another item?",
				name: "answer"
			}
		]).then(function(res) {
			if (res.answer === true) {
				start();
			}
			else {
				console.log("Thank you, hope you come back soon!");
				process.exit();
			}
		});
}





// DROP DATABASE IF EXISTS bamazon_DB;

// CREATE DATABASE bamazon_DB;

// USE bamazon_DB;

// CREATE TABLE products (
// 	item_id INT(10) NOT NULL AUTO_INCREMENT,
// 	product_name VARCHAR(100) NULL,
// 	department_name VARCHAR(100) NULL,
//     price DECIMAL(10,2) NULL,
//     stock_quantity INT(10) NULL,
// 	PRIMARY KEY (item_id)
// );

// INSERT INTO products (product_name, department_name, price, stock_quantity)
// VALUES ("Fire TV stick alexa voice remote", "electronics", 39.99, 50),
// ("Kindle paperwhite", "electronics", 189.99, 50),
// ("Amazon music unlimited", "subscription", 10.99, 50),
// ("iPhone X", "electronics", 999.99, 50),
// ("Amazon echo", "electronics", 129.99, 50),
// ("Instant pot 7-in-1 multi-function pressure cooker", "home", 79.99, 50),
// ("iRobot Roomba 625 robotic Vacuum Cleaner", "home", 374.65, 50),
// ("Anker bluetooth soundbuds headphones", "electronics", 23.99, 50),
// ("Oral-B pro 7000 smartSeries electric toothbrush", "bathroom", 109.96, 50),
// ("Anker iPhone lightning charger", "tech accessories", 17.99, 50);











