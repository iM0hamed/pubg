import mongoose from "mongoose";
import { createErr, createOk } from "option-t/cjs/PlainResult";
import { MONGO_CONNECTION_URI } from "../../constants";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  retryWrites: false,
};

export const Database = {
  connect: async () => {
    console.log("[Info]: (mongo) connecting ...");
    try {
      const connection = await mongoose.connect(MONGO_CONNECTION_URI, options);
      console.log("[Info]: (mongo) successfully connected");
      return createOk(connection);
    } catch (error) {
      console.log("[Error]: (mongo) connection failed");
      return createErr(error);
    }
  },
  disconnect: async () => {
    console.log("[Info]: (mongo) close connection ...");
    return mongoose.disconnect();
  },
};
