const mongoose = require("mongoose");
mongoose.set('useUnifiedTopology', true);

const { Schema } = mongoose;

// const requiredNumber = { type: Number, required: true };
const requiredString = { type: String, required: true };
const eventSchema = new Schema(
  {
    title: requiredString,
    description: String,
    place: requiredString,
    date: { type: Date, required: true },
    image: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
