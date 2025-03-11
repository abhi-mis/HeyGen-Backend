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

  // List avatar groups
  async listAvatarGroups(req, res) {
    try {
      const includePublic = req.query.include_public === 'true';
      const response = await this.apiClient.get(`/v2/avatar_group.list?include_public=${includePublic}`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen list avatar groups error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to fetch avatar groups'
      });
    }
  }

  // List avatars in a specific group
  async listAvatarsInGroup(req, res) {
    try {
      const { groupId } = req.params;
      const response = await this.apiClient.get(`/v2/avatar_group/${groupId}/avatars`);
      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen list avatars in group error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to fetch avatars in group'
      });
    }
  }

  // Create avatar video
  async createAvatarVideo(req, res) {
    try {
      const { 
        title,
        caption = false,
        callback_id,
        video_inputs,
        dimension,
        folder_id,
        callback_url
      } = req.body;

      if (!video_inputs || !dimension) {
        return res.status(400).json({
          message: 'Missing required fields: video_inputs and dimension are required'
        });
      }

      const response = await this.apiClient.post('/v2/video/generate', {
        title,
        caption,
        callback_id,
        video_inputs,
        dimension,
        folder_id,
        callback_url
      });

      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen create avatar video error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to create avatar video'
      });
    }
  }

  // Create WebM video
  async createWebMVideo(req, res) {
    try {
      const {
        avatar_pose_id = 'Vanessa-invest-20220722',
        avatar_style = 'normal',
        input_text,
        voice_id,
        input_audio,
        dimension
      } = req.body;

      if ((!input_text || !voice_id) && !input_audio) {
        return res.status(400).json({
          message: 'Either (input_text and voice_id) or input_audio must be provided'
        });
      }

      const response = await this.apiClient.post('/v1/video.webm', {
        avatar_pose_id,
        avatar_style,
        input_text,
        voice_id,
        input_audio,
        dimension
      });

      res.json(response.data);
    } catch (error) {
      logger.error('HeyGen create WebM video error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || 'Failed to create WebM video'
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
}

module.exports = new HeyGenController();