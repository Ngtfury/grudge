"use client"

import { useState } from "react"
import ReactCardFlip from "react-card-flip"
import Lottie from "lottie-react"
import avatarAnim from "./public/avatar.json"
import loadingAnim from "./public/loading.json"
import axios from "axios"

function App() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultText, setResultText] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [target, setTarget] = useState("")
  const [grudge, setGrudge] = useState("")

  const handleAddGrudge = async () => {
    if (!target.trim() || !grudge.trim()) {
      setResultText("❌ Please fill in both target and grudge fields.")
      setShowAddForm(false)
      setIsFlipped(true)
      setIsLoading(false)
      setShowCloseButton(true)
      return
    }

    setShowAddForm(false)
    setIsFlipped(true)
    setIsLoading(true)
    setResultText("")
    setShowCloseButton(false)

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/add-grudge", {
        target: target.trim(),
        grudge: grudge.trim(),
      })

      setResultText(`✅ Grudge added! ${response.data.reply || "Your pettiness has been recorded."}`)

      // Clear form
      setTarget("")
      setGrudge("")
    } catch (error) {
      console.error("Error adding grudge:", error)
      setResultText("❌ Failed to add grudge. Check your backend connection.")
    }

    setIsLoading(false)
    setShowCloseButton(true)
  }

  const handleCloseResult = () => {
    setIsFlipped(false)
    setShowCloseButton(false)
    setResultText("")
  }

  const handleButtonClick = async (action) => {
    if (action === "add") {
      setShowAddForm(true)
      return
    }

    setIsFlipped(true)
    setIsLoading(true)
    setResultText("")
    setShowCloseButton(false)

    try {
      // Simulate API calls for other actions
      await new Promise((res) => setTimeout(res, 2000))

      switch (action) {
        case "favor":
          setResultText("😤 Favor Denied. Still salty.")
          break
        case "forgive":
          setResultText("🕊️ Forgiveness granted... for now.")
          break
        case "random":
          setResultText("🎲 Random pettiness activated!")
          break
        default:
          setResultText("🤔 Unknown action.")
      }
    } catch (error) {
      setResultText("❌ Something went wrong.")
    }

    setIsLoading(false)
    setShowCloseButton(true)
  }

  // Add form view
  if (showAddForm) {
    return (
      <div style={styles.app}>
        <div style={styles.formCard}>
          <div style={styles.avatar}>
            <Lottie animationData={avatarAnim} loop autoplay />
          </div>

          <h2 style={styles.formTitle}>Add New Grudge</h2>
          <p style={styles.formSubtitle}>Time to document some pettiness</p>

          <div style={styles.formGroup}>
            <label style={styles.label}>Target Person:</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Who wronged you?"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>The Grudge:</label>
            <textarea
              value={grudge}
              onChange={(e) => setGrudge(e.target.value)}
              placeholder="What did they do to deserve your eternal resentment?"
              style={styles.textarea}
              rows={4}
            />
          </div>

          <div style={styles.formButtons}>
            <button style={styles.cancelButton} onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button
              style={{
                ...styles.submitButton,
                opacity: !target.trim() || !grudge.trim() ? 0.5 : 1,
                cursor: !target.trim() || !grudge.trim() ? "not-allowed" : "pointer",
              }}
              onClick={handleAddGrudge}
              disabled={!target.trim() || !grudge.trim()}
            >
              Add Grudge
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.app}>
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Front View: Buttons */}
        <div style={styles.card}>
          <div style={styles.avatar}>
            <Lottie animationData={avatarAnim} loop autoplay />
          </div>
          <div style={styles.buttonGrid}>
            <button style={styles.button} onClick={() => handleButtonClick("add")}>
              Add
            </button>
            <button style={styles.button} onClick={() => handleButtonClick("favor")}>
              Favor
            </button>
            <button style={styles.button} onClick={() => handleButtonClick("forgive")}>
              Forgive
            </button>
            <button style={styles.button} onClick={() => handleButtonClick("random")}>
              ?
            </button>
          </div>
        </div>

        {/* Back View: Loading or Result */}
        <div style={styles.card}>
          <div style={styles.avatar}>
            <Lottie animationData={avatarAnim} loop autoplay />
          </div>

          {isLoading ? (
            <>
              <div style={{ height: 120, marginBottom: 10 }}>
                <Lottie animationData={loadingAnim} loop autoplay />
              </div>
              <p style={{ color: "#999" }}>Processing your pettiness...</p>
            </>
          ) : (
            <div style={styles.resultContainer}>
              <p style={styles.result}>{resultText}</p>
              {showCloseButton && (
                <button style={styles.closeButton} onClick={handleCloseResult}>
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      </ReactCardFlip>
    </div>
  )
}

const styles = {
  app: {
    backgroundColor: "#fff8dc",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 320,
    minHeight: 400,
    background: "#fffacd",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  formCard: {
    width: 400,
    minHeight: 500,
    background: "#fffacd",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
  },
  avatar: {
    height: 300,
    width: "100%",
    marginBottom: 20,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 10,
  },
  button: {
    padding: "10px 0",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  result: {
    fontSize: "18px",
    color: "#333",
    marginTop: 30,
    padding: "0 10px",
    marginBottom: 20,
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    marginTop: 10,
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #ddd",
    borderRadius: 8,
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.3s",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #ddd",
    borderRadius: 8,
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
  },
  formButtons: {
    display: "flex",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  submitButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
}

export default App
