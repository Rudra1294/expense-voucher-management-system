import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoute';
import Login from './pages/login';
import Register from './pages/register';
import EmployeeDashboard from './pages/employeeDashboard';
import CreateVoucher from './pages/createVoucher';
import DirectorDashboard from './pages/directorDashboard';
import VoucherDetail from './pages/voucherDetail';
import AccountsDashboard from './pages/accountsDashboard';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/employee/*" 
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <Routes>
                  <Route path="" element={<EmployeeDashboard />} />
                  <Route path="create-voucher" element={<CreateVoucher />} />
                  <Route path="voucher/:id" element={<VoucherDetail />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/director/*" 
            element={
              <ProtectedRoute allowedRoles={['DIRECTOR']}>
                <Routes>
                  <Route path="" element={<DirectorDashboard />} />
                  <Route path="voucher/:id" element={<VoucherDetail />} />
                </Routes>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/accounts/*" 
            element={
              <ProtectedRoute allowedRoles={['ACCOUNTS']}>
                <Routes>
                  <Route path="" element={<AccountsDashboard />} />
                  <Route path="voucher/:id" element={<VoucherDetail />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;