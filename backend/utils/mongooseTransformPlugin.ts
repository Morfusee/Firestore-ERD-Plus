import { Schema } from "mongoose";

const mongooseTransformPlugin = (schema: Schema) => {
  schema.set("toJSON", {
    transform: function (_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  });
};

export default mongooseTransformPlugin;
