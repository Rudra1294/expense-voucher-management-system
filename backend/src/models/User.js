import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: function() { return this.role === 'EMPLOYEE'; }
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false // Prevents password from being returned in queries by default
    },
    role: {
      type: String,
      enum: ['EMPLOYEE', 'DIRECTOR', 'ACCOUNTS'],
      required: true
    },
    department: {
      type: String,
      required: function() { return this.role === 'EMPLOYEE'; }
    }
  },
  { timestamps: true }
);

// Pre-save hook to hash passwords before saving to the database
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare incoming password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;