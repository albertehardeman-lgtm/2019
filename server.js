import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("DB Connected"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req,file,cb)=>{
    cb(null, Date.now()+"-"+file.originalname);
  }
});
const upload = multer({ storage });

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  social: String,
  image: String,
  paymentMethod: String,
  transactionId: String,
  paymentStatus: { type:String, default:"Pending" }
},{timestamps:true});

const User = mongoose.model("User", UserSchema);

app.post("/register", upload.single("image"), async (req,res)=>{
  const { name, phone, social, paymentMethod, transactionId } = req.body;

  const user = await User.create({
    name,
    phone,
    social,
    paymentMethod,
    transactionId,
    image: req.file.filename
  });

  res.json(user);
});

app.get("/users", async(req,res)=>{
  const users = await User.find();
  res.json(users);
});

app.put("/approve/:id", async(req,res)=>{
  await User.findByIdAndUpdate(req.params.id, { paymentStatus:"Approved"});
  res.json({message:"Approved"});
});

app.listen(5000, ()=> console.log("Running"));
