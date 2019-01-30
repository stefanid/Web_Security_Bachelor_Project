
var multer = require('multer');
var imageHandler = {};


var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null,  'public/images/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});


const imageFilter =function(req, file, callback){
    if(!file){
        callback();
    }
    const image = file.mimetype.startsWith('image/');
    if(image){
        console.log('photo uploaded');
        callback(null, true);
    }else{
        console.log("file not supported");
        return callback(new Error('Only image files are allowed!'), false);
    }
};

imageHandler.upload = multer({storage: storage, fileFilter: imageFilter}).single('image');

module.exports = imageHandler;