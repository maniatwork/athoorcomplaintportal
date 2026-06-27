import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const localURI = "mongodb://localhost:27017/athoor_complaints";
const atlasURI = process.env.MONGODB_URI;

if (!atlasURI) {
  console.error("Error: MONGODB_URI is not defined in backend/.env");
  process.exit(1);
}

async function migrate() {
  let localConn, atlasConn;
  try {
    console.log("Connecting to local MongoDB...");
    localConn = await mongoose.createConnection(localURI).asPromise();
    console.log("Connected to local MongoDB successfully!");

    console.log("Connecting to MongoDB Atlas...");
    atlasConn = await mongoose.createConnection(atlasURI).asPromise();
    console.log("Connected to MongoDB Atlas successfully!");

    const localDb = localConn.db;
    const atlasDb = atlasConn.db;

    // Get collections
    const collections = await localDb.listCollections({ name: "complaints" }).toArray();
    if (collections.length === 0) {
      console.log("No 'complaints' collection found in local MongoDB. Nothing to migrate.");
      return;
    }

    const localCollection = localDb.collection("complaints");
    const atlasCollection = atlasDb.collection("complaints");

    const localComplaints = await localCollection.find({}).toArray();
    console.log(`Found ${localComplaints.length} complaints in local database.`);

    if (localComplaints.length === 0) {
      console.log("No complaints found locally. Nothing to migrate.");
      return;
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const complaint of localComplaints) {
      // Use complaintId as unique key to prevent duplicate migrations
      const exists = await atlasCollection.findOne({ complaintId: complaint.complaintId });
      if (exists) {
        console.log(`Complaint ${complaint.complaintId} already exists in MongoDB Atlas. Skipping.`);
        skippedCount++;
      } else {
        await atlasCollection.insertOne(complaint);
        console.log(`Successfully migrated complaint ${complaint.complaintId}`);
        insertedCount++;
      }
    }

    console.log("\n================ MIGRATION REPORT ================");
    console.log(`Total local complaints: ${localComplaints.length}`);
    console.log(`Successfully migrated:  ${insertedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log("==================================================\n");

  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    console.log("Connections closed.");
  }
}

migrate();
