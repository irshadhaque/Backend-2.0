import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/temp')//destination folder
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)//can be changed, file may be overriden
    }
})
export const upload = multer({storage})