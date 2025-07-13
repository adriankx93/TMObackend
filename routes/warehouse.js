
const express = require('express');
const router = express.Router();

let warehouseItems = []; 


router.get('/items', (req, res) => {
  res.json(warehouseItems);
});


router.post('/items', (req, res) => {
  const item = {
    id: Date.now().toString(),
    ...req.body
  };
  warehouseItems.push(item);
  res.status(201).json(item);
});

module.exports = router;
