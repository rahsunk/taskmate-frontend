import apiClient from "../config/api.js";

const ITEM_SHARING_BASE = "/ItemSharing";

export const itemSharingService = {
  // Make an item shareable
  async makeItemShareable(owner, externalItemID) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/makeItemShareable`,
        {
          owner,
          externalItemID,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to make item shareable"
      );
    }
  },

  // Share item with a user
  async shareItemWith(sharedItem, targetUser) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/shareItemWith`,
        {
          sharedItem,
          targetUser,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to share item");
    }
  },

  // Unshare item with a user
  async unshareItemWith(sharedItem, targetUser) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/unshareItemWith`,
        {
          sharedItem,
          targetUser,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to unshare item");
    }
  },

  // Accept collaboration invitation
  async acceptToCollaborate(sharedItem, user) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/acceptToCollaborate`,
        {
          sharedItem,
          user,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to accept collaboration"
      );
    }
  },

  // Reject collaboration invitation
  async rejectCollaboration(sharedItem, user) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/rejectCollaboration`,
        {
          sharedItem,
          user,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to reject collaboration"
      );
    }
  },

  // Request changes to shared item
  async requestChange(sharedItem, requester, requestedProperties) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/requestChange`,
        {
          sharedItem,
          requester,
          requestedProperties,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to request changes"
      );
    }
  },

  // Confirm a change request
  async confirmChange(owner, sharedItem, request) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/confirmChange`,
        {
          owner,
          sharedItem,
          request,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Failed to confirm change"
      );
    }
  },

  // Reject a change request
  async rejectChange(owner, sharedItem, request) {
    try {
      const response = await apiClient.post(
        `${ITEM_SHARING_BASE}/rejectChange`,
        {
          owner,
          sharedItem,
          request,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to reject change");
    }
  },
};
