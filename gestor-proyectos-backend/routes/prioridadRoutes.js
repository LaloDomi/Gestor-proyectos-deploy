const express = require("express");
const router = express.Router();
const controller = require("../controllers/prioridadController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../config/roles");

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", authorize(ROLES.ADMIN), controller.create);
router.put("/:id", authorize(ROLES.ADMIN), controller.update);
router.delete("/:id", authorize(ROLES.ADMIN), controller.remove);

module.exports = router;
