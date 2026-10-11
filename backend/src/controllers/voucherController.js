import Voucher from '../models/Voucher.js';

// @desc    Create a new draft voucher
// @route   POST /api/vouchers
// @access  Private (Employee only)
export const createVoucher = async (req, res) => {
  const { expenseDate, expenseTitle, expenseCategory, expenseDescription, amount } = req.body;

  const voucher = await Voucher.create({
    createdBy: req.user._id,
    employeeName: req.user.name,
    department: req.user.department,
    expenseDate,
    expenseTitle,
    expenseCategory,
    expenseDescription,
    amount,
    status: 'DRAFT',
  });

  res.status(201).json(voucher);
};

// @desc    Get all vouchers with Search, Filter & Sort
// @route   GET /api/vouchers
// @access  Private (All Roles)
export const getVouchers = async (req, res) => {
  const {
    search,
    status,
    department,
    expenseCategory,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  // 1. Base Query Object
  let query = {};

  // 2. Role-Based Data Isolation
  if (req.user.role === 'EMPLOYEE') {
    query.createdBy = req.user._id; // Employees only see their own
  } else if (req.user.role === 'ACCOUNTS') {
    query.status = 'APPROVED'; // Accounts team only sees approved vouchers
  } else if(req.user.role === 'DIRECTOR') {
    query.status = { $ne: 'DRAFT' };
  }

  // 3. Search (Voucher Number or Employee Name)
  if (search) {
    query.$or = [
      { voucherNumber: { $regex: search, $options: 'i' } },
      { employeeName: { $regex: search, $options: 'i' } },
    ];
  }

  // 4. Exact Filters
  if (status && req.user.role !== 'ACCOUNTS') {
    if (req.user.role === 'DIRECTOR' && status === 'DRAFT') {
      // Prevent manual DRAFT queries from directors
    } else{
      query.status = status;
    }
  } 
  if (department) query.department = department;
  if (expenseCategory) query.expenseCategory = expenseCategory;

  // 5. Date Range Filter
  if (startDate || endDate) {
    query.expenseDate = {};
    if (startDate) query.expenseDate.$gte = new Date(startDate);
    if (endDate) query.expenseDate.$lte = new Date(endDate);
  }

  // 6. Amount Range Filter
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

  // 7. Sorting Configuration
  const sortConfig = {};
  sortConfig[sortBy] = order === 'asc' ? 1 : -1;

  const vouchers = await Voucher.find(query).sort(sortConfig);
  res.json(vouchers);
};

// @desc    Submit a draft voucher for approval
// @route   PATCH /api/vouchers/:id/submit
// @access  Private (Employee only)
export const submitVoucher = async (req, res) => {
  const { employeeSignatureUrl } = req.body;

  const voucher = await Voucher.findOne({ _id: req.params.id, createdBy: req.user._id });

  if (!voucher) {
    res.status(404);
    throw new Error('Voucher not found');
  }

  if (voucher.status !== 'DRAFT') {
    res.status(400);
    throw new Error('Only DRAFT vouchers can be submitted');
  }

  if (!employeeSignatureUrl) {
    res.status(400);
    throw new Error('Employee signature is required to submit a voucher');
  }

  voucher.status = 'PENDING_APPROVAL';
  voucher.employeeSignatureUrl = employeeSignatureUrl;
  const updatedVoucher = await voucher.save();

  res.json(updatedVoucher);
};

// @desc    Approve a voucher
// @route   PATCH /api/vouchers/:id/approve
// @access  Private (Director only)
export const approveVoucher = async (req, res) => {
  const { directorSignatureUrl } = req.body;

  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    res.status(404);
    throw new Error('Voucher not found');
  }

  if (voucher.status !== 'PENDING_APPROVAL') {
    res.status(400);
    throw new Error('Voucher is not pending approval');
  }

  if (!directorSignatureUrl) {
    res.status(400);
    throw new Error('Director signature is required for approval');
  }

  voucher.status = 'APPROVED';
  voucher.directorSignatureUrl = directorSignatureUrl;
  voucher.approvalDate = new Date();
  const updatedVoucher = await voucher.save();

  res.json(updatedVoucher);
};

// @desc    Reject a voucher
// @route   PATCH /api/vouchers/:id/reject
// @access  Private (Director only)
export const rejectVoucher = async (req, res) => {
  const { rejectionReason } = req.body;

  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    res.status(404);
    throw new Error('Voucher not found');
  }

  if (voucher.status !== 'PENDING_APPROVAL') {
    res.status(400);
    throw new Error('Voucher is not pending approval');
  }

  if (!rejectionReason || rejectionReason.trim() === '') {
    res.status(400);
    throw new Error('Rejection reason is mandatory');
  }

  voucher.status = 'REJECTED';
  voucher.rejectionReason = rejectionReason;
  const updatedVoucher = await voucher.save();

  res.json(updatedVoucher);
};

export const getVoucherById = async (req, res) => {
  const voucher = await Voucher.findById(req.params.id).populate('createdBy', 'name email');

  if (!voucher) {
    res.status(404);
    throw new Error('Voucher not found');
  }

  // Security check: Employees can only view their own vouchers
  if (req.user.role === 'EMPLOYEE' && voucher.createdBy._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this voucher');
  }

  res.json(voucher);
};

// @desc    Update a draft voucher
// @route   PUT /api/vouchers/:id
// @access  Private (Employee only)
export const updateVoucher = async (req, res) => {
  const voucher = await Voucher.findById(req.params.id);

  if (!voucher) {
    res.status(404);
    throw new Error('Voucher not found');
  }

  if (voucher.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this voucher');
  }

  if (voucher.status !== 'DRAFT') {
    res.status(400);
    throw new Error('Only DRAFT vouchers can be edited');
  }

  const updatedVoucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedVoucher);
};