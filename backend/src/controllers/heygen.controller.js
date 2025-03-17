const axios = require('axios');

class HeyGenController {
  constructor() {
    this.API_KEY = 'Nzg5NWRhNDkzODJjNGIwYzhjOWJjZTBhMTE1Zjg3ZWEtMTczNDYwNTU4NQ==';

    this.apiClient = axios.create({
      baseURL: 'https://api.heygen.com',
      headers: {
        'X-API-KEY': this.API_KEY,
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    this.uploadClient = axios.create({
      baseURL: 'https://upload.heygen.com',
      headers: {
        'X-API-KEY': this.API_KEY
      }
    });
  }

  async uploadTalkingPhoto(file) {
    try {
      if (!file) {
        throw new Error('No image file provided');
      }

      // Validate content type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG and PNG files are supported.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await this.uploadClient.post('/v1/talking_photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        ...response.data,
        message: 'Photo uploaded successfully'
      };
    } catch (error) {
      console.error('HeyGen upload talking photo error:', error.response?.data || error.message);
      throw new Error(`Failed to upload talking photo: ${error.response?.data?.message || error.message}`);
    }
  }

  async createTalkingPhotoVideo({
    talking_photo_id,
    input_text,
    voice_id,
    background_type = 'color',
    background_value = '#FAFAFA',
    title
  }) {
    try {
      if (!talking_photo_id || !input_text || !voice_id || !title) {
        throw new Error('Missing required fields: talking_photo_id, input_text, voice_id, and title are required');
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
      return {
        ...response.data,
        message: 'Talking photo video creation started successfully'
      };
    } catch (error) {
      console.error('HeyGen create talking photo video error:', error.response?.data || error.message);
      throw new Error(`Failed to create talking photo video: ${error.response?.data?.message || error.message}`);
    }
  }

  async createTranslatedVideo({ video_url, output_language, title, callback_url }) {
    try {
      if (!video_url || !output_language || !title) {
        throw new Error('Missing required fields: video_url, output_language, and title are required');
      }

      const response = await this.apiClient.post('/v2/video_translate', {
        video_url,
        output_language,
        title,
        translate_audio_only: false,
        enable_dynamic_duration: true,
        callback_url
      });

      return response.data;
    } catch (error) {
      console.error('HeyGen create translated video error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new Error('The video URL could not be accessed. Please ensure it is publicly accessible.');
      }
      throw new Error(`Failed to process video request: ${error.response?.data?.message || error.message}`);
    }
  }

  async listAvatars() {
    try {
      const response = await this.apiClient.get('/v2/avatars');
      return response.data;
    } catch (error) {
      console.error('HeyGen list avatars error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch avatars: ${error.response?.data?.message || error.message}`);
    }
  }

  async listVoices() {
    try {
      const response = await this.apiClient.get('/v2/voices');
      return response.data;
    } catch (error) {
      console.error('HeyGen list voices error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch voices: ${error.response?.data?.message || error.message}`);
    }
  }

  async createAvatarVideo({
    avatar_pose_id,
    input_text,
    voice_id,
    title,
    dimension = { width: 1280, height: 720 },
    avatar_style = 'normal'
  }) {
    try {
      if (!avatar_pose_id || !input_text || !voice_id || !title) {
        throw new Error('Missing required fields: avatar_pose_id, input_text, voice_id, and title are required');
      }

      const requestBody = {
        title,
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatar_pose_id,
            avatar_style
          },
          voice: {
            type: 'text',
            voice_id,
            input_text
          }
        }],
        dimension
      };

      const response = await this.apiClient.post('/v2/video/generate', requestBody);
      return {
        ...response.data,
        message: 'Avatar video creation started successfully'
      };
    } catch (error) {
      console.error('HeyGen create avatar video error:', error.response?.data || error.message);
      throw new Error(`Failed to create avatar video: ${error.response?.data?.message || error.message}`);
    }
  }

  async getVideoStatus(videoId) {
    try {
      const response = await this.apiClient.get(`/v1/video_status.get?video_id=${videoId}`);
      return response.data;
    } catch (error) {
      console.error('HeyGen get video status error:', error.response?.data || error.message);
      throw new Error(`Failed to get video status: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteVideo(videoId) {
    try {
      const response = await this.apiClient.delete(`/v1/video.delete?video_id=${videoId}`);
      return response.data;
    } catch (error) {
      console.error('HeyGen delete video error:', error.response?.data || error.message);
      throw new Error(`Failed to delete video: ${error.response?.data?.message || error.message}`);
    }
  }

  async generateTTS(params) {
    try {
      const response = await this.apiClient.post('/v2/tts', params);
      return response.data;
    } catch (error) {
      console.error('HeyGen TTS error:', error.response?.data || error.message);
      throw new Error(`Failed to generate text to speech: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = new HeyGenController();