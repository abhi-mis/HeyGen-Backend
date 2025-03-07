const axios = require('axios');
const logger = require('../utils/logger');

class HeyGenController {
  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.heygen.com/v2',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }


  async createVideo(req, res, next) {
    try {
      const { video_url, output_language, title } = req.body;
      
      if (!video_url || !output_language || !title) {
        return res.status(400).json({ 
          message: 'Missing required fields: video_url, output_language, and title are required' 
        });
      }

      const response = await this.apiClient.post('/video_translate', {
        video_url,
        output_language,
        title,
        translate_audio_only: false,
        enable_dynamic_duration: true,
        callback_url: `${process.env.API_URL}/webhooks/heygen`
      });

      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen create video error:', error.response?.data || error.message);
      
      // Handle specific API errors
      if (error.response?.status === 404) {
        return res.status(404).json({ 
          message: 'The video URL could not be accessed. Please ensure it is publicly accessible.'
        });
      }
      
      res.status(error.response?.status || 500).json({ 
        message: error.response?.data?.message || 'Failed to process video request'
      });
    }
  }

  async getVideoStatus(req, res, next) {
    try {
      const { videoId } = req.params;
      const response = await this.apiClient.get(`/video_translate/${videoId}`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen get video status error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        message: error.response?.data?.message || 'Failed to get video status'
      });
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