const express = require("express");
const router = express.Router();
const controller = require("../controllers/usuarioController");

router.get("/", controller.getAll);
router.post("/login", controller.login);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
