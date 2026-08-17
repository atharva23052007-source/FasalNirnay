import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.Mixed },
    crop: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    unit: {
        type: String,
        default: "kg"
    },

    recommendation: {
        type: String,
        required: true
    },

    reason: {
        type: String
    },

    imageUrl: {
        type: String
    }
});

const Lot = mongoose.model("Lot", lotSchema);

export default Lot;