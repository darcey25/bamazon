var mysql = require("mysql2");
var inquirer = require("inquirer").default;
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
	// Defaults match a local MAMP install; override them with environment variables.
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 8889,
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "root",
	database: process.env.DB_NAME || "bamazon_DB"
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
			var itemId = Number(response.itemId);
			var quantity = Number(response.itemQuantity);
			var item = inventory.find(function(product) {
				return product.item_id === itemId;
			});
			if (!item) {
				console.log("There is no product with that id.");
				return keepShopping();
			}
			if (!Number.isInteger(quantity) || quantity < 1) {
				console.log("Please enter a whole number greater than zero.");
				return keepShopping();
			}
			// The stock check runs in the UPDATE itself, so two shoppers can't
			// both buy the last unit.
			connection.query(
				"UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ? AND stock_quantity >= ?",
				[quantity, itemId, quantity],
				function(err, res) {
					if (err) throw (err);
					if (res.affectedRows === 0) {
						console.log("Sorry we don't have the sufficient quantity to fulfill your order");
					} else {
						console.log("\n\nTransaction successful");
						console.log("Total was $" + (item.price * quantity).toFixed(2));
					}
					keepShopping();
				}
			);
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











