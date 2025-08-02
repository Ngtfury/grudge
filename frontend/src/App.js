import { useState, useEffect } from "react"
import axios from "axios"
import Lottie from "lottie-react"
import avatarAnim from "./public/avatar.json"
import loadingAnim from "./public/loading.json"
// Mock Lottie component since we don't have the actual animation files
const MockLottie = ({ animationData, loop, autoplay, style }) => (
  <div style={{ 
    ...style,
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f0f0f0', 
    borderRadius: '10px',
    fontSize: '48px'
  }}>
  </div>
)

function App() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultText, setResultText] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFavorForm, setShowFavorForm] = useState(false)
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [target, setTarget] = useState("")
  const [grudge, setGrudge] = useState("")
  const [favorTarget, setFavorTarget] = useState("")
  const [favorRequest, setFavorRequest] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isCoinFlipping, setIsCoinFlipping] = useState(false)
  const [coinResult, setCoinResult] = useState("")
  const [showCoinToss, setShowCoinToss] = useState(false)
  const [peopleList, setPeopleList] = useState([])
  const [selectedPerson, setSelectedPerson] = useState("")
  const [showForgiveDropdown, setShowForgiveDropdown] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])

  const handleAddGrudge = async () => {
    if (!target.trim() || !grudge.trim()) {
      setResultText("❌ Please fill in both target and grudge fields.")
      setShowAddForm(false)
      setIsLoading(false)
      setShowCloseButton(true)
      return
    }

    setShowAddForm(false)
    setIsLoading(true)
    setResultText("")
    setShowCloseButton(false)

    try {
      // Simulate API call
      const response = await axios.post("http://127.0.0.1:8000/api/add-grudge", {
        target: target.trim(),
        grudge: grudge.trim(),
      })
      setResultText(`✅ Grudge added! Your pettiness against ${target} has been recorded.`)
      
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

  const handleRequestFavor = async () => {
    if (!favorTarget.trim() || !favorRequest.trim()) {
      setResultText("❌ Please fill in both target and favor request fields.")
      setShowFavorForm(false)
      setIsLoading(false)
      setShowCloseButton(true)
      return
    }

    setShowFavorForm(false)
    setIsLoading(true)
    setResultText("")
    setShowCloseButton(false)
    setIsTyping(false)
    setTypedText("")
    setShowLeaderboard(false) // <-- Ensure leaderboard is hidden

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/add-favour", {
        target: favorTarget.trim(),
        favour: favorRequest.trim(),
      })
      // Support both {reply: "..."} and plain string
      const favorTextToType = (response.data.reply || response.data).trim()
      setIsLoading(false)
      setIsTyping(true)

      for (let i = 0; i <= favorTextToType.length; i++) {
        await new Promise((res) => setTimeout(res, 50))
        setTypedText(favorTextToType.substring(0, i))
      }

      setTimeout(() => {
        setShowCloseButton(true)
      }, 500)

      setFavorTarget("")
      setFavorRequest("")
    } catch (error) {
      console.error("Error requesting favor:", error)
      setResultText("❌ Failed to send favor request. Check your backend connection.")
      setIsLoading(false)
      setShowCloseButton(true)
    }
  }

  const handleCoinToss = async () => {
    setIsCoinFlipping(true)

    let score = null
    if (selectedPerson) {
      try {
        // Use the correct endpoint format
        const response = await axios.get(`http://127.0.0.1:8000/api/get-score/${encodeURIComponent(selectedPerson)}`)
        score = parseFloat(response.data.score)
      } catch (error) {
        console.error("Error fetching score:", error)
        score = null
      }
    }

    // Flip for 2.5 seconds (duration of toss animation + a bit extra)
    await new Promise((res) => setTimeout(res, 2500))

    setIsCoinFlipping(false)

    let result
    if (score !== null && score > 80) {
      result = "NO"
      setResultText(`😤 After all they've done? "${selectedPerson}" has a score of ${score}. They are your biggest enemy!`)
    } else {
      result = Math.random() < 0.5 ? "YES" : "NO"
      setResultText(
        result === "YES"
          ? "🕊️ The coin says YES! Forgiveness granted... for now."
          : "😤 The coin says NO! The grudge continues!"
      )
    }
    setCoinResult(result)
    setShowCloseButton(true)
  }

  const handleCloseResult = () => {
    setIsFlipped(false)
    setShowCloseButton(false)
    setResultText("")
    setShowAddForm(false)
    setShowFavorForm(false)
    setIsTyping(false)
    setTypedText("")
    setIsCoinFlipping(false)
    setCoinResult("")
    setShowCoinToss(false)
  }

  const handleForgiveClick = async () => {
    setIsFlipped(true)
    setShowCoinToss(false)
    setShowForgiveDropdown(true)
    setIsLoading(true)
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/get-people")
      setPeopleList(response.data)
    } catch (error) {
      setResultText("❌ Failed to fetch people list.")
      setShowForgiveDropdown(false)
      setShowCloseButton(true)
    }
    setIsLoading(false)
  }

  const handleForgiveSelect = () => {
    setShowForgiveDropdown(false)
    setShowCoinToss(true)
  }

  const handleLeaderboardClick = async () => {
    setIsFlipped(true)
    setIsLoading(true)
    setShowLeaderboard(true)
    setShowAddForm(false)
    setShowFavorForm(false)
    setShowForgiveDropdown(false)
    setShowCoinToss(false)
    setResultText("")
    setShowCloseButton(false)
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/leaderboard")
      setLeaderboard(response.data)
    } catch (error) {
      setResultText("❌ Failed to fetch leaderboard.")
      setShowLeaderboard(false)
      setShowCloseButton(true)
    }
    setIsLoading(false)
    setShowCloseButton(true)
  }

  const handleButtonClick = async (action) => {
    if (action === "add") {
      setShowAddForm(true)
      setIsFlipped(true)
      return // <-- Make sure to return here!
    } else if (action === "favor") {
      setShowFavorForm(true)
      setIsFlipped(true)
      return // <-- Make sure to return here!
    } else if (action === "forgive") {
      await handleForgiveClick()
      return // <-- Make sure to return here!
    } else if (action === "leaderboard") {
      await handleLeaderboardClick()
      return // <-- Make sure to return here!
    }

    setIsFlipped(true)
    setIsLoading(true)
    setResultText("")
    setShowCloseButton(false)
    setShowAddForm(false)
    setShowFavorForm(false)
    setIsTyping(false)
    setTypedText("")
    setIsCoinFlipping(false)
    setCoinResult("")
    setShowCoinToss(false)

    try {
      // Simulate API calls for other actions
      await new Promise((res) => setTimeout(res, 2000))

      switch (action) {
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

  return (
    <div style={styles.app}>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          @keyframes coinToss {
            0% { 
              transform: translateY(0px) rotateY(0deg);
            }
            25% { 
              transform: translateY(-80px) rotateY(450deg);
            }
            50% { 
              transform: translateY(-120px) rotateY(900deg);
            }
            75% { 
              transform: translateY(-80px) rotateY(1350deg);
            }
            100% { 
              transform: translateY(0px) rotateY(1800deg);
            }
          }
          #coinNo {
            transform: rotateY(180deg);
          }
        `}
      </style>
      <div style={styles.cardContainer}>
        <div style={{
          ...styles.card,
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front View: Buttons */}
          <div style={{
            ...styles.cardFace,
            ...styles.cardFront,
            opacity: isFlipped ? 0 : 1,
            visibility: isFlipped ? 'hidden' : 'visible',
          }}>
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
              <button style={styles.button} onClick={() => handleButtonClick("leaderboard")}>
                Leaderboard
              </button>
            </div>
          </div>

          {/* Back View: Add Form, Favor Form, Coin Toss, Leaderboard, Loading, or Result */}
          <div style={{
            ...styles.cardFace,
            ...styles.cardBack,
            opacity: isFlipped ? 1 : 0,
            visibility: isFlipped ? 'visible' : 'hidden',
          }}>
            {showAddForm ? (
              // Add Form View
              <div style={styles.formContent}>
                <div style={styles.avatarSmall}>
                  <MockLottie animationData="avatar" loop autoplay />
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
                    rows={3}
                  />
                </div>

                <div style={styles.formButtons}>
                  <button style={styles.cancelButton} onClick={handleCloseResult}>
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
            ) : showFavorForm ? (
              // Favor Form View
              <div style={styles.formContent}>
                <div style={styles.avatarSmall}>
                  <MockLottie animationData="avatar" loop autoplay />
                </div>

                <h2 style={styles.formTitle}>Favor</h2>
                <p style={styles.formSubtitle}>Ask nicely... while still being petty</p>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Person:</label>
                  <input
                    type="text"
                    value={favorTarget}
                    onChange={(e) => setFavorTarget(e.target.value)}
                    placeholder="Who do you need a favor ?"
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>The Favor:</label>
                  <textarea
                    value={favorRequest}
                    onChange={(e) => setFavorRequest(e.target.value)}
                    placeholder="What do they need from you? (Remember, you still hold grudges...)"
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                <div style={styles.formButtons}>
                  <button style={styles.cancelButton} onClick={handleCloseResult}>
                    Cancel
                  </button>
                  <button
                    style={{
                      ...styles.submitButton,
                      opacity: !favorTarget.trim() || !favorRequest.trim() ? 0.5 : 1,
                      cursor: !favorTarget.trim() || !favorRequest.trim() ? "not-allowed" : "pointer",
                    }}
                    onClick={handleRequestFavor}
                    disabled={!favorTarget.trim() || !favorRequest.trim()}
                  >
                    Process
                  </button>
                </div>
              </div>
            ) : showForgiveDropdown ? (
              // Forgive Dropdown View
              <div style={styles.formContent}>
                <div style={styles.avatarSmall}>
                  <MockLottie animationData="avatar" loop autoplay />
                </div>
                <h2 style={styles.formTitle}>Choose Person to Forgive</h2>
                <select
                  style={styles.input}
                  value={selectedPerson}
                  onChange={e => setSelectedPerson(e.target.value)}
                >
                  <option value="">Select a person</option>
                  {peopleList.map((person, idx) => (
                    <option key={idx} value={person}>{person}</option>
                  ))}
                </select>
                <div style={styles.formButtons}>
                  <button
                    style={{
                      ...styles.submitButton,
                      opacity: !selectedPerson ? 0.5 : 1,
                      cursor: !selectedPerson ? "not-allowed" : "pointer",
                    }}
                    onClick={handleForgiveSelect}
                    disabled={!selectedPerson}
                  >
                    Toss Coin
                  </button>
                  <button style={styles.cancelButton} onClick={handleCloseResult}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : showCoinToss ? (
              // Coin Toss View
              <div style={styles.formContent}>
                <div style={styles.avatarSmall}>
                  <MockLottie animationData="avatar" loop autoplay />
                </div>

                <h2 style={styles.formTitle}>Forgiveness Decision</h2>
                <p style={styles.formSubtitle}>Let the coin decide your fate...</p>

                {!isCoinFlipping && !coinResult ? (
                  <div style={styles.coinInteractive}>
                    <div style={styles.coinStatic} onClick={handleCoinToss}>
                      <div style={styles.coinStaticSide}>TOSS</div>
                    </div>
                    <p style={styles.coinInstructions}>Click the coin to toss it!</p>
                    <div style={styles.formButtons}>
                      <button style={styles.cancelButton} onClick={handleCloseResult}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isCoinFlipping ? (
                  <div style={styles.coinContainer}>
                    <div style={styles.coinToss}>
                      <div style={styles.coinFace} id="coinYes">YES</div>
                      <div style={styles.coinFace} id="coinNo">NO</div>
                    </div>
                    <p style={styles.coinText}>The coin is deciding your fate...</p>
                  </div>
                ) : coinResult ? (
                  <div style={styles.coinResultContainer}>
                    <div style={styles.coinStatic}>
                      {coinResult}
                    </div>
                    <p style={styles.result}>{resultText}</p>
                    {showCloseButton && (
                      <button style={styles.closeButton} onClick={handleCloseResult}>
                        Close
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            ) : showLeaderboard ? (
              // Leaderboard View
              <div style={styles.leaderboardContent}>
                <div style={styles.avatarSmall}>
                  <MockLottie animationData="avatar" loop autoplay />
                </div>
                <h2 style={styles.formTitle}>Leaderboard of Pettiness</h2>
                <p style={styles.formSubtitle}>Your biggest enemies, ranked by score</p>
                <div style={styles.leaderboardList}>
                  {leaderboard.length === 0 ? (
                    <p style={styles.loadingText}>No grudges found.</p>
                  ) : (
                    leaderboard.map((entry, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.leaderboardItem,
                          ...(idx === 0 ? styles.biggestEnemy : {}),
                        }}
                      >
                        <span style={styles.leaderboardRank}>{idx + 1}.</span>
                        <span style={styles.leaderboardName}>{entry.person}</span>
                        <span style={{marginLeft: 8, color: "#b8860b", fontWeight: "bold"}}>
                          {entry.score}
                        </span>
                        {idx === 0 && (
                          <span style={styles.enemyBadge}>👑 Your Biggest Enemy</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {showCloseButton && (
                  <button style={styles.closeButton} onClick={handleCloseResult}>
                    Close
                  </button>
                )}
              </div>
            ) : (
              // Loading/Result View
              <div style={styles.resultContent}>
                <div style={styles.avatar}>
                  <MockLottie animationData="avatar" loop autoplay />
                </div>

                {isLoading ? (
                  <>
                    <div style={styles.loadingContainer}>
                      <MockLottie animationData="loading" loop autoplay style={{ height: 80 }} />
                    </div>
                    <p style={styles.loadingText}>Processing your pettiness...</p>
                  </>
                ) : isTyping ? (
                  <div style={styles.typingContainer}>
                    <p style={styles.typingText}>
                      {typedText}
                      <span style={styles.cursor}>|</span>
                    </p>
                    {showCloseButton && (
                      <button style={styles.closeButton} onClick={handleCloseResult}>
                        Close
                      </button>
                    )}
                  </div>
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
            )}
          </div>
        </div>
      </div>
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
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  cardContainer: {
    perspective: "1000px",
    width: "400px",
    height: "500px",
  },
  card: {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    background: "linear-gradient(135deg, #fffacd 0%, #fff8dc 100%)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
  },
  cardFront: {
    transform: "rotateY(0deg)",
    justifyContent: "flex-start",
    textAlign: "center",
  },
  cardBack: {
    transform: "rotateY(180deg)",
  },
  avatar: {
    height: "200px",
    width: "100%",
    marginBottom: "20px",
  },
  avatarSmall: {
    height: "80px",
    width: "100%",
    marginBottom: "15px",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "auto",
  },
  button: {
    padding: "15px 0",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    textAlign: "center",
  },
  resultContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    textAlign: "center",
    justifyContent: "flex-start",
  },
  formTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px",
    margin: "0 0 5px 0",
  },
  formSubtitle: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.3s",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
    minHeight: "60px",
  },
  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  submitButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loadingContainer: {
    height: "80px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#999",
    fontSize: "14px",
    fontStyle: "italic",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: "20px",
  },
  result: {
    fontSize: "16px",
    color: "#333",
    padding: "0 10px",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  closeButton: {
    padding: "12px 25px",
    backgroundColor: "#ffd700",
    color: "#333",
    border: "none",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  typingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "20px",
  },
  typingText: {
    fontSize: "18px",
    color: "#333",
    lineHeight: "1.6",
    textAlign: "center",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
  },
  cursor: {
    animation: "blink 1s infinite",
    marginLeft: "2px",
  },
  coinContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "20px",
    perspective: "1000px",
  },
  coinToss: {
    width: "120px",
    height: "120px",
    position: "relative",
    transformStyle: "preserve-3d",
    animation: "coinToss 2s ease-in-out",
    marginBottom: "40px",
  },
  coinFace: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#ffd700",
    border: "4px solid #b8860b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
    backfaceVisibility: "hidden",
  },
  coinText: {
    fontSize: "16px",
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  coinResultContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    padding: "20px",
  },
  coinStatic: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "#ffd700",
    border: "4px solid #b8860b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    marginBottom: "20px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  coinInteractive: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginBottom: "20px",
  },
  coinStaticSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  coinInstructions: {
    fontSize: "14px",
    color: "#666",
    marginTop: "15px",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  leaderboardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    padding: "10px 0",
    textAlign: "center",
  },
  leaderboardList: {
    flex: 1,
    width: "100%",
    maxHeight: "250px",
    overflowY: "auto",
    margin: "10px 0 20px 0",
    padding: "0 10px",
    borderRadius: "10px",
    background: "#fffbe6",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "12px 8px",
    borderBottom: "1px solid #ffe066",
    fontSize: "16px",
    color: "#333",
    fontWeight: "500",
    position: "relative",
  },
  biggestEnemy: {
    background: "linear-gradient(90deg, #ffd700 60%, #fffbe6 100%)",
    fontWeight: "bold",
    fontSize: "18px",
    color: "#b22222",
    boxShadow: "0 2px 12px rgba(255,215,0,0.15)",
  },
  leaderboardRank: {
    marginRight: "12px",
    fontWeight: "bold",
    color: "#b8860b",
    fontSize: "18px",
  },
  leaderboardName: {
    flex: 1,
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  },
  enemyBadge: {
    marginLeft: "10px",
    background: "#ff4d4f",
    color: "#fff",
    borderRadius: "8px",
    padding: "2px 10px",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(255,77,79,0.12)",
    letterSpacing: "0.5px",
    display: "inline-block",
  },
}

export default App