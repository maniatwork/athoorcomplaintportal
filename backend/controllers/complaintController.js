import fs from "fs";
import path from "path";
import Complaint from "../models/Complaint.js";
import { generateComplaintId } from "../utils/idGenerator.js";

const formatComplaintResponse = (c) => ({
  id: c._id.toString(),
  complaint_no: c.complaintId,
  full_name: c.fullName,
  phone: c.phoneNumber,
  email: c.email || null,
  assembly_constituency: c.assemblyConstituency,
  village: c.village || "",
  ward_number: c.wardNumber,
  pincode: c.pincode,
  pdf_path: c.pdfFilePath,
  status: c.status || "Pending",
  pending_reason: c.pendingReason || "",
  last_updated: c.lastUpdated || c.updatedAt,
  created_at: c.submittedAt || c.createdAt
});

export const createComplaint = async (req, res) => {
  try {
    const { full_name, phone, email, ward_number, pincode, village } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "A PDF copy of the complaint is required." });
    }

    if (!full_name || !phone || !ward_number || !pincode || !village) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Phone number must be a valid 10-digit number." });
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Pincode must be a valid 6-digit number." });
    }

    const ward = Number(ward_number);
    if (isNaN(ward) || ward <= 0 || !Number.isInteger(ward)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Ward number must be a positive integer." });
    }

    const complaintId = generateComplaintId();

    const newComplaint = new Complaint({
      complaintId,
      fullName: full_name.trim(),
      phoneNumber: phone.trim(),
      email: email ? email.trim() : "",
      assemblyConstituency: "129 - ATHOOR",
      village: village.trim(),
      wardNumber: ward,
      pincode: pincode.trim(),
      pdfFilePath: req.file.filename,
      status: "Pending",
      pendingReason: "",
      lastUpdated: new Date()
    });

    await newComplaint.save();

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint_no: complaintId
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", err);
      }
    }
    return res.status(500).json({ message: "Failed to submit complaint. Please try again." });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const formatted = complaints.map(formatComplaintResponse);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return res.status(500).json({ message: "Failed to load complaints." });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }
    return res.status(200).json(formatComplaintResponse(complaint));
  } catch (error) {
    console.error("Error fetching complaint details:", error);
    return res.status(500).json({ message: "Failed to retrieve complaint details." });
  }
};

export const getComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId: complaintId.trim() });
    if (!complaint) {
      return res.status(404).json({ message: "No complaint found with this Complaint ID." });
    }

    return res.status(200).json({
      complaint_id: complaint.complaintId,
      customer_name: complaint.fullName,
      village: complaint.village || "",
      assembly_constituency: complaint.assemblyConstituency,
      ward_number: complaint.wardNumber,
      submitted_date: complaint.submittedAt || complaint.createdAt,
      status: complaint.status || "Pending",
      status_description: getStatusDescription(complaint.status),
      pending_reason: complaint.pendingReason || "",
      last_updated: complaint.lastUpdated || complaint.updatedAt
    });
  } catch (error) {
    console.error("Error fetching complaint status:", error);
    return res.status(500).json({ message: "Failed to retrieve complaint status." });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pendingReason } = req.body;

    const validStatuses = ["Pending", "Resolved"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (status) complaint.status = status;
    if (pendingReason !== undefined) complaint.pendingReason = pendingReason;
    complaint.lastUpdated = new Date();

    await complaint.save();

    return res.status(200).json({
      message: "Complaint status updated successfully.",
      complaint: formatComplaintResponse(complaint)
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({ message: "Failed to update complaint status." });
  }
};

export const downloadComplaintPdf = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const filePath = path.join("uploads", complaint.pdfFilePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Complaint PDF file not found on the server." });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${complaint.complaintId}.pdf"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    return res.status(500).json({ message: "Failed to download file." });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const filePath = path.join("uploads", complaint.pdfFilePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Complaint deleted successfully." });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return res.status(500).json({ message: "Failed to delete complaint." });
  }
};

function getStatusDescription(status) {
  switch (status) {
    case "Pending":
      return "Your complaint has been received and is awaiting review.";
    case "Resolved":
      return "Your complaint has been resolved successfully.";
    default:
      return "Your complaint has been received.";
  }
}
