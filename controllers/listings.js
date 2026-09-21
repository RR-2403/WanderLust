const Listing = require("../models/listing");
const cloudinary = require("../cloudConfig.js");
const streamifier = require("streamifier");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({
  accessToken: mapToken,
});

// ========================================
// UPLOAD IMAGE TO CLOUDINARY
// ========================================

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "wanderlust_DEV",
        resource_type: "image",
      },

      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ========================================
// INDEX
// ========================================

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});

  res.render("./listings/index.ejs", {
    allListings,
  });
};

// ========================================
// NEW FORM
// ========================================

module.exports.renderNewForm = async (req, res) => {
  res.render("./listings/new.ejs");
};

// ========================================
// SHOW LISTING
// ========================================

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate("reviews");

  res.render("./listings/show.ejs", {
    listing,
  });
};

// ========================================
// CREATE LISTING
// ========================================

module.exports.createListing = async (req, res) => {
  // ----------------------------------------
  // GEOCODING
  // ----------------------------------------

  const response = await geocodingClient
    .forwardGeocode({
      query: `${req.body.location}, ${req.body.country}`,
      limit: 1,
    })
    .send();

  console.log(response.body.features);

  // ----------------------------------------
  // CREATE LISTING
  // ----------------------------------------

  const newListing = new Listing({
    ...req.body,
  });

  // ----------------------------------------
  // SAVE MAPBOX COORDINATES
  // ----------------------------------------

  if (response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  }

  // ----------------------------------------
  // UPLOAD IMAGE TO CLOUDINARY
  // ----------------------------------------

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);

    newListing.image = {
      filename: result.public_id,
      url: result.secure_url,
    };
  }

  // ----------------------------------------
  // SAVE LISTING
  // ----------------------------------------

  await newListing.save();

  // ----------------------------------------
  // FLASH MESSAGE
  // ----------------------------------------

  req.flash("success", "Success! Listing Saved.");

  // ----------------------------------------
  // REDIRECT
  // ----------------------------------------

  res.redirect("/listings");
};

// ========================================
// EDIT FORM
// ========================================

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  res.render("./listings/edit.ejs", {
    listing,
  });
};

// ========================================
// UPDATE LISTING
// ========================================

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // ----------------------------------------
  // FIND EXISTING LISTING
  // ----------------------------------------

  const listing = await Listing.findById(id);

  // ----------------------------------------
  // UPDATE NORMAL FIELDS
  // ----------------------------------------

  listing.title = req.body.title;

  listing.description = req.body.description;

  listing.price = req.body.price;

  listing.country = req.body.country;

  listing.location = req.body.location;

  // ----------------------------------------
  // GEOCODING
  // ----------------------------------------

  const response = await geocodingClient
    .forwardGeocode({
      query: `${req.body.location}, ${req.body.country}`,
      limit: 1,
    })
    .send();

  if (response.body.features.length > 0) {
    listing.geometry = response.body.features[0].geometry;
  }

  // ----------------------------------------
  // UPDATE IMAGE IF NEW IMAGE WAS SELECTED
  // ----------------------------------------

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);

    listing.image = {
      filename: result.public_id,
      url: result.secure_url,
    };
  }

  // ----------------------------------------
  // SAVE CHANGES
  // ----------------------------------------

  await listing.save();

  // ----------------------------------------
  // FLASH MESSAGE
  // ----------------------------------------

  req.flash("success", "Listing updated successfully!");

  // ----------------------------------------
  // REDIRECT
  // ----------------------------------------

  res.redirect(`/listings/${id}`);
};

// ========================================
// DELETE LISTING
// ========================================

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const deletedListing = await Listing.findByIdAndDelete(id);

  console.log(`Deleted listing: ${deletedListing.title}`);

  req.flash("success", "Listing deleted successfully!");

  res.redirect("/listings");
};
