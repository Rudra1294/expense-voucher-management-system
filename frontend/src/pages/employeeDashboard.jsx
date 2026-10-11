import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, vouchersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/vouchers')
      ]);
      setStats(statsRes.data);
      setVouchers(vouchersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <button
          onClick={() => navigate('/employee/create-voucher')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Voucher
        </button>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-1"><FileText className="h-4 w-4 mr-1"/> Total</div>
            <div className="text-2xl font-bold">{stats.totalVouchers}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-1"><Clock className="h-4 w-4 mr-1"/> Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-1"><CheckCircle className="h-4 w-4 mr-1"/> Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center text-gray-500 mb-1"><XCircle className="h-4 w-4 mr-1"/> Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center text-gray-500 mb-1"><DollarSign className="h-4 w-4 mr-1"/> Total Claimed</div>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalAmountClaimed.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <tr key={voucher._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{voucher.voucherNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(voucher.expenseDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.expenseCategory}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{voucher.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(voucher.status)}`}>
                    {voucher.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/employee/voucher/${voucher._id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No vouchers found. Click "Create Voucher" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;