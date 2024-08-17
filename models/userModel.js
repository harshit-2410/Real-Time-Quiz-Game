const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true , required : true },
    lastName: { type: String, trim: true , required : true },
    avatarUrl: { type: String },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    mobile: { type: String },
    lastLogin : {type : Date , index : true},
    isLoggedIn : {type : Boolean , default : false , index : true},
    inGame: { type: Boolean, default: false , index : true},
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: "Game" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
   
    if (this.isModified('password') || this.isNew) {
      try {
        
        this.password = await bcrypt.hash(this.password, 12);
      } catch (error) {
        return next(new Error("Password hashing failed"));
      }
    }
   
    next();
  });

userSchema.methods.comparePassword = async function (candidatePassword) {
    console.log(this.password , candidatePassword)
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
