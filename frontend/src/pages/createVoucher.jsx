import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout';
import { Save, Send, AlertCircle, UploadCloud } from 'lucide-react';

const CreateVoucher = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data, actionType) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (actionType === 'SUBMIT' && !signatureFile) {
        setErrorMsg('Signature is mandatory for submitting a voucher.');
        setIsLoading(false);
        return;
      }

      // Step 1: Create the Draft Voucher
      const draftPayload = {
        expenseDate: data.expenseDate,
        expenseTitle: data.expenseTitle,
        expenseCategory: data.expenseCategory,
        expenseDescription: data.expenseDescription,
        amount: parseFloat(data.amount),
      };
      
      const draftRes = await api.post('/vouchers', draftPayload);
      const voucherId = draftRes.data._id;

      // Step 2: If the user chose to "Submit", upload signature and change status
      if (actionType === 'SUBMIT') {
        const formData = new FormData();
        formData.append('signature', signatureFile);

        // Upload to Cloudinary via backend
        const uploadRes = await api.post('/upload/signature', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Submit for approval with the returned URL
        await api.patch(`/vouchers/${voucherId}/submit`, {
          employeeSignatureUrl: uploadRes.data.imageUrl,
        });
      }

      navigate('/employee');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'An error occurred while saving the voucher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Expense Voucher</h1>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errorMsg}
          </div>
        )}

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Expense Title</label>
              <input
                type="text"
                {...register('expenseTitle', { required: 'Title is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.expenseTitle && <p className="mt-1 text-xs text-red-500">{errors.expenseTitle.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expense Date</label>
              <input
                type="date"
                {...register('expenseDate', { required: 'Date is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.expenseDate && <p className="mt-1 text-xs text-red-500">{errors.expenseDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                {...register('expenseCategory', { required: 'Category is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="">Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
              {errors.expenseCategory && <p className="mt-1 text-xs text-red-500">{errors.expenseCategory.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('expenseDescription')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Optional details about the expense..."
            />
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Signature Upload</h3>
            <p className="text-sm text-gray-500 mb-4">Required if you are submitting for approval. Not required for saving a draft.</p>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-semibold">
                    {signatureFile ? signatureFile.name : 'Click to upload signature (Image)'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/employee')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'DRAFT'))}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'SUBMIT'))}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateVoucher;