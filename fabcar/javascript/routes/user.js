var express = require('express');
const userController1 = require('../controllers/userUpDownDel');
const userController2 = require('../controllers/userShowReq');
const isAuth = require('../middleware/is-auth');
var router = express.Router();

// Upload - Download related.
router.get('/', userController1.getFrontPage);

router.get('/upload', userController1.getUploadFile);
router.post('/upload', userController1.postUploadFile);

router.get('/download', userController1.getDownloadFile);
router.post('/download', userController1.postDownloadFile);


router.get('/uploaded', isAuth, userController1.getUploadedFiles);
router.get('/downloaded', userController1.getDownloadedFiles);

router.post('/delete-file/:myFileId', userController1.deleteFile);




// Show and  request-handling related.


router.get('/show-file/:myFileId', userController2.showFileById);

router.get('/notification', userController2.getAllNotifications);


router.get('/show-decrypted-content/:fileContent/:noncePlain/:nonceGet', userController2.showDecryptedFileContent);

router.get('/request', userController2.getAllRequests);



router.post('/request-file/:ownerId/:fileName', userController2.requestFile);

router.post('/grant-permission/:requesterId/:requestedFileId', userController2.grantPermission);

router.post('/deny-permission/:requesterId/:requestedFileId', userController2.denyPermission);

module.exports = router;