import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file , cb){
        cb(null, './public/temp')
    },
    filename: function(req, file , cb){
         // if want to change the file name 
        // const uniqueSufix = Date.now() + '-' + Math.round(Math.
        //     random() * 1E9)
        // cb(null , file.fieldname + '-'+ uniqueSufix)

        // for keeping the original name 
        cb(null , file.originalname)
    }
})

export const upload = multer({
    storage
})
