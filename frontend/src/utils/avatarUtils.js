// utils/avatarUtils.js
export const generateAvatar = (seed) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };