import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { getUserSession } from "../services/auth";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "../styles/Chatbox.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const Chatbox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const speak = (text: string) => {
    const synth = window.speechSynthesis;

    const speakNow = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const frenchVoice = voices.find(
        (v) => v.lang === "fr-FR" && v.name.includes("Google")
      );
      if (frenchVoice) utterance.voice = frenchVoice;
      utterance.lang = "fr-FR";
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      // Esperar un poco para que las voces se carguen
      setTimeout(speakNow, 100);
    } else {
      speakNow();
    }
  };

  // Cargar sesión y mensajes al iniciar
  useEffect(() => {
    const sessionUser = getUserSession();
    if (sessionUser) {
      setUserId(sessionUser.user_id);
    } else {
      console.warn("⚠️ No se encontró un usuario autenticado.");
    }

    const storedMessages = sessionStorage.getItem("chatHistory");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis &&
      speechSynthesis.onvoiceschanged !== undefined
    ) {
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
      };
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const user = getUserSession();
    if (!user || !user.user_id) {
      console.error("❌ Error: No se encontró el user_id");
      return;
    }

    const userMessage: Message = { sender: "user", text: input };

    try {
      const response = await api.post("http://127.0.0.1:8000/api/chat", {
        user_id: user.user_id,
        message: input,
      });

      const botMessage: Message = {
        sender: "bot",
        text: response.data.response,
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);
      sessionStorage.setItem("chatHistory", JSON.stringify(updatedMessages));
      speak(botMessage.text); // ✅ Habla UNA sola vez aquí
    } catch (error) {
      console.error("❌ Error al comunicarse con el chatbot:", error);
    }

    setInput("");
    resetTranscript();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setInput(transcript);
  }, [transcript]);

  return (
    <div className="dashboard-container">
      <div className="chatbox-container">
        <h2 className="chatbox-title">Bienvenue sur le Chat</h2>
        <p className="chatbox-subtitle">
          Posez vos questions, nous sommes là pour vous aider.
        </p>
        <div className="chatbox-header">💬 Chatbot Bien-être</div>

        <div className="chatbox-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <div className="chat-icon">
                {msg.sender === "user" ? <FaUser /> : <FaRobot />}
              </div>
              <div className="chat-text">{msg.text}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chatbox-input">
          <input
            type="text"
            placeholder="Écrivez un message ou utilisez le micro..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>
            <FaPaperPlane />
          </button>
          <button
            onClick={() => {
              resetTranscript();
              SpeechRecognition.startListening({ language: "fr-FR" });
            }}
            className={listening ? "mic-button active" : "mic-button"}
            title="Utiliser le micro"
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
