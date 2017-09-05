const app = require('express')();
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

app.use(bodyparser.urlencoded({ extended: false }));

/* ******** PRODUCT SCHEMA ******** */

// create database
const db = new Sequelize('vending_machine', 'angelavogler', '', {
    dialect: 'postgres',
});

// create schema
const Product = db.define('product', {
    name: { type: Sequelize.STRING(20), allowNull: false },
    description: Sequelize.STRING(200),
    cost: { type: Sequelize.REAL, allowNull: false },
    quantity: { type: Sequelize.INTEGER, allowNull: false }
});

// synch schema
Product.sync().then(function () {
    console.log('product synched');

    // Product.create ({
    //   name: 'UTZ Crab Chips',
    //   description: 'Old Bay flavored potato chips',
    //   cost: 1,
    //   quantity: 25,
    // });
});

/* ******** PURCHASES SCHEMA ******** */

// create schema
const Purchases = db.define('purchases', {
  name: { type: Sequelize.STRING(20), allowNull: false },
  cost: { type: Sequelize.INTEGER, allowNull: false }
})

// synch schema

Purchases.sync().then(function () {
  console.log('purchases synched');
});

/* ******** CUSTOMERS ******** */
// get request to display list of current items for customer
app.get('/vending/customer/items', function (req, res) {
  Product.findAll().then(function(product){
    res.json(product);
  })
});

// post request for customer to purchase an item
app.post('/vending/customer/:productId/purchases', function (req, res) {
  const id = parseInt(req.params.productId);
  const amountPaid = req.body.amountPaid;
  let changeOwed = 0;
  // have to have a function to give correct change
  Product.find({ where: {
    id: id
    }
  }).then(function(product){
    if ( product.cost <= amountPaid && product.quantity > 0 ) {
      changeOwed = amountPaid - product.cost
      let quantity = product.quantity
      Product.update({
        quantity: quantity - 1
      }, {
        where: {
          id: id,
        }
      }).then(function(product){
        res.json({
          'status': 'item purchased',
          'product': id,
          'product_name': product.name,
          'cost': product.cost,
          'amount_paid': amountPaid,
          'change_owed': changeOwed
        })
      })
      // create a row in the purchase table for the item that was purchased
      Purchases.create({
        name: product.name,
        cost: product.cost,
      })
    } else if ( product.cost >= amountPaid && product.quantity === 0 ){
      res.json({
        'status': 'error, not enough money',
        'product': id,
        'product_name': product.name,
        'cost': product.cost,
        'amount_paid': amountPaid,
      });
    }
  // if an item is not in the vending machine then the customer is not allowed to purchase it
  }).catch(function(product){
    res.json({
      'status': 'error, product not in vending machine',
    });
  });
});

/* ******** VENDORS ******** */

// get request for vendors to see total amount of money in the machine
app.get('/vending/vendor/money', function (req, res) {
  Purchases.findAll().then(function(purchases){
    let totalMoney = 0;
    for ( let i = 0; i < purchases.length; i++ ) {
      totalMoney += purchases[i].cost
    }
    res.json({
      'machine_total': totalMoney,
    })
  });
});

// get request for vendors to see list of purchases
app.get('/vending/vendor/purchases', function (req, res) {
  Purchases.findAll().then(function(purchases) {
    res.json(purchases);
  })
})

// post request for vendors to add new item to list
app.post('/vending/vendor/items', function (req, res) {
  Product.create({
    name: req.body.name,
    description: req.body.description,
    cost: parseFloat(req.body.cost),
    quantity: parseInt(req.body.quantity),
  }).then(function(products){
    res.json({
      'status': 'new product added',
      'name': req.body.name,
      'description': req.body.description,
      'cost': parseFloat(req.body.cost),
      'quantity': parseInt(req.body.quantity),
    });
  })
});

// put request for vendors to edit existing item
app.listen(3000, function () {
  console.log('dont shake the machine');
});
