import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'EMPLOYEE' }
  });
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const role = await registerUser(data);
      if (role === 'EMPLOYEE') navigate('/employee');
      if (role === 'DIRECTOR') navigate('/director');
      if (role === 'ACCOUNTS') navigate('/accounts');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {errorMsg && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {errorMsg}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">System Role</label>
            <select
              {...register('role')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="DIRECTOR">Director</option>
              <option value="ACCOUNTS">Accounts Team</option>
            </select>
          </div>

          {selectedRole === 'EMPLOYEE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  {...register('employeeId', { required: 'Employee ID is required for employees' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.employeeId && <p className="mt-1 text-xs text-red-500">{errors.employeeId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  {...register('department', { required: 'Department is required for employees' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 mt-6"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;