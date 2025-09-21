const getUserKey = () => {
  // Get user token and decode it to get user ID
  const token = localStorage.getItem('id_token');
  if (!token) return '';
  
  try {
    // Decode the token to get user info
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.data._id || '';
  } catch (e) {
    console.error('Error decoding token:', e);
    return '';
  }
};