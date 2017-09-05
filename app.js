const app = require('express')();
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

app.use(bodyparser.urlenconded({extended: false}));

/* ******** PRODUCT SCHEMA ******** */

// create database
const db = new Sequelize('vending_machine', 'angelavogler', '', {
    dialect: 'postgres',
});

// create schema
const Product = db.define('product', {
    name: { type: Sequelize.STRING(20), allowNull: false },
    description: Sequelize.STRING(200),
    cost: { type: Sequelize.INTEGER, allowNull: false },
    quantity: { type: Sequelize.BOOLEAN, allowNull: false }
});

// sync schema
Product.sync().then(function () {
    console.log('product synched');

    Product.create ({
      name: 'Nature Vally Bar',
      description: 'Granola bar with dried fruit and nuts',
      cost: 1,
      quantity: 25,
    });
});

/* ******** CUSTOMERS ******** */
// get route to display list of current items for customer

// post route for customer to purchase an item
// have to have a function to give correct change
// if item is not in the vending machine customer can't purchase it

/* ******** VENDORS ******** */

app.listen(3000);
