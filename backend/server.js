const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Essay Model-ийг дуудах
// (models/Essay.js файл чинь бэлэн байгаа гэж үзлээ)
const Essay = require('./models/Essay'); 

const app = express();
app.use(cors());
app.use(express.json());

// 1. MongoDB-тэй холбогдох
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB-тэй холбогдлоо"))
  .catch(err => console.error("❌ Холболтын алдаа:", err));

// 2. Эссэ шалгах болон Хадгалах зам (Route)
// ... (дээрх import хэсэг хэвээрээ)

app.post('/api/check-essay', async (req, res) => {
  try {
    // 1. Frontend-ээс title-ийг нэмж авна
    const { title, essay, userId } = req.body; 

    // Шалгалт: Гарчиг, эссэ, userId бүгд байх ёстой
    if (!title || !essay || !userId) {
      return res.status(400).json({ error: "Гарчиг эсвэл эссэ дутуу байна." });
    }

    // 2. Groq API-руу хүсэлт явуулах
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        // ... (бусад код хэвээрээ)
        messages: [
          { 
            role: 'system', 
            content: `content:Та бол Солонгос хэлний TOPIK II шалгалтын мэргэжлийн багш. 
            Хариултыг бэлтгэхдээ дараах ХАТУУ дүрмийг баримтална уу:

            1. **ЗӨВХӨН Монгол болон Солонгос хэл ашиглана.** Хятад, Вьетнам, Англи эсвэл өөр ямар ч хэл ашиглахыг ХАТУУ хориглоно.
            2. **Оноо (Score)**: Агуулга, Зохион байгуулалт, Хэлний хэрэглээг тус бүр 15-20 оноогоор дүгнэж Монголоор тайлбарла.
            3. **Зассан эссэ (Corrected Essay)**: Зөвхөн цэвэр Солонгос хэлээр (Hangul) бичнэ. Галлиглахгүй.
            4. **Алдааны тайлбар (Error Details)**: 
              - [Буруу солонгос үг] -> [Зөв солонгос үг] (Монгол тайлбар)
              - Тайлбар хэсэгт өөр хэлний үг огт оруулж болохгүй.
            5. **Зөвлөгөө (Tips)**: Академик түвшний холбоос үгсийг Монголоор тайлбарлаж өг.
            6. **Анхаарах зүйл**: Зөвхөн Солонгос хэлээр "주의사항" гарчигтай бичнэ.

            Хэрэв чи Монгол хэлээр тайлбарлаж чадахгүй үг байвал бусад хэл ашиглахын оронд Солонгос хэлээр нь үлдээ.`
          },
          { 
            role: 'user', 
            content: `Сэдэв: ${title}\nЭссэ: ${essay}`
          }

        ]
      })
    });

    const data = await response.json();
    
    // API-аас алдаа ирсэн эсэхийг шалгах (жишээ нь Groq key буруу бол)
    if (!data.choices || !data.choices[0]) {
      throw new Error("AI-аас хариу ирсэнгүй. Groq API-г шалгана уу.");
    }

    const aiText = data.choices[0].message.content;

    // 3. MongoDB-д хадгалах (userId болон title-тай хамт)
    const savedEssay = new Essay({
      userId: userId,
      title: title, 
      essayText: essay,
      aiFeedback: aiText
    });
    
    await savedEssay.save();

    res.json({ result: aiText });

  } catch (error) {
    // Консол дээр яг ямар алдаа гарсныг харуулна
    console.error("❌ Backend Error:", error.message);
    res.status(500).json({ error: "Сервер дээр алдаа гарлаа: " + error.message });
  }
});

// 3. Зөвхөн тухайн хэрэглэгчийн түүхийг авах
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Татаж буй хэрэглэгчийн ID:", userId);

    // MongoDB-гээс шүүх (Заавал массив буцаахын тулд)
    const history = await Essay.find({ userId: userId }).sort({ createdAt: -1 });
    
    // Хэрэв дата байхгүй бол хоосон массив буцаана
    res.json(history || []); 
  } catch (error) {
    console.error("❌ Backend алдаа:", error);
    res.status(500).json([]); // Алдаа гарвал хоосон массив буцааж Frontend-ийг гацаахаас сэргийлнэ
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));