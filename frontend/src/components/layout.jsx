import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { LogOut, Receipt } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">VoucherSys</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{user?.name}</span> ({user?.role})
              </div>
              <button
                onClick={logout}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;