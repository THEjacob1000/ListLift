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
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: ["TODO", "IN_PROGRESS", "DONE"],
  },
  category: { type: String, required: false },
});

export default mongoose.models.Task ||
  mongoose.model("Task", taskSchema);
