import React, { useState, useEffect } from "react";
import { FaUser, FaRobot, FaCopy } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../../contexts/AuthContext";

// Define custom CSS variables at the top of the file
const styles = {
  userBubbleBg: "#000000", // Black background for user messages
  copyButtonBlue: "#3b82f6", // Blue color for copy button
};

const TypingIndicator = () => (
  <div className="flex items-center gap-2 py-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.2}s`,
          animation: `pulse 1.5s infinite ${i * 0.2}s`,
        }}
      />
    ))}
    <span className="ml-2 text-sm text-gray-500">AI is thinking...</span>
  </div>
);

const StreamingText = ({ content, speed = 20 }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!content) return;

    setDisplayedContent("");
    setIsComplete(false);

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [content, speed]);

  return (
    <div>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-2">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => <ul className="pl-4 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="pl-4 mb-2">{children}</ol>,
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {!isComplete && (
        <span className="inline-block w-0.5 h-5 bg-blue-500 animate-pulse ml-0.5" />
      )}
    </div>
  );
};

const MessageActions = ({ message, onCopy }) => {
  return (
    <div
      className="flex gap-1 mt-2 opacity-100" // Always visible now
    >
      <button
        onClick={() => onCopy(message.content)}
        className="p-1 rounded-md transition-colors"
        title="Copy message"
        style={{
          backgroundColor: styles.copyButtonBlue,
          color: "white",
          fontSize: "0.75rem", // Smaller button
        }}
      >
        <FaCopy size={12} /> {/* Smaller icon */}
      </button>
    </div>
  );
};

const MessageBubble = ({ message, onCopy }) => {
  const { user } = useAuth(); // Get user from AuthContext
  // Check both type and sender fields to determine if it's a user message
  const isUser = message.type === "user" || message.sender === "user";

  return (
    <div
      className={`flex items-start gap-3 mb-6 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
          isUser ? "bg-blue-500" : "bg-gray-600"
        }`}
      >
        {isUser ? <FaUser size={20} /> : <FaRobot size={20} />}
      </div>

      <div className="max-w-3xl min-w-48">
        {/* Message Header */}
        <div
          className={`flex items-center gap-2 mb-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`px-2 py-1 text-xs rounded-full border ${
              isUser
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {isUser ? user?.name || "You" : "AI Assistant"}{" "}
            {/* Use actual username */}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Message Content */}
        <div
          className={`relative p-4 rounded-lg ${
            isUser
              ? "text-white"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
          style={{
            backgroundColor: isUser ? styles.userBubbleBg : "", // Black background for user messages
          }}
        >
          {/* Speech bubble tail */}
          <div
            className={`absolute top-2 w-0 h-0 ${
              isUser
                ? "right-5 border-l-8 border-l-transparent border-b-8"
                : "left-5 border-r-8 border-r-transparent border-b-8 border-b-white dark:border-b-gray-800"
            }`}
            style={{
              top: "-8px",
              borderBottomColor: isUser ? styles.userBubbleBg : "", // Match the bubble color
            }}
          />

          {message.streaming &&
          (message.type === "assistant" || message.sender === "ai") ? (
            <StreamingText content={message.content} />
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="my-2">
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      className={`px-1 py-0.5 rounded text-sm font-mono ${
                        isUser
                          ? "bg-blue-400 bg-opacity-30"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-2 leading-relaxed last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="pl-4 mb-2 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="pl-4 mb-2 list-decimal">{children}</ol>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Message Actions - now always visible */}
          <MessageActions message={message} onCopy={onCopy} />
        </div>
      </div>
    </div>
  );
};

const ChatMessages = ({ messages, isTyping, messageSending }) => {
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="min-h-full pb-4">
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className="animate-in fade-in duration-300"
          style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
        >
          <MessageBubble message={message} onCopy={handleCopy} />
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white">
            <FaRobot size={20} />
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
