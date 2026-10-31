import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import { Product } from "../models";
import { products } from "./seed";

// Adds products that are missing (matched by slug). Existing products and admin edits are never touched.
async function main() {
  await connectDB();
  const last = (await Product.findOne().sort({ order: -1 }).lean<{ order: number }>())?.order ?? -1;
  let next = last + 1;
  let added = 0;
  for (const p of products) {
    const res = await Product.updateOne({ slug: p.slug }, { $setOnInsert: { ...p, order: next, stockStatus: "on_request" } }, { upsert: true });
    if (res.upsertedCount) {
      added++;
      next++;
      console.log("added:", p.slug);
    }
  }
  console.log(added ? `${added} product(s) added` : "nothing to add, all products already exist");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
