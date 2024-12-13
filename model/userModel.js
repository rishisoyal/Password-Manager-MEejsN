import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load dotenv file
dotenv.config();

// Get environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log(`Database Connected Successfully!`);
    })
    .catch((err) => {
        console.error(`Could Not Connect To Database: ${err.message}`);
    });

// Define Schemas
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    logInPassword: { type: String, required: true },
    passwordList: [
        {
            title: {type:String, required: true},
            password: {type:String, required: true},
            _id: {type: mongoose.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }
        }
    ],
});

// Create Model
const user = mongoose.model('user', userSchema);

// Export Model
export default user

