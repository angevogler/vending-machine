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

// sync schema
Product.sync().then(function () {
    console.log('product synched');

    // Product.create ({
    //   name: 'UTZ Crab Chips',
    //   description: 'Old Bay flavored potato chips',
    //   cost: 1,
    //   quantity: 25,
    // });
});

/* ******** CUSTOMERS ******** */
// get route to display list of current items for customer
app.get('/vending/customer/items', function (req, res) {
  Product.findAll().then(function(product){
    res.json(product);
  })
});

// post route for customer to purchase an item
app.post('/vending/customer/:productId/purchases', function (req, res) {
  const id = parseInt(req.params.productId);
  const amountPaid = req.body.amountPaid;
  let changeOwed = 0;
  // have to have a function to give correct change
  Product.find({ where: {
    id: id
    }
  }).then(function(product){
    if ( product.cost <= amountPaid ) {
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
    } else {
      res.json({
        'status': 'error, not enough money',
        'product': id,
        'product_name': product.name,
        'cost': product.cost,
        'amount_paid': amountPaid,
      });
    }
  }).catch(function(product){
    res.json({
      'status': 'error, product not in vending machine',
    });
  })
  // if ( product.cost <= amountPaid ) {
  //   changeOwed = amountPaid - product.cost
  //   Product.update({
  //     quantity: quantity - 1
  //   }, {
  //     where: {
  //       id: id,
  //     }
  //   }).then(function(product){
  //     res.json({
  //       'status': 'item purchased',
  //       'product': id,
  //       'product_name': product.name,
  //       'cost': product.cost,
  //       'amount_paid': amountPaid,
  //       'change_owed': change_owed
  //     })
  //   })
  // } else {
  //   Product.find({
  //     where: {
  //       id: id,
  //     }
  //   }).then(function(product){
  //     res.json({
  //       'status': 'error, not enough money',
  //       'product': id,
  //       'product_name': product.name,
  //       'cost': product.cost,
  //       'amount_paid': amountPaid,
  //     });
  //   }).catch(function(product){
  //     res.json({
  //       'status': 'error, product not in vending machine',
  //     });
  //   })
  // }
  // if item is not in the vending machine customer can't purchase it
});

/* ******** VENDORS ******** */

app.listen(3000, function () {
  console.log('dont shake the machine');
});
