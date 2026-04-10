//Importação do Cloudinary e da conexão com ele.
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const {CloudinaryStorage} = require("multer-storage-cloudinary");

//Armazenando as imagens dos axolotes no Cloudinary.
const storageImagensAquarios = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
    folder: "aquarios",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
})

//
module.exports = multer({storage: storageImagensAquarios});