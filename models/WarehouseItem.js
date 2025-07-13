const mongoose = require("mongoose");

const WarehouseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  quantity: { type: Number, default: 0 },
  unit: String,
  unitPrice: Number,
  supplier: String,
  priority: { type: String, default: "Auto" },
  notes: String,
  lowStockThreshold: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WarehouseItem", WarehouseItemSchema);
