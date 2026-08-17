import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed },
  cropName: { type: String, required: true },
  variety: { type: String },
  quantityKg: { type: Number, required: true },
  grade: { type: String },
  condition: { type: String },
  location: { type: String },
  harvestDate: { type: String },
  storageStatus: { type: String },
  estValueRs: { type: Number },
  image: { type: String },
  imageUrl: { type: String },
  recommendation: { type: Object, required: true }
}, { timestamps: true });

const Lot = mongoose.models.Lot || mongoose.model("Lot", lotSchema);

export default Lot;
