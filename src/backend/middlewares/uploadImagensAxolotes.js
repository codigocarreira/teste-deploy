const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const {CloudinaryStorage} = require("multer-storage-cloudinary");

//Armazenando as imagens dos axolotes no Clodinary.
const storageImagensAxolotes = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
    folder: "axolotes",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
})

module.exports = multer({storage: storageImagensAxolotes})
