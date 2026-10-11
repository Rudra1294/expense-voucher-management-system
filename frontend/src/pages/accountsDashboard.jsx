import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout';
import { FileText, CheckCircle, Clock, XCircle, DollarSign, Download } from 'lucide-react';

const AccountsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Backend automatically filters `/vouchers` to only show APPROVED for the Accounts role
      const [statsRes, vouchersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/vouchers?sortBy=approvalDate&order=desc')
      ]);
      setStats(statsRes.data);
      setVouchers(vouchersRes.data);
    } catch (error) {
      console.error('Error fetching accounts dashboard data:', error);
    }
  };

  const handleExportCSV = () => {
    if (vouchers.length === 0) return alert('No vouchers to export');
    
    const headers = ['Voucher Number,Employee,Department,Category,Amount,Approved Date\n'];
    const rows = vouchers.map(v => 
      `${v.voucherNumber},${v.employeeName},${v.department},${v.expenseCategory},${v.amount},${new Date(v.approvalDate).toLocaleDateString()}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "approved_vouchers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Dashboard</h1>
        <p className="text-gray-600">View approved vouchers ready for reimbursement processing.</p>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 ">
            <div className="flex items-center text-gray-500 mb-1"><FileText className="h-4 w-4 mr-1"/> Total Vouchers</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalVouchers}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 ">
            <div className="flex items-center text-gray-500 mb-1"><Clock className="h-4 w-4 mr-1"/> Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-gray-500 mb-1"><XCircle className="h-4 w-4 mr-1"/> Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-green-400">
            <div className="flex items-center text-gray-500 mb-1"><CheckCircle className="h-4 w-4 mr-1"/> Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400">
            <div className="flex items-center text-gray-500 mb-1"><DollarSign className="h-4 w-4 mr-1"/> Total Approved Amt</div>
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalApprovedAmount.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Approved Vouchers (Pending Reimbursement)</h3>
          <button onClick={handleExportCSV} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voucher No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.map((voucher) => (
              <tr key={voucher._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{voucher.voucherNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{voucher.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{voucher.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {voucher.approvalDate ? new Date(voucher.approvalDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-green-600">₹{voucher.amount.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/accounts/voucher/${voucher._id}`)}
                    className="text-blue-600 hover:text-blue-900 font-semibold"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No approved vouchers ready for processing at this time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AccountsDashboard;