import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      unique: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    expenseDate: {
      type: Date,
      required: true
    },
    expenseTitle: {
      type: String,
      required: true
    },
    expenseCategory: {
      type: String,
      required: true
    },
    expenseDescription: {
      type: String
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than zero']
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'DRAFT'
    },
    employeeSignatureUrl: {
      type: String
    },
    directorSignatureUrl: {
      type: String
    },
    rejectionReason: {
      type: String
    },
    approvalDate: {
      type: Date
    }
  },
  { timestamps: true }
);

// Pre-save hook to auto-generate a sequential-style voucher number if it doesn't exist
voucherSchema.pre('save', function () {
  if (!this.voucherNumber) {
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
    this.voucherNumber = `VOU-${datePrefix}-${randomSuffix}`;
  }
});

const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;