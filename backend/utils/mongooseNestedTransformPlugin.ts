import { Schema } from "mongoose";

const mongooseTransformPlugin = (schema: Schema) => {
  schema.set("toJSON", {
    transform: function (_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      // Check for arrays
      for (const key in ret) {
        if (Array.isArray(ret[key])) {
          ret[key] = ret[key].map((item) => {
            if (item && item._id) {
              return {
                ...item,
                id: item._id,
                
                ...(delete item._id, item),
              };
            }
            return item;
          });
        }
      }
    },
  });
};

export default mongooseTransformPlugin;
