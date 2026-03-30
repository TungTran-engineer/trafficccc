import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.terms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api-app-gttm.onrender.com/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.fullName,
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          sdt: "0000000000"
        })
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        setSuccess('Register success! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Register failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
      {/* Left Side: Branding & Image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-primary/10 h-full">
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-overlay"
          style={{ 
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBAdl0M0YitahpSF-wy1gwJDdM1dKk-VXEjiV2N1NjvhdUCLuAQyWS2iaYpatVaH6g6ZvVtGe_X4wNy-LLhnvATt3XX_VH8SkpzGlWB2gniNO1WXyeWpFwlMqQeL9KXOaB2-mMbLPfTGeFjS5FQ-RbKzN16FAMxmYHv-E0i0yYJmJxFa4geoqIdiAJC713pOAMzyRHIBs25p9o1aS_nsVY-qPVrdDmbyLSX7GYG-iNQ3cwvqPFNKjWCluZ5SJEsj4kZbz4xjFnCBeY")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/80 to-background-dark/90"></div>
        
        <div className="relative z-20 flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined text-white text-3xl">traffic</span>
          </div>
          <h2 className="text-white text-2xl font-black tracking-tight uppercase">TrafficHub</h2>
        </div>

        <div className="relative z-20 max-w-lg">
          <h1 className="text-white text-5xl font-black leading-tight mb-6">
            Master the pulse of the city.
          </h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Join thousands of urban planners and logistics experts using real-time data to optimize flow and reduce congestion.
          </p>
        </div>

        <div className="relative z-20">
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-3">
              <img 
                alt="User" 
                className="size-10 rounded-full border-2 border-primary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTEC4Ghf8i3-xKesoLS-3qxLJNzeEnL4CBL3vLayTl-QJwqiwupI7UzehoNhBEpfq428_LEPHM8djuiJNwMlsnVD8uTh7i8Ck8F82nS-Qo5q8Zdi6kup0fdzwRRxvULIiIvQ8x_3uLGRzdn94UsxF-oxcWWj9bMDLltP8TW7vlPZDKydKC1P3CVnc-eCFxn5To-oISS3b9P-j_ae6q6DAC1wtG8sg6DbaQGAYYet5stZhbTJdczwtZCKZpPGagBk3N_g-xqdrHPSk"
              />
              <img 
                alt="User" 
                className="size-10 rounded-full border-2 border-primary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGV01s01C8OqxoThbBYkH_8pnL3gLIZe4xk6JffCtovzi06XmI25D9erVV-rMIHq5sGVMOterNtsuODzCuJszoKX1uK6CcU6zizHRu1BXWLg-mbCb05r6bgeA2Ff-fuMk_d6LpISY1WTgLVe1kzuQJwNMYk4_eszWI3U0gpMQM-56_b0MK8Z9Qtj73t7cXsfZQydd95INx43sySoe2PXNeemK0g3BGv6tAliiKJMyntcAoAaPjaiL5nawJY9csd_wk3hiQZCmgiMM"
              />
              <img 
                alt="User" 
                className="size-10 rounded-full border-2 border-primary"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqcJRio5ZDs3BVP1jGQ9A3VBpij4ng_wKWx3unH7RPFCK04tRyWF5yR7Uf7nC_uJFIWx5x5-3M-Hi7TxJmR-Kr3iw0faCAl8nFOGBI9tdhytUF4ngpxsYlNZ4j_Q1c-1ATjRYLLvqaGDD82wg4oLOX840HvuGtylp3P-9IlrRgLG2Fk9kcdT6OimwXwpgBuJyHA2mhWsMVo6T9VVlM6d2EZSkBioAprEfkKYzY4BTvA8yfNf9fHM3uxjYiI3qZOdDHgefYG8eMhiI"
              />
            </div>
            <p className="text-white/90 text-sm">Trusted by 500+ municipalities worldwide</p>
          </div>
        </div>
      </div>

      {/* Right Side: Sign Up Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-full max-w-md px-8 py-6">
          <div className="text-left">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create your account</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Get started with your 14-day free trial today.</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <img 
                alt="Google" 
                className="size-5"
                src="https://phuctdigital.com/wp-content/uploads/2023/05/google-logo.png"
              />
              <span className="text-sm font-semibold">Google</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <img 
                alt="Facebook" 
                className="size-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDny3WhbyeMONaMPRimeXxAPCOnNFqaHdvlyky3by2okisrR8SEHY6scn2S9xEtJsL_TcG23LZvpmqqSExKnPPpZ2QC2Cn5zzB69H_oGJLE_qCc2e4eDgoBifSLrh_USAHG45f57Z8ttDdL5L09ceKVDOYweDsQlT8ujPAOd2yzJpUlmaPZwoK11DSIQmBGUzCPGz_xV3bsH2BoBqCER_1OyzAwy81kAXz3D321T_DDJGbK-7P-Wvecr_iUKGu6T_jTo2xXLr2MoHk"
              />
              <span className="text-sm font-semibold">Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-background-light dark:bg-background-dark px-4 text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 mb-2" htmlFor="full-name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                </div>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-11 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-11 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-11 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 mb-2" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">lock_reset</span>
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-11 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-slate-900 dark:border-slate-800"
              />
              <label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="terms">
                I agree to the{' '}
                <a className="font-semibold text-primary hover:underline" href="#">Terms of Service</a>{' '}
                and{' '}
                <a className="font-semibold text-primary hover:underline" href="#">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-primary px-3 py-4 text-base font-bold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?
            <Link to="/login" className="font-bold leading-6 text-primary hover:text-primary/80 ml-1">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;