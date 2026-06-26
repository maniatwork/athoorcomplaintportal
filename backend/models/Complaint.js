import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[6-9][0-9]{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit mobile number starting with 6-9.`
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address.`
      }
    },
    assemblyConstituency: {
      type: String,
      required: true,
      default: "129 - ATHOOR",
      trim: true
    },
    wardNumber: {
      type: Number,
      required: true,
      min: [1, "Ward number must be positive."]
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[1-9][0-9]{5}$/.test(v);
        },
        message: props => `${props.value} is not a valid 6-digit pin code.`
      }
    },
    pdfFilePath: {
      type: String,
      required: true,
      trim: true
    },
    village: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending"
    },
    pendingReason: {
      type: String,
      trim: true,
      default: ""
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
