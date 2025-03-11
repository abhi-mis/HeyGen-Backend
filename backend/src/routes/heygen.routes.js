const express = require('express');
const heygenController = require('../controllers/heygen.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all HeyGen routes
router.use(authenticate);

// Video translation endpoints
router.post('/videos/translate', heygenController.createTranslatedVideo.bind(heygenController));
router.get('/videos/:videoId', heygenController.getVideoStatus.bind(heygenController));
router.delete('/videos/:videoId', heygenController.deleteVideo.bind(heygenController));

// Avatar endpoints
router.get('/avatars', heygenController.listAvatars.bind(heygenController));

// Voice endpoints
router.get('/voices', heygenController.listVoices.bind(heygenController));

// Avatar video endpoints
router.post('/avatar-videos', heygenController.createAvatarVideo.bind(heygenController));

// Text to speech endpoints
router.post('/tts', heygenController.generateTTS.bind(heygenController));

module.exports = router;