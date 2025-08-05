require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Healthcheck endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは親切で丁寧なアシスタントです。日本語で自然な会話をしてください。"
        },
        {
          role: "user",
          content: event.message.text
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    const echo = { type: 'text', text: reply };

    return client.replyMessage(event.replyToken, echo);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    const errorMessage = { type: 'text', text: 'すみません、現在応答できません。後でもう一度お試しください。' };
    return client.replyMessage(event.replyToken, errorMessage);
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});