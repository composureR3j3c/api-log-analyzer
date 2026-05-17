import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const starterPrompts = [
  "What should I investigate first?",
  "Summarize the current risk",
  "Which service is most affected?",
];

export default function AiChatWidget({
  activeView,
  logs,
  themeClasses,
  uploadedFile,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const nextMessageId = useRef(1);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hi, I can help explain incidents, affected services, security signals, and next actions from the active log file.",
    },
  ]);
  const analysis = useMemo(() => analyzeLogs(logs), [logs]);

  useEffect(() => {
    if (!isOpen) return;

    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages.length]);

  const sendMessage = (messageText = input) => {
    const question = messageText.trim();

    if (!question) return;

    const userMessage = {
      id: `user-${nextMessageId.current}`,
      sender: "user",
      text: question,
    };
    nextMessageId.current += 1;

    const assistantMessage = {
      id: `assistant-${nextMessageId.current}`,
      sender: "assistant",
      text: getAssistantResponse(question, analysis, activeView, uploadedFile),
    };
    nextMessageId.current += 1;

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setInput("");
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section
          className={`w-[min(420px,calc(100vw-2rem))] overflow-hidden border rounded-3xl shadow-2xl ${themeClasses.panel} ${themeClasses.border}`}
          aria-label="AI chat assistant"
        >
          <div
            className={`flex items-center justify-between gap-4 border-b p-4 ${themeClasses.border}`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 p-2 rounded-2xl text-black">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="font-semibold">LogMind AI</h2>
                <p className={`text-xs ${themeClasses.muted}`}>
                  {uploadedFile || "No active file"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`rounded-xl p-2 transition ${themeClasses.navIdle}`}
              aria-label="Close AI chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-4 space-y-3">
            <div className={`rounded-2xl p-4 ${themeClasses.panelAlt}`}>
              <div className="flex items-center gap-2 text-yellow-500">
                <Sparkles size={16} />
                <p className="text-sm font-semibold">Live context</p>
              </div>
              <p className={`${themeClasses.muted} mt-2 text-sm`}>
                {getContextLine(analysis, activeView)}
              </p>
            </div>

            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                themeClasses={themeClasses}
              />
            ))}

            <div ref={chatEndRef} />
          </div>

          <div className={`border-t p-4 ${themeClasses.border}`}>
            <div className="flex flex-wrap gap-2 mb-3">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${themeClasses.border} ${themeClasses.navIdle}`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about incidents, services, or risk..."
                className={`min-w-0 flex-1 border rounded-2xl px-4 py-3 outline-none focus:border-yellow-500 ${themeClasses.input} ${themeClasses.border}`}
                aria-label="Ask LogMind AI"
              />
              <button
                type="submit"
                className="shrink-0 rounded-2xl bg-yellow-500 p-3 text-black transition hover:bg-yellow-400"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex items-center gap-3 rounded-full bg-yellow-500 px-5 py-4 font-semibold text-black shadow-xl shadow-black/25 transition hover:bg-yellow-400"
        aria-label={isOpen ? "Hide AI chat" : "Open AI chat"}
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    </div>
  );
}

function ChatBubble({ message, themeClasses }) {
  const isUser = message.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-yellow-500 text-black"
            : `${themeClasses.panelAlt} ${themeClasses.muted}`
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

function analyzeLogs(logs) {
  const critical = logs.filter((log) => log.level === "Critical");
  const warnings = logs.filter((log) => log.level === "Warning");
  const security = logs.filter((log) => log.level === "Security");
  const topService = getTopService(logs);
  const serviceCount = new Set(logs.map((log) => log.service)).size;

  return {
    criticalCount: critical.length,
    warningCount: warnings.length,
    securityCount: security.length,
    totalCount: logs.length,
    serviceCount,
    topService,
    mostRecent: logs[0],
  };
}

function getTopService(logs) {
  if (logs.length === 0) return "No service yet";

  const counts = logs.reduce((serviceCounts, log) => {
    serviceCounts.set(log.service, (serviceCounts.get(log.service) || 0) + 1);
    return serviceCounts;
  }, new Map());

  return [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  )[0][0];
}

function getContextLine(analysis, activeView) {
  if (analysis.totalCount === 0) {
    return `You are on ${activeView}. Upload a log file and I will analyze incidents here.`;
  }

  return `${analysis.totalCount} incidents loaded across ${analysis.serviceCount} services. ${analysis.topService} has the strongest signal.`;
}

function getAssistantResponse(question, analysis, activeView, uploadedFile) {
  if (analysis.totalCount === 0) {
    return "I do not have log entries to analyze yet. Upload a .log file first, then I can explain risk, affected services, and next actions.";
  }

  const normalizedQuestion = question.toLowerCase();

  if (/first|priority|investigate|start|next/.test(normalizedQuestion)) {
    return getPriorityResponse(analysis);
  }

  if (/risk|summary|summarize|status|overview/.test(normalizedQuestion)) {
    return getRiskResponse(analysis, uploadedFile);
  }

  if (/service|affected|owner|component/.test(normalizedQuestion)) {
    return `${analysis.topService} is the most affected service. I would compare its recent deploys, dependency health, and traffic changes against the latest incidents.`;
  }

  if (/security|auth|login|access|denied|unauthorized/.test(normalizedQuestion)) {
    return getSecurityResponse(analysis);
  }

  if (/latest|recent|last/.test(normalizedQuestion)) {
    return analysis.mostRecent
      ? `The latest incident I see is ${analysis.mostRecent.level} in ${analysis.mostRecent.service}: ${analysis.mostRecent.message}`
      : "I do not see a latest incident yet.";
  }

  return `From the ${activeView} view, I see ${analysis.totalCount} incidents: ${analysis.criticalCount} critical, ${analysis.warningCount} warning, and ${analysis.securityCount} security. Ask me what to investigate first, which service is most affected, or whether this looks security-related.`;
}

function getPriorityResponse(analysis) {
  if (analysis.criticalCount > 0) {
    return `Start with ${analysis.topService}. There are ${analysis.criticalCount} critical events, so the fastest path is to inspect recent errors, deploys, and dependency failures for that service.`;
  }

  if (analysis.securityCount > 0) {
    return `Start with access and authentication events. I found ${analysis.securityCount} security signals, so review denied, forbidden, unauthorized, or suspicious login patterns first.`;
  }

  return `Start by watching ${analysis.topService}. The current pattern is warning-heavy, so check retries, timeouts, slow responses, and degradation before it becomes critical.`;
}

function getRiskResponse(analysis, uploadedFile) {
  const fileLabel = uploadedFile ? ` in ${uploadedFile}` : "";

  if (analysis.criticalCount > 0 && analysis.securityCount > 0) {
    return `High risk${fileLabel}. Critical failures and security events are both present, which can mean an outage is touching access or authentication flows.`;
  }

  if (analysis.criticalCount > 0) {
    return `High operational risk${fileLabel}. I found ${analysis.criticalCount} critical events, with ${analysis.topService} as the strongest source.`;
  }

  if (analysis.securityCount > 0) {
    return `Security review recommended${fileLabel}. I found ${analysis.securityCount} security events across ${analysis.serviceCount} services.`;
  }

  return `Moderate risk${fileLabel}. The file is warning-heavy, with ${analysis.topService} showing the strongest pattern.`;
}

function getSecurityResponse(analysis) {
  if (analysis.securityCount === 0) {
    return "I do not see security-classified incidents in the active file. I would still watch for repeated denied, forbidden, or unauthorized messages.";
  }

  return `Yes, there is a security signal. I found ${analysis.securityCount} security events, and ${analysis.topService} is the first service I would review for authentication or authorization failures.`;
}
