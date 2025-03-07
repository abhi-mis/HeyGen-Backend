const axios = require('axios');
const logger = require('../utils/logger');

class HeyGenController {
  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.heygen.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.HEYGEN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

// In heygen.controller.js
async createVideo(req, res, next) {
  try {
    const { video_url, output_language, title } = req.body;
    
    const response = await this.apiClient.post('/v2/video_translate', {
      video_url,
      output_language,
      title,
      callback_url: `${process.env.API_URL}/webhooks/heygen`
    });

    res.json(response.data);
  } catch (error) {
    logger.error('HeyGen create video error:', error);
    next(error);
  }
}


  // Get video status
  async getVideoStatus(req, res, next) {
    try {
      const { videoId } = req.params;
      const response = await this.apiClient.get(`/videos/${videoId}`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen get video status error:', error);
      next(error);
    }
  }

  // List available avatars
  async listAvatars(req, res, next) {
    try {
      const response = await this.apiClient.get('/avatars');
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen list avatars error:', error);
      next(error);
    }
  }

  // Generate text to speech
  async generateTTS(req, res, next) {
    try {
      const response = await this.apiClient.post('/tts', req.body);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen TTS error:', error);
      next(error);
    }
  }
}

module.exports = new HeyGenController();