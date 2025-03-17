const axios = require('axios');
const logger = require('../utils/logger');

class HeyGenController {
  constructor() {
    if (!process.env.HEYGEN_API_KEY) {
      throw new Error('HEYGEN_API_KEY is required');
    }

    this.apiClient = axios.create({
      baseURL: 'https://api.heygen.com',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Separate client for upload endpoint
    this.uploadClient = axios.create({
      baseURL: 'https://upload.heygen.com',
      headers: {
        'x-api-key': process.env.HEYGEN_API_KEY
      }
    });
  }

  // Upload talking photo
  async uploadTalkingPhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No image file provided'
        });
      }

      // Validate content type
      const contentType = req.file.mimetype;
      if (contentType !== 'image/jpeg' && contentType !== 'image/png') {
        return res.status(400).json({
          message: 'Invalid file type. Only JPEG and PNG files are supported.'
        });
      }

      const response = await this.uploadClient.post('/v1/talking_photo', req.file.buffer, {
        headers: {
          'Content-Type': contentType
        }
      });

      res.json({
        ...response.data,
        message: 'Photo uploaded successfully'
      });
    } catch (error) {
      logger.error('HeyGen upload talking photo error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to upload talking photo'
      });
    }
  }

  // Create talking photo video
  async createTalkingPhotoVideo(req, res) {
    try {
      const {
        talking_photo_id,
        input_text,
        voice_id,
        background_type = 'color',
        background_value = '#FAFAFA',
        title
      } = req.body;

      // Validate required fields
      if (!talking_photo_id || !input_text || !voice_id || !title) {
        return res.status(400).json({
          message: 'Missing required fields: talking_photo_id, input_text, voice_id, and title are required'
        });
      }

      const requestBody = {
        title,
        video_inputs: [{
          character: {
            type: 'talking_photo',
            talking_photo_id
          },
          voice: {
            type: 'text',
            input_text,
            voice_id
          },
          background: {
            type: background_type,
            value: background_value
          }
        }]
      };

      const response = await this.apiClient.post('/v2/video/generate', requestBody);

      res.json({
        ...response.data,
        message: 'Talking photo video creation started successfully'
      });
    } catch (error) {
      logger.error('HeyGen create talking photo video error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to create talking photo video'
      });
    }
  }

  // Create translated video
  async createTranslatedVideo(req, res) {
    try {
      const { video_url, output_language, title } = req.body;
      
      if (!video_url || !output_language || !title) {
        return res.status(400).json({ 
          message: 'Missing required fields: video_url, output_language, and title are required' 
        });
      }

      const response = await this.apiClient.post('/v2/video_translate', {
        video_url,
        output_language,
        title,
        translate_audio_only: false,
        enable_dynamic_duration: true,
        callback_url: `${process.env.API_URL}/webhooks/heygen`
      });

      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen create translated video error:', error.response?.data || error.message);
      
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

  // List available avatars
  async listAvatars(req, res) {
    try {
      const response = await this.apiClient.get('/v2/avatars');
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen list avatars error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to fetch avatars'
      });
    }
  }

  // List available voices
  async listVoices(req, res) {
    try {
      const response = await this.apiClient.get('/v2/voices');
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen list voices error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to fetch voices'
      });
    }
  }

  // Create avatar video
  async createAvatarVideo(req, res) {
    try {
      const { 
        avatar_pose_id,
        input_text,
        voice_id,
        title,
        dimension = { width: 1280, height: 720 },
        avatar_style = 'normal'
      } = req.body;

      // Validate required fields
      if (!avatar_pose_id || !input_text || !voice_id || !title) {
        return res.status(400).json({
          message: 'Missing required fields: avatar_pose_id, input_text, voice_id, and title are required'
        });
      }

      // Format the request body according to HeyGen V2 API
      const requestBody = {
        title,
        video_inputs: [{
          character: {
            type: "avatar",
            avatar_id: avatar_pose_id,
            avatar_style: avatar_style
          },
          voice: {
            type: "text",
            voice_id: voice_id,
            input_text: input_text
          }
        }],
        dimension
      };

      const response = await this.apiClient.post('/v2/video/generate', requestBody);

      res.json({
        ...response.data,
        message: 'Avatar video creation started successfully'
      });
    } catch (error) {
      logger.error('HeyGen create avatar video error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to create avatar video'
      });
    }
  }

  // Get video status
  async getVideoStatus(req, res) {
    try {
      const { videoId } = req.params;
      const response = await this.apiClient.get(`/v1/video_status.get?video_id=${videoId}`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen get video status error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to get video status'
      });
    }
  }

  // Delete video
  async deleteVideo(req, res) {
    try {
      const { videoId } = req.params;
      const response = await this.apiClient.delete(`/v1/video.delete?video_id=${videoId}`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen delete video error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to delete video'
      });
    }
  }

  // Generate text to speech
  async generateTTS(req, res) {
    try {
      const response = await this.apiClient.post('/v2/tts', req.body);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen TTS error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to generate text to speech'
      });
    }
  }
}

module.exports = new HeyGenController();