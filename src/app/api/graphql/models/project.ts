const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: [true, "Title is required"] },
  description: { type: String, required: false },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
