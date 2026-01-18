const multer = require('multer');
const firebaseStorage = require('multer-firebase-storage');
const firebase = require('./firebase.config');
const serviceAccount = require('../drive-2244e-firebase-adminsdk-fbsvc-d4a3b61234.json');
const { credential } = require('firebase-admin');

const storage = firebaseStorage({
    credentials: firebase.credential.cert(serviceAccount),
    bucketName: 'drive-2244e.appspot.com',
    unique: true,
    
});

const upload = multer({ 
    storage: storage,

});

module.exports = upload;