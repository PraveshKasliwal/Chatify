const express = require("express");
const multer = require("multer");
const profileController = require('../controllers/profile');
// const upload = require('../middleware/upload');

const router = express.Router();

router.post("/save-profile", profileController.saveProfile);

module.exports = router;
