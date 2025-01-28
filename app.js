const express = require("express"); // Import express module
const mongoose = require("mongoose"); // Import mongoose for database interaction
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique IDs

const app = express();
const port = 3000;

// MongoDB connection string
const mongourl =
  "mongodb+srv://kiruthika24:csbskiru@cluster0.ipdec.mongodb.net/ExpenseTracker";

// Connect to MongoDB
mongoose
  .connect(mongourl) // No need for additional options
  .then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
        console.log(`Server is running at port ${port}`);

    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });


// Middleware to parse JSON requests
app.use(express.json());

// Define schema and model
const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // UUID for unique identification
  title: { type: String, required: true, trim: true }, // Trim whitespace
  amount: { type: Number, required: true, min: 0 }, // Non-negative amount
});

const expenseModel = mongoose.model("expense-tracker", expenseSchema);

// Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await expenseModel.find();
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error.message);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// Get a specific expense by ID
app.get("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await expenseModel.findOne({ id });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error.message);
    res.status(500).json({ message: "Error in fetching expense" });
  }
});

// Create a new expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount } = req.body;

    if (!title || amount == null) {
      return res.status(400).json({ message: "Title and amount are required" });
    }

    const newExpense = new expenseModel({
      id: uuidv4(),
      title,
      amount,
    });
    const savedExpense = await newExpense.save(); // Save to database
    res.status(201).json(savedExpense); // Send response
  } catch (error) {
    console.error("Error creating expense:", error.message);
    res.status(500).json({ message: "Error in creating expense" });
  }
});

// Update an expense by ID
app.put("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount } = req.body;

  if (!title || amount == null) {
    return res.status(400).json({ message: "Title and amount are required" });
  }

  try {
    const updatedExpense = await expenseModel.findOneAndUpdate(
      { id },
      { title, amount },
      { new: true } // Return the updated document
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error.message);
    res.status(500).json({ message: "Error in updating expense" });
  }
});

// Delete an expense by ID
app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params; // Custom 'id' field, not MongoDB '_id'

  try {
    const deletedExpense = await expenseModel.findOneAndDelete({ id });
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({
      message: "Expense deleted successfully",
      deletedExpense,
    });
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    res.status(500).json({ message: "Error in deleting expense" });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});