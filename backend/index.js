import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";

import path from 'path'
import * as util from 'util';
import { fileURLToPath } from 'url';

dotenv.config();

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL, 
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
// const voiceID = "LcfcDJNUP1GQjkzn1xUU";  // Emily
// const voiceID = "GBv7mTt0atIp3Br8iCZE"

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});


const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

// const execCommand = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  // runRhubarb(
  //   `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
  // )
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  const rhubarbPath = path.resolve(__dirname, 'bin', 'rhubarb.exe'); 
  await execCommand(
    // `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
    `${rhubarbPath} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  // runRhubarb(
  //   `.\bin\rhubarb.exe -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  // )
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

async function runRhubarb(cmd) {
  // const rhubarbPath = path.resolve(__dirname, 'bin', 'rhubarb.exe'); // Using in Windows
  // const inputWav = path.resolve(__dirname, 'audios', `message_${message}.wav`);
  // const outputJson = path.resolve(__dirname, 'audios', `message_${message}.json`);

  // const cmd = `"${rhubarbPath}" -f json -o "${outputJson}" "${inputWav}" -r phonetic`;

  try {
    await execCommand(cmd);
    console.log(`✅ LipSync data generated：audios/message_${message}.json`);
  } catch (error) {
    console.error('Rhubarb run fail：', error.message);
  }
}

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const voiceID = req.body.voiceID;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || openai.apiKey === "-") {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        You are a virtual girlfriend.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let content = completion.choices[0].message.content
  let cleandContent = content.replace(/```json\n?/, '').replace(/```$/, '');
  let messages = JSON.parse(cleandContent);
  // let messages = JSON.parse(completion.choices[0].message.content);
  console.log("messfileNameages", messages)
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    console.log("fileName", fileName)
    console.log("textInput", textInput)
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
