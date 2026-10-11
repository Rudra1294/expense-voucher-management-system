import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const role = await login(data.email, data.password);
      
      // Route user to their specific dashboard based on role
      if (role === 'EMPLOYEE') navigate('/employee');
      if (role === 'DIRECTOR') navigate('/director');
      if (role === 'ACCOUNTS') navigate('/accounts');
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Expense Voucher Management System</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;