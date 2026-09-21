const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middleware.js");

const reviewController = require("../controllers/post.js");

// POST REVIEW
router.post("/", isLoggedIn , wrapAsync(reviewController.createReview));

// DELETE REVIEW
router.delete("/:reviewId", wrapAsync(reviewController.destroyRoutes));

module.exports = router;
