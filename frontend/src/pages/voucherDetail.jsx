import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout';
import { AuthContext } from '../context/authContext';
import { ArrowLeft, Check, X, UploadCloud, FileSignature, Save } from 'lucide-react';

const VoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // State for Editing Draft
  const [editForm, setEditForm] = useState({
    expenseTitle: '',
    expenseCategory: '',
    expenseDate: '',
    amount: '',
    expenseDescription: ''
  });

  // States for Director Actions
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      const { data } = await api.get(`/vouchers/${id}`);
      setVoucher(data);
      
      // Initialize edit form if it's a draft
      if (data.status === 'DRAFT') {
        setEditForm({
          expenseTitle: data.expenseTitle,
          expenseCategory: data.expenseCategory,
          expenseDate: new Date(data.expenseDate).toISOString().split('T')[0],
          amount: data.amount,
          expenseDescription: data.expenseDescription || ''
        });
      }
    } catch (err) {
      setErrorMsg('Failed to load voucher details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraft = async () => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data } = await api.put(`/vouchers/${id}`, editForm);
      setVoucher(data);
      setSuccessMsg('Draft updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update draft.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!signatureFile) {
      setErrorMsg('Employee signature is required to submit.');
      return;
    }
    setActionLoading(true);
    try {
      // 1. Save any pending changes first
      await api.put(`/vouchers/${id}`, editForm);

      // 2. Upload Signature
      const formData = new FormData();
      formData.append('signature', signatureFile);
      const uploadRes = await api.post('/upload/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Submit
      await api.patch(`/vouchers/${id}/submit`, { employeeSignatureUrl: uploadRes.data.imageUrl });
      navigate('/employee');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Submission failed.');
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!signatureFile) {
      setErrorMsg('Director signature is required to approve.');
      return;
    }
    
    setActionLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('signature', signatureFile);

      const uploadRes = await api.post('/upload/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.patch(`/vouchers/${id}/approve`, {
        directorSignatureUrl: uploadRes.data.imageUrl,
      });

      navigate('/director');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Approval failed.');
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMsg('Rejection reason is mandatory.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      await api.patch(`/vouchers/${id}/reject`, {
        rejectionReason,
      });
      navigate('/director');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Rejection failed.');
      setActionLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (loading) return <Layout><div className="p-8 text-center">Loading voucher details...</div></Layout>;
  if (!voucher) return <Layout><div className="p-8 text-center text-red-500">{errorMsg}</div></Layout>;

  const isEditableDraft = user?.role === 'EMPLOYEE' && voucher.status === 'DRAFT';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{errorMsg}</div>}
        {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">{successMsg}</div>}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{voucher.voucherNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">Created on {new Date(voucher.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full 
              ${voucher.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                voucher.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                voucher.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
              {voucher.status.replace('_', ' ')}
            </span>
          </div>

          {/* Details Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Employee Details</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-gray-900">Name:</span> {voucher.employeeName}</p>
                <p><span className="font-medium text-gray-900">Department:</span> {voucher.department}</p>
              </div>
            </div>
            
            {/* Conditional Rendering: Editable Form vs Static Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
                Expense Details
                {isEditableDraft && (
                  <button onClick={handleUpdateDraft} disabled={actionLoading} className="text-blue-600 hover:text-blue-800 flex items-center text-xs bg-blue-50 px-2 py-1 rounded">
                    <Save className="h-3 w-3 mr-1" /> Save Edits
                  </button>
                )}
              </h3>
              
              {isEditableDraft ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Title</label>
                    <input type="text" name="expenseTitle" value={editForm.expenseTitle} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Category</label>
                    <select name="expenseCategory" value={editForm.expenseCategory} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white">
                      <option value="Travel">Travel</option>
                      <option value="Meals">Meals</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="Training">Training</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Date</label>
                    <input type="date" name="expenseDate" value={editForm.expenseDate} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Amount (₹)</label>
                    <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium text-gray-900">Title:</span> {voucher.expenseTitle}</p>
                  <p><span className="font-medium text-gray-900">Category:</span> {voucher.expenseCategory}</p>
                  <p><span className="font-medium text-gray-900">Date:</span> {new Date(voucher.expenseDate).toLocaleDateString()}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">Amount: ₹{voucher.amount.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
              {isEditableDraft ? (
                <textarea name="expenseDescription" value={editForm.expenseDescription} onChange={handleEditChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border" />
              ) : (
                <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-100">
                  {voucher.expenseDescription || 'No description provided.'}
                </p>
              )}
            </div>
          </div>

          {/* Signatures Section - HIDDEN FOR DRAFTS */}
          {voucher.status !== 'DRAFT' && (
            <div className="border-t border-gray-200 p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <FileSignature className="h-4 w-4 mr-2" /> Employee Signature
                </h3>
                {voucher.employeeSignatureUrl ? (
                  <img src={voucher.employeeSignatureUrl} alt="Employee Signature" className="h-20 object-contain bg-white border border-gray-200 p-2 rounded-md" />
                ) : (
                  <p className="text-sm text-gray-400 italic">Not provided yet</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <FileSignature className="h-4 w-4 mr-2" /> Director Signature
                </h3>
                {voucher.directorSignatureUrl ? (
                  <img src={voucher.directorSignatureUrl} alt="Director Signature" className="h-20 object-contain bg-white border border-gray-200 p-2 rounded-md" />
                ) : (
                  <p className="text-sm text-gray-400 italic">Pending Approval</p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Reason Display */}
          {voucher.status === 'REJECTED' && voucher.rejectionReason && (
            <div className="border-t border-red-200 bg-red-50 p-6">
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2">Rejection Reason</h3>
              <p className="text-sm text-red-700">{voucher.rejectionReason}</p>
            </div>
          )}
          
          {/* Employee Action: Submit Draft */}
          {isEditableDraft && (
            <div className="border-t border-gray-200 p-6 bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Voucher for Approval</h3>
              <div className="flex items-center justify-center w-full mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-blue-500" />
                    <p className="mb-2 text-sm text-blue-700 font-semibold">
                      {signatureFile ? signatureFile.name : 'Click to upload your signature (Required to submit)'}
                    </p>
                    <p className="text-xs text-blue-500">PNG, JPG up to 2MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => setSignatureFile(e.target.files[0])} />
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={handleSubmitDraft} 
                  disabled={actionLoading} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {actionLoading ? 'Submitting...' : 'Submit to Director'}
                </button>
              </div>
            </div>
          )}
          
          {/* Director Actions (Only visible to Directors for Pending Vouchers) */}
          {user?.role === 'DIRECTOR' && voucher.status === 'PENDING_APPROVAL' && (
            <div className="border-t border-gray-200 p-6 bg-white">
              
              {!showApproveForm && !showRejectForm && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white rounded-md hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" /> Reject
                  </button>
                  <button
                    onClick={() => setShowApproveForm(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve Voucher
                  </button>
                </div>
              )}

              {/* Approve Form */}
              {showApproveForm && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Approval Signature</h3>
                  <div className="flex items-center justify-center w-full mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-green-500" />
                        <p className="mb-2 text-sm text-green-700 font-semibold">
                          {signatureFile ? signatureFile.name : 'Click to upload your signature'}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0])} />
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => { setShowApproveForm(false); setSignatureFile(null); }} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-green-400">
                      {actionLoading ? 'Approving...' : 'Confirm Approval'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Form */}
              {showRejectForm && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Provide Rejection Reason</h3>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this voucher is being rejected..."
                    className="w-full border border-gray-300 rounded-md p-3 mb-4 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                  <div className="flex justify-end space-x-3">
                    <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:bg-red-400">
                      {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VoucherDetail;