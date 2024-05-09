const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: [true, "Title is required"] },
  description: { type: String, required: false },
  deadline: { type: Date, required: false },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: ["TODO", "IN_PROGRESS", "DONE"],
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
