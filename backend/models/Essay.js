const mongoose = require('mongoose');

const EssaySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Хэрэглэгчийн Firebase UID
  title: { type: String, required: true }, // 👈 Энэ мөрийг нэм
  essayText: { type: String, required: true },
  aiFeedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Essay', EssaySchema);