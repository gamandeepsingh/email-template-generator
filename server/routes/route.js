const express = require("express");
const {
  getAllTemplate,
  createTemplate,
  getTemplateById,
  updateTemplateById,
  deleteTemplateById,
} = require("../controller/email.controller");
const router = express.Router();

router.get("/", getAllTemplate);
router.post("/", createTemplate);
router.get("/:id", getTemplateById);
router.put("/:id", updateTemplateById);
router.delete("/:id", deleteTemplateById);

module.exports = router;
