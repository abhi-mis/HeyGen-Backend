const express = require('express');
const heygenController = require('../controllers/heygen.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all HeyGen routes
router.use(authenticate);

// Avatar endpoints
router.get('/avatars', heygenController.listAvatars.bind(heygenController));
router.get('/avatar-groups', heygenController.listAvatarGroups.bind(heygenController));
router.get('/avatar-groups/:groupId/avatars', heygenController.listAvatarsInGroup.bind(heygenController));

// Voice endpoints
router.get('/voices', heygenController.listVoices.bind(heygenController));

// Video endpoints
router.post('/videos/translate', heygenController.createTranslatedVideo.bind(heygenController));
router.post('/videos/avatar', heygenController.createAvatarVideo.bind(heygenController));
router.get('/videos/:videoId', heygenController.getVideoStatus.bind(heygenController));

module.exports = router;