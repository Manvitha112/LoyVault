import mongoose from "mongoose";
import dotenv from "dotenv";
import LoyaltyProgram from "./models/LoyaltyProgram.js";
import Customer from "./models/Customer.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/loyvault";

async function migrateLoyaltyPrograms() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("Connected to MongoDB");
    
    // Find all loyalty programs without did field
    const programs = await LoyaltyProgram.find({ did: { $exists: false } }).populate('customer');
    
    console.log(`Found ${programs.length} loyalty programs without did field`);
    
    let updated = 0;
    for (const program of programs) {
      if (program.customer && program.customer.did) {
        program.did = program.customer.did;
        await program.save();
        updated++;
        console.log(`Updated program for customer DID: ${program.customer.did}`);
      } else {
        console.log(`Skipping program ${program._id} - no customer DID found`);
      }
    }
    
    console.log(`\nMigration complete! Updated ${updated} loyalty programs.`);
    
    // Verify
    const allPrograms = await LoyaltyProgram.find({});
    console.log(`\nTotal loyalty programs: ${allPrograms.length}`);
    const withDid = allPrograms.filter(p => p.did);
    console.log(`Programs with did field: ${withDid.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateLoyaltyPrograms();
