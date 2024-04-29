const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  title: { type: String, required: [true, "Title is required"] },
  description: { type: String, required: false },
  priority: {
    type: String,
    required: [true, "Priority is required"],
    enum: ["LOW", "MEDIUM", "HIGH"],
  },
  deadline: { type: String, required: false },
  completed: {
    type: Boolean,
    required: [true, "Completed status is required"],
    default: false,
  },
  category: { type: String, required: false },
});

export default mongoose.models.Task ||
  mongoose.model("Task", taskSchema);
