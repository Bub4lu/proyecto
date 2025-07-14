const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Login", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado"))
.catch((err) => console.log("Error al conectar MongoDB:", err));

const loginSchema = new mongoose.Schema({
  name: String,
  password: String,
});

const User = mongoose.model("User", loginSchema);
module.exports = User;