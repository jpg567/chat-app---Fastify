const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/fastify")
  .then(() => console.log("Mongodb conencted"))
  .catch((err) => console.log(err));
