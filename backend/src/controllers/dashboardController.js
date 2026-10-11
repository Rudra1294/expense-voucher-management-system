import Voucher from '../models/Voucher.js';
import mongoose from 'mongoose';

// @desc    Get role-specific dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  const role = req.user.role;
  const userId = new mongoose.Types.ObjectId(req.user._id);

  try {
    let matchStage = {};
    
    // Isolate data based on role
    if (role === 'EMPLOYEE') {
      matchStage.createdBy = userId;
    } else if (role === 'ACCOUNTS') {
      // Accounts only care about Approved vouchers for total amount, but might want overall counts
      // We will leave matchStage empty to count all, but restrict the amount sum later
    }

    // Aggregation pipeline to count statuses and sum amounts
    const stats = await Voucher.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalVouchers: { $sum: 1 },
          draft: {
            $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING_APPROVAL'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
          },
          // Employee: Sum of all approved/pending. Director: Sum of pending. Accounts: Sum of approved.
          totalAmountClaimed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [role, 'EMPLOYEE'] },
                    { $in: ['$status', ['PENDING_APPROVAL', 'APPROVED']] }
                  ]
                },
                '$amount',
                0
              ]
            }
          },
          totalPendingAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: [role, ['DIRECTOR', 'ACCOUNTS']] },
                    { $eq: ['$status', 'PENDING_APPROVAL'] }
                  ]
                },
                '$amount',
                0
              ]
            }
          },
          totalApprovedAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: [role, ['DIRECTOR', 'ACCOUNTS']] },
                    { $eq: ['$status', 'APPROVED'] }
                  ]
                },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0 // Remove the null _id from the output
        }
      }
    ]);

    // If no vouchers exist yet, return default zeroes
    const defaultStats = {
      totalVouchers: 0, draft: 0, pending: 0, approved: 0, rejected: 0,
      totalAmountClaimed: 0, totalPendingAmount: 0, totalApprovedAmount: 0
    };

    res.json(stats.length > 0 ? stats[0] : defaultStats);

  } catch (error) {
    res.status(500);
    throw new Error('Failed to fetch dashboard statistics');
  }
};