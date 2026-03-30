import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  
  // Social connections state - KHỞI TẠO TỪ localStorage NGAY LẬP TỨC
  const [socialLinks, setSocialLinks] = useState(() => {
    const savedLinks = localStorage.getItem('socialLinks');
    if (savedLinks) {
      return JSON.parse(savedLinks);
    }
    return [
      {
        id: 'github',
        name: 'GitHub',
        icon: 'github',
        color: '#1a1e2c',
        bgColor: 'bg-slate-900',
        url: '',
        isConnected: false
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: 'linkedin',
        color: '#0077b5',
        bgColor: 'bg-[#0077b5]',
        url: '',
        isConnected: false
      },
      {
        id: 'twitter',
        name: 'Twitter / X',
        icon: 'twitter',
        color: '#1DA1F2',
        bgColor: 'bg-blue-500',
        url: '',
        isConnected: false
      }
    ];
  });

  const [editingSocial, setEditingSocial] = useState(null);
  const [socialUrl, setSocialUrl] = useState('');
  const [showSocialModal, setShowSocialModal] = useState(false);

  // Lưu social links vào localStorage MỖI KHI CÓ THAY ĐỔI
  useEffect(() => {
    localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
    console.log('Social links saved:', socialLinks); // Debug log
  }, [socialLinks]);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const token = authService.getToken();
      const response = await api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        const user = response.data;
        // Cập nhật localStorage
        const currentUser = authService.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          name: user.name,
          email: user.email,
          sdt: user.sdt,
          location: user.location || currentUser?.location || 'Chicago, IL • GMT-6',
          bio: user.bio || currentUser?.bio || 'Dedicated traffic operations specialist with 12+ years of experience.'
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setProfileData({
          fullName: user.name || 'Marcus Sterling',
          email: user.email || 'm.sterling@violetflux.io',
          phone: user.sdt || '+1 (555) 892-0431',
          location: user.location || 'Chicago, IL • GMT-6',
          bio: user.bio || 'Dedicated traffic operations specialist with 12+ years of experience.'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to localStorage
      const user = authService.getCurrentUser();
      if (user) {
        setProfileData({
          fullName: user.name || 'Marcus Sterling',
          email: user.email || 'm.sterling@violetflux.io',
          phone: user.sdt || '+1 (555) 892-0431',
          location: user.location || 'Chicago, IL • GMT-6',
          bio: user.bio || 'Dedicated traffic operations specialist with 12+ years of experience.'
        });
      }
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Lấy thông tin user từ API khi component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = authService.getToken();
      const response = await api.put('/users/update', {
        name: profileData.fullName,
        email: profileData.email,
        sdt: profileData.phone
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        // Cập nhật user trong localStorage
        const currentUser = authService.getCurrentUser();
        const updatedUser = {
          ...currentUser,
          name: profileData.fullName,
          email: profileData.email,
          sdt: profileData.phone,
          location: profileData.location,
          bio: profileData.bio
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setEditMode(false);
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        
        // Refresh profile from API
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ text: error.response?.data?.message || 'Update failed', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setPasswordLoading(true);
    
    try {
      const token = authService.getToken();
      const response = await api.put('/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setMessage({ text: 'Password updated successfully!', type: 'success' });
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      setMessage({ text: errorMessage, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        const token = authService.getToken();
        await api.delete('/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        authService.logout();
        navigate('/login');
      } catch (error) {
        console.error('Deactivate account error:', error);
        setMessage({ text: 'Failed to deactivate account', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = () => {
    if (editMode) {
      handleUpdateProfile();
    } else {
      setEditMode(true);
    }
  };

  // Social connections functions
  const handleAddSocialLink = (social) => {
    setEditingSocial(social);
    setSocialUrl(social.url || '');
    setShowSocialModal(true);
  };

  const handleSaveSocialLink = () => {
    if (!socialUrl.trim()) return;

    // Validate URL
    let validUrl = socialUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const updatedLinks = socialLinks.map(link => 
      link.id === editingSocial.id 
        ? { ...link, url: validUrl, isConnected: true }
        : link
    );
    
    setSocialLinks(updatedLinks);
    setShowSocialModal(false);
    setEditingSocial(null);
    setSocialUrl('');
    
    // Hiển thị thông báo thành công
    setMessage({ text: `${editingSocial.name} connected successfully!`, type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleRemoveSocialLink = (socialId) => {
    const social = socialLinks.find(s => s.id === socialId);
    const updatedLinks = socialLinks.map(link =>
      link.id === socialId
        ? { ...link, url: '', isConnected: false }
        : link
    );
    setSocialLinks(updatedLinks);
    
    // Hiển thị thông báo
    setMessage({ text: `${social?.name} disconnected`, type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const openSocialLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getSocialIcon = (social) => {
    switch(social.icon) {
      case 'github':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path>
          </svg>
        );
      case 'twitter':
        return (
          <span className="material-symbols-outlined text-sm">alternate_email</span>
        );
      default:
        return null;
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f7f5f8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5f8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Message Toast */}
        {message.text && (
          <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white text-sm animate-in slide-in-from-right-5 duration-300`}>
            {message.text}
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-primary/10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIBIZF8pilwPZnP9ailvY0Rz8VZoBWyvjxEZhjGE6cuiWJYUOlAHDZkdAZK4W6E7F6U2d6oHAXcH4o-XCMD-AL60jxwtquQCWwBMKZO3FIRrpWULPFbzf3uxtNqKtS49IfzS7TyAxAknwVo3jsJ5VchjUTRkfz3djQZ8NU0mtcWoYKRvHLPJ6MuQSAQTCKi-Y4ltfgflu9Am-9KcKYjOCeSngdq-Q8bA9Nu9IF9RsYhMX9I_FVy3CKPK7cqU8FzE5N42Rc7zFxYaw"
                  alt="User avatar"
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full shadow-lg hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  className="text-2xl font-bold text-slate-900 border-b-2 border-primary focus:outline-none mb-1"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{profileData.fullName}</h1>
              )}
              <p className="text-slate-500 text-sm mb-3">Senior Traffic Operations Lead • North Sector</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Pro Member</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full">System Admin</span>
              </div>
            </div>

            {/* Profile Strength */}
            <div className="bg-primary/5 rounded-xl p-4 min-w-[160px]">
              <p className="text-xs font-bold text-primary mb-1">Profile Strength</p>
              <p className="text-2xl font-bold text-primary">85%</p>
              <div className="w-full bg-primary/20 h-1.5 rounded-full mt-2 mb-2">
                <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
              <button className="text-xs text-primary font-medium hover:underline">Complete Now</button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Personal Information
                </h2>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editMode ? 'Save Changes' : 'Edit All')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 font-medium text-sm">{profileData.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 font-medium text-sm">{profileData.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 font-medium text-sm">{profileData.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Location</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-slate-700 font-medium text-sm">{profileData.location}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Short Bio</label>
                  {editMode ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
                    />
                  ) : (
                    <p className="mt-1 text-slate-600 text-sm leading-relaxed">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Authentication */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                Security & Authentication
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f7f5f8] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-slate-500">Protect your account with extra security</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f7f5f8] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">key</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Change Password</p>
                      <p className="text-xs text-slate-500">Last updated 45 days ago</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 py-1.5 border border-primary/20 text-primary text-xs font-medium rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Update
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#f7f5f8] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-200 text-slate-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">devices</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Active Sessions</p>
                      <p className="text-xs text-slate-500">Logged in on 3 devices</p>
                    </div>
                  </div>
                  <button className="text-slate-500 text-xs font-medium hover:text-red-500 transition-colors">Manage</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Social Connections */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary/10">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Social Connections</h2>
              <div className="space-y-2">
                {socialLinks.map((social) => (
                  <div key={social.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => social.url && openSocialLink(social.url)}>
                      <div className={`w-8 h-8 flex items-center justify-center ${social.bgColor} text-white rounded-lg`}>
                        {getSocialIcon(social)}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{social.name}</span>
                        {social.url && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{social.url}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {social.isConnected ? (
                        <>
                          <span className="text-[10px] font-bold text-green-600 uppercase">Connected</span>
                          <button
                            onClick={() => handleRemoveSocialLink(social.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg"
                            title="Remove connection"
                          >
                            <span className="material-symbols-outlined text-red-500 text-sm">delete</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddSocialLink(social)}
                          className="text-[10px] font-bold text-primary uppercase hover:underline"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Impact */}
            <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-5 border border-primary/10">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">System Impact</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Incident Resolutions</span>
                    <span className="text-primary">1,248</span>
                  </div>
                  <div className="w-full bg-primary/10 h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Network Uptime</span>
                    <span className="text-primary">99.98%</span>
                  </div>
                  <div className="w-full bg-primary/10 h-1.5 rounded-full">
                    <div className="bg-primary h-full rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary/10">
                  <p className="text-xs text-slate-500 italic">"Top performing North Sector operator for Q3 2023."</p>
                </div>
              </div>
            </div>

            {/* Deactivate Account */}
            <div className="p-5 rounded-2xl border border-dashed border-red-500/30 text-center cursor-pointer hover:bg-red-50/50 transition-colors"
                 onClick={handleDeactivateAccount}>
              <span className="material-symbols-outlined text-red-500/50 text-3xl">heart_broken</span>
              <p className="font-semibold text-sm text-slate-800 mt-2">Deactivate Account</p>
              <p className="text-xs text-slate-500 mt-1">Temporarily disable your profile</p>
              <button className="mt-3 text-red-500 text-xs font-medium hover:underline">
                Start Process
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[450px] max-w-[90vw] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-primary ${
                      passwordErrors.oldPassword ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-primary ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:border-primary ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-200'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Link Modal */}
      {showSocialModal && editingSocial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[450px] max-w-[90vw] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center ${editingSocial.bgColor} text-white rounded-xl`}>
                  {getSocialIcon(editingSocial)}
                </div>
                <h2 className="text-xl font-bold text-slate-900">Connect {editingSocial.name}</h2>
              </div>
              <button 
                onClick={() => setShowSocialModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveSocialLink(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profile URL</label>
                <input
                  type="url"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                  placeholder={`https://${editingSocial.name.toLowerCase()}.com/username`}
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1">
                  Example: {editingSocial.name === 'GitHub' ? 'https://github.com/username' : 
                            editingSocial.name === 'LinkedIn' ? 'https://linkedin.com/in/username' : 
                            'https://twitter.com/username'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSocialModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;