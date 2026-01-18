const express = require("express");
const router = express.Router();
const upload = require("../config/multer.config.js");
const fileModel = require("../models/file.model.js");
const authMiddleware = require("../middlewares/auth.js");
const firebase = require("../config/firebase.config.js");

// Home Route
router.get("/home", authMiddleware, async (req, res) => {
  const userFiles = await fileModel.find({
    user: req.user.id,
  });
  res.render("fileupload", { files: userFiles });
});

// File Upload Route
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    const newFile = await fileModel.create({
      path: req.file.path,
      originalName: req.file.originalname,
      user: req.body.userId,
    });
    res.send("File uploaded and saved successfully");
  },
);

router.get("/download/:path", authMiddleware, async (req, res) => {
  const loggedInUserId = req.user.id;
  const path = req.params.path;
  const file = await fileModel.findOne({ path: path, user: loggedInUserId });
  if (!file) {
    return res.status(404).json({ message: "File not found or access denied" });
  }
  const signedUrl = await firebase
    .storage()
    .bucket()
    .file(path)
    .getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // URL valid for 15 minutes
    });
  res.redirect(signedUrl[0]);
});
module.exports = router;
