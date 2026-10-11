import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout';
import { Search, Filter, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

const DirectorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [searchQuery, statusFilter]); // Re-fetch when filters change

  const fetchDashboardData = async () => {
    try {
      // Build query string for filters
      let queryParams = '?sortBy=createdAt&order=desc';
      if (searchQuery) queryParams += `&search=${searchQuery}`;
      if (statusFilter) queryParams += `&status=${statusFilter}`;

      const [statsRes, vouchersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/vouchers${queryParams}`)
      ]);
      setStats(statsRes.data);
      setVouchers(vouchersRes.data);
    } catch (error) {
      console.error('Error fetching director dashboard data:', error);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Director Dashboard</h1>
        <p className="text-gray-600">Review and manage employee expense vouchers.</p>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-yellow-400">
            <div className="flex items-center text-gray-500 mb-1"><Clock className="h-4 w-4 mr-1"/> Action Required</div>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-green-400">
            <div className="flex items-center text-gray-500 mb-1"><CheckCircle className="h-4 w-4 mr-1"/> Approved</div>
            <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-red-400">
            <div className="flex items-center text-gray-500 mb-1"><XCircle className="h-4 w-4 mr-1"/> Rejected</div>
            <div className="text-2xl font-bold text-gray-900">{stats.rejected}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400">
            <div className="flex items-center text-gray-500 mb-1"><DollarSign className="h-4 w-4 mr-1"/> Total Pending Amount</div>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalPendingAmount.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-t-lg border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Employee Name or Voucher No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white shadow-sm rounded-b-lg border border-t-0 border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <tr key={voucher._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{voucher.voucherNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {voucher.employeeName}
                  <div className="text-xs text-gray-500">{voucher.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(voucher.expenseDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{voucher.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(voucher.status)}`}>
                    {voucher.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/director/voucher/${voucher._id}`)}
                    className="text-blue-600 hover:text-blue-900 font-semibold"
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No vouchers match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default DirectorDashboard;