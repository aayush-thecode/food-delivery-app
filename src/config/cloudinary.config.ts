import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLUD_NAME, 
    api_key: process.env.CLOUDINARY_PUBLIC_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

export {cloudinary}