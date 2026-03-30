import api from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/users/login', {
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Lưu thời gian đăng nhập để kiểm tra session
        localStorage.setItem('loginTime', Date.now().toString());
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi kết nối đến server' };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi kết nối đến server' };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    // Optional: Kiểm tra token hết hạn (nếu bạn lưu thời gian)
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
      const now = Date.now();
      const timeDiff = now - parseInt(loginTime);
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 ngày
      
      if (timeDiff > sevenDays) {
        this.logout(); // Tự động logout nếu quá 7 ngày
        return false;
      }
    }

    return true;
  }

  // Thêm method để refresh token nếu cần
  async refreshToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await api.post('/users/refresh-token', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

export default new AuthService();