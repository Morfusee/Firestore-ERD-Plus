// Commented out for historical preservation

// import { MemberModel } from "@root/types/memberTypes";
// import { model, Schema } from "mongoose";


// const memberSchema = new Schema<MemberModel>(
//   {
//     projectId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Project',
//       required: true,
//     },
//     members: [
//       {
//         userId: {
//           type: Schema.Types.ObjectId,
//           ref: 'User',
//           required: true
//         },
//         role: {
//           type: String,
//           enum: ['owner', 'admin', 'editor', 'viewer'],
//           default: 'viewer',
//           required: true,
//         }
//       }
//     ]
//   },
//   {
//     timestamps: true,
//   }
// )

// const Member = model('Member', memberSchema)

// export default Member