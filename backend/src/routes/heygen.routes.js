const express = require('express');
const heygenController = require('../controllers/heygen.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all HeyGen routes
router.use(authenticate);

// Video endpoints
router.post('/videos', heygenController.createVideo.bind(heygenController));
router.get('/videos/:videoId', heygenController.getVideoStatus.bind(heygenController));

// Avatar endpoints
router.get('/avatars', heygenController.listAvatars.bind(heygenController));

// TTS endpoints
router.post('/tts', heygenController.generateTTS.bind(heygenController));

module.exports = router;