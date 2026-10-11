import express from 'express';
import {
  createVoucher,
  getVouchers,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  getVoucherById,
  updateVoucher,
} from '../controllers/voucherController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all vouchers (Filtering handled in controller based on role)
router.get('/', protect, getVouchers);

// Employee Routes
router.post('/', protect, authorize('EMPLOYEE'), createVoucher);
router.put('/:id', protect, authorize('EMPLOYEE'), updateVoucher);
router.patch('/:id/submit', protect, authorize('EMPLOYEE'), submitVoucher);

// Director Routes
router.patch('/:id/approve', protect, authorize('DIRECTOR'), approveVoucher);
router.patch('/:id/reject', protect, authorize('DIRECTOR'), rejectVoucher);
router.get('/:id', protect, getVoucherById);

export default router;