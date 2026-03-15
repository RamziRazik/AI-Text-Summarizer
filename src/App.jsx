import { GoogleGenAI } from "@google/genai";
import { useState } from "react";
import { IoSparkles } from "react-icons/io5";
import { HiClipboard, HiExclamationCircle, HiPencilAlt, HiCheck } from "react-icons/hi";

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const countWords = (str) => {
    return str
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  };

  const countSentences = (str) => {
    return str
      .trim()
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0).length;
  };

  const pluralize = (count, singular, plural) => {
    return count === 1 ? singular : plural;
  }

  const pasteText = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (error) {
      console.error("Failed to paste: ", error);
      setError("Failed to paste from clipboard. Please use Ctrl+V to paste.");
    }
  }

  const summarizeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to summarize.");
      return;
    }

    if (text.trim().length < 50) {
      setError("Text is too short to summarize. Please enter at least 50 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY, });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Please provide a concise, one-sentence summary of the following text:\n\n" + text,
      });

      const responseText = response.text;
      console.log("AI Response: ", responseText);
      setSummary(responseText);

    } catch (err) {
      console.error("Summarization failed: ", err);
      setError(err.message || "An error occurred while summarizing the text.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy: ", error);
      setError("Failed to copy to clipboard. Please try again.");
    }
  }

  const clearAll = () => {
    setText("");
    setSummary("");
    setError(null);
    setCopied(false);
  };


  return (
    <div
      data-theme="light"
      className="min-h-screen bg-linear-to-br from-purple-100 via-blue-100 to-pink-100"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <IoSparkles className="text-purple-600 hidden sm:block" /> AI Text Summarizer
          </h1>
          <p className="text-xl text-base-content/70 font-medium">
            Powered by Google Gemini AI
          </p>
        </div>
        <div className="card bg-base-100 shadow-2xl max-w-5xl mx-auto">
          <div className="card-body p-8">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <label className="text-lg font-semibold">📝 Enter your text</label>
                <div className="flex items-center gap-3">
                  <div className="tooltip" data-tip={`${text.length} characters`}>
                    <div className="badge badge-sm sm:badge-lg badge-ghost gap-2">
                      {countWords(text)}{" "}
                      {pluralize(countWords(text), "word", "words")}
                      {" "}•{" "}
                      {countSentences(text)}{" "}
                      {pluralize(countSentences(text), "sentence", "sentences")}
                    </div>
                  </div>
                  <button
                    onClick={pasteText}
                    className="btn btn-sm btn-primary gap-2"
                    disabled={loading}
                  >
                    <HiClipboard className="w-4 h-4" />
                    Paste
                  </button>
                </div>
              </div>
              <textarea
                className="textarea textarea-primary w-full h-56 text-base"
                placeholder="Paste your article, blog post, or any long text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              >
              </textarea>
            </div>
            {error && (
              <div className="alert alert-error mb-6">
                <HiExclamationCircle className="w-6 h-6" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-end gap-3 mb-6">
              <button
                className="btn bg-red-500 text-white rounded-lg hover:bg-red-6000"
                onClick={clearAll}
                disabled={loading}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={summarizeText}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <HiPencilAlt className="w-5 h-5" />
                    Summarize
                  </>
                )}
              </button>
            </div>
            {summary && <div className="divider"></div>}
            {summary && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <h2 className="text-2xl font-bold">✅ Summary</h2>
                    <div className="tooltip" data-tip={`${summary.length} characters`}>
                      <div className="badge badge-sm sm:badge-lg badge-ghost gap-2">
                        {countWords(summary)}{" "}
                        {pluralize(countWords(summary), "word", "words")}
                        {" "}•{" "}
                        {countSentences(summary)}{" "}
                        {pluralize(countSentences(summary), "sentence", "sentences")}
                      </div>
                    </div>
                  </div>
                  <button onClick={copyToClipboard} className="btn btn-sm sm:btn-md btn-success gap-2">
                    {copied ? (
                      <>
                        <HiCheck className="w-5 h-5" /> Copied!
                      </>
                    ) : (
                      <>
                        <HiClipboard className="w-5 h-5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="alert alert-success">
                  <p className="text-lg w-full leading-relaxed whitespace-pre-wrap">
                    {summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-10">
          <p className="text-base-content/60 font-medium">Built with React, Tailwind CSS, Daisy UI, and Google Gemini API</p>
        </div>
      </div>
    </div>
  );
}

export default App;