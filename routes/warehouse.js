const express = require("express");
const router = express.Router();
const WarehouseItem = require("../models/WarehouseItem");
const { auth } = require("../middleware/auth");

router.get("/items", auth, async (req, res) => {
    try {
        const items = await WarehouseItem.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Błąd pobierania magazynu" });
    }
});

router.post("/items", auth, async (req, res) => {
    try {
        const item = new WarehouseItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: "Błąd dodawania do magazynu" });
    }
});

module.exports = router;
