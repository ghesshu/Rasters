import React, { useState, useEffect, memo } from "react";
import { FaUser, FaRobot, FaCopy, FaCheck } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuth } from "../../contexts/AuthContext";
 // Import the CSS file

// Design tokens for consistent styling
const theme = {
  colors: {
    user: {
      bubble: "#6b21a8", // Purple-800
      avatar: "#9333ea", // Purple-600
      label: "#f3e8ff", // Purple-50
      labelText: "#6b21a8", // Purple-800
    },
    assistant: {
      bubble: "#ffffff",
      bubbleDark: "#1f2937", // Gray-800
      avatar: "#6b7280", // Gray-500
      label: "#f9fafb", // Gray-50
      labelText: "#374151", // Gray-700
    },
    actions: {
      copy: "#3b82f6",
      success: "#10b981", // Green-500
    },
  },
};

// Typing indicator with smooth animation
const TypingIndicator = memo(() => (
  <div className="typing-indicator">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="typing-dot"
        style={{
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    <span className="typing-text">AI is thinking...</span>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

// Streaming text component with cursor
const StreamingText = memo(({ content, speed = 15 }) => {
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
    <>
      <MessageContent content={displayedContent} />
      {!isComplete && <span className="streaming-cursor" />}
    </>
  );
});
StreamingText.displayName = "StreamingText";

// Message content renderer
const MessageContent = memo(({ content }) => {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="code-block">
          <div className="code-header">
            <span>{match[1]}</span>
            <button
              onClick={() => navigator.clipboard.writeText(String(children))}
              className="code-copy-btn"
            >
              <FaCopy size={12} />
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.875rem",
              padding: "1rem",
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }) => <p className="message-paragraph">{children}</p>,
    ul: ({ children }) => <ul className="message-list">{children}</ul>,
    ol: ({ children }) => <ol className="message-list ordered">{children}</ol>,
    li: ({ children }) => <li className="message-list-item">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="message-blockquote">{children}</blockquote>
    ),
    h1: ({ children }) => <h1 className="message-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="message-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="message-h3">{children}</h3>,
  };

  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
});
MessageContent.displayName = "MessageContent";

// Message actions component
const MessageActions = memo(({ message, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="message-actions">
      <button
        onClick={handleCopy}
        className={`action-button ${copied ? "copied" : ""}`}
        title={copied ? "Copied!" : "Copy message"}
      >
        {copied ? (
          <>
            <FaCheck size={12} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <FaCopy size={12} />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
});
MessageActions.displayName = "MessageActions";

// Individual message bubble component
const MessageBubble = memo(({ message, onCopy }) => {
  const { user } = useAuth();
  const isUser = message.type === "user" || message.sender === "user";
  const isStreaming = message.streaming && !isUser;

  return (
    <div className={`message-container ${isUser ? "user" : "assistant"}`}>
      {/* Avatar */}
      <div className={`avatar ${isUser ? "user-avatar" : "assistant-avatar"}`}>
        {isUser ? <FaUser size={18} /> : <FaRobot size={18} />}
      </div>

      <div className="message-wrapper">
        {/* Message Header */}
        <div className="message-header">
          <span
            className={`message-label ${
              isUser ? "user-label" : "assistant-label"
            }`}
          >
            {isUser ? user?.name || "You" : "AI Assistant"}
          </span>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Message Content */}
        <div
          className={`message-bubble ${
            isUser ? "user-bubble" : "assistant-bubble"
          }`}
        >
          <div className="bubble-tail" />

          <div className="bubble-content">
            {isStreaming ? (
              <StreamingText content={message.content} />
            ) : (
              <MessageContent content={message.content} />
            )}
          </div>

          {/* Message Actions */}
          {!isStreaming && (
            <div className="bubble-actions">
              <MessageActions message={message} onCopy={onCopy} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// Main chat messages component
const ChatMessages = ({ messages, isTyping, messageSending }) => {
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="chat-messages-container">
      <div className="chat-messages-inner">
        {messages.map((message, index) => (
          <div
            key={message.id || `message-${index}`}
            className="message-fade-in"
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
          >
            <MessageBubble message={message} onCopy={handleCopy} />
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="message-container assistant">
            <div className="avatar assistant-avatar">
              <FaRobot size={18} />
            </div>
            <div className="typing-bubble">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessages;
