const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middlewares/auth.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");

// Store uploaded file temporarily in memory.
// It will then be uploaded to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
});

// INDEX ROUTE
// GET /listings

router.get("/", wrapAsync(listingController.index));

// NEW ROUTE
// GET /listings/new

router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// CREATE ROUTE
// POST /listings

router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing),
);

// SHOW ROUTE
// GET /listings/:id

router.get("/:id", wrapAsync(listingController.showListing));

// EDIT ROUTE
// GET /listings/:id/edit

router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(listingController.renderEditForm),
);

// UPDATE ROUTE
router.put("/:id", isLoggedIn,upload.single("listing[image]"), wrapAsync(listingController.updateListing));

// DELETE ROUTE

router.delete("/:id", isLoggedIn, wrapAsync(listingController.destroyListing));

module.exports = router;
