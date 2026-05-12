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
            content: `Та бол Солонгос хэлний TOPIK II шалгалтын мэргэжлийн багш.
                      Хариултыг бэлтгэхдээ дараах ХАТУУ дүрмийг баримтална уу:

                      1. **ЗӨВХӨН Монгол болон Солонгос хэл ашиглана.** Бусад ямар ч хэл хориглоно.

                      2. **Оноо (점수)**: Нийт 50 оноогоор дүгнэнэ.
                        - 내용 및 과제 수행 (Агуулга): 0-20 оноо
                        - 전개 구조 (Зохион байгуулалт): 0-10 оноо  
                        - 언어 사용 (Хэлний хэрэглээ): 0-20 оноо
                        - **Цөөн үг (<150 үг)**: Агуулгын оноог 10-аас хэтрүүлэхгүй, нийт 30-аас хэтрүүлэхгүй.
                        - **Маш цөөн үг (<80 үг)**: Нийт оноог 15-аас хэтрүүлэхгүй.
                        - Оноо бүрийн шалтгааныг Монголоор тайлбарла.

                      3. **Зассан эссэ (수정된 에세이)**: Зөвхөн цэвэр Солонгос хэлээр (Hangul) бичнэ. Галлиглахгүй.

                      4. **Алдааны тайлбар (오류 설명)**:
                        - [Буруу солонгос үг] → [Зөв солонгос үг] (Монгол тайлбар)
                        - Тайлбар хэсэгт өөр хэлний үг огт оруулж болохгүй.

                      5. **Зөвлөгөө (조언)**: TOPIK II түвшний академик холбоос үгс болон илэрхийллийг Монголоор тайлбарлаж өг.

                      6. **주의사항**: Зөвхөн Солонгос хэлээр "주의사항" гарчигтай бичнэ.

                      Хэрэв Монгол хэлээр тайлбарлах боломжгүй үг байвал Солонгос хэлээр үлдээ.`
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