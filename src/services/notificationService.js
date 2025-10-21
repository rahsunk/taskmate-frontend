import apiClient from "../config/api.js";

const NOTIFICATION_BASE = "/Notification";

export const notificationService = {
  // Create notification configuration
  async createNotificationConfig(config) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/createNotificationConfig`,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to create notification config"
      );
    }
  },

  // Edit notification configuration
  async editNotificationConfig(settingID, config) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/editNotificationConfig`,
        {
          settingID,
          ...config,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to edit notification config"
      );
    }
  },

  // Delete notification configuration
  async deleteNotificationConfig(settingID) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/deleteNotificationConfig`,
        {
          settingID,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to delete notification config"
      );
    }
  },

  // Send notification
  async sendNotification(owner, targetItem, notificationType, contextData) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/sendNotification`,
        {
          owner,
          targetItem,
          notificationType,
          contextData,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to send notification"
      );
    }
  },

  // Get notification settings for user
  async getNotificationSettingsForUser(owner) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/_getNotificationSettingsForUser`,
        {
          owner,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get notification settings"
      );
    }
  },

  // Get sent notifications for setting
  async getSentNotificationsForSetting(settingID) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/_getSentNotificationsForSetting`,
        {
          settingID,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get sent notifications"
      );
    }
  },

  // Get enabled setting
  async getEnabledSetting(owner, targetItem, notificationType) {
    try {
      const response = await apiClient.post(
        `${NOTIFICATION_BASE}/_getEnabledSetting`,
        {
          owner,
          targetItem,
          notificationType,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to get enabled setting"
      );
    }
  },
};
