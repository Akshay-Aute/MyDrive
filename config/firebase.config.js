const Firebase = require('firebase-admin');
const serviceAccount = require('../drive-2244e-firebase-adminsdk-fbsvc-d4a3b61234.json')
const firebase = Firebase.initializeApp({
    credential: Firebase.credential.cert(serviceAccount),
    storageBucket: "drive-2244e.appspot.com"
});
module.exports = Firebase;