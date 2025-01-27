const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://surajqwe777:xCAtSFgGK5lcVMT6@cluster0.jbnahs0.mongodb.net/devtinderdb"
    );
}
module.exports = connectDB
