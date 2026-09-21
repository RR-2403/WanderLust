const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  const newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyRoutes = async (req, res) => {
  const { id, reviewId } = req.params;

  // Delete review from Review collection
  await Review.findByIdAndDelete(reviewId);

  // Remove review reference from Listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  res.redirect(`/listings/${id}`);
};
