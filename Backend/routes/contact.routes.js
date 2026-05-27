const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const contactController = require("../controllers/contact.controller");

router.use(authenticate)

router.get("/", contactController.getAllContacts);

router.post("/", contactController.createContact);

router.put("/:id", contactController.updateContact);

router.delete("/:id", contactController.deleteContact);

module.exports = router;