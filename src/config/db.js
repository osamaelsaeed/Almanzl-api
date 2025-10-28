import mongoose from "mongoose";
import { MONGO_URI } from "./config.js";

mongoose.set("debug", function (collectionName, method, query, doc) {
  console.log(
    `Mongoose: ${collectionName}.${method}(${JSON.stringify(
      query
    )}, ${JSON.stringify(doc)})`
  );
});
const initDB = () => {
  mongoose
    .connect(MONGO_URI)
    .then(console.log(`mongo db connected`))
    .catch((err) => {
      console.log(`error: ${err}`);
      process.exit(1);
    });
};

export default initDB;
