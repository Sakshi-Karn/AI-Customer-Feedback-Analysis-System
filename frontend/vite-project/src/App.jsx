import { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { jwtDecode } from "jwt-decode";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function App() {
  const [data, setData] = useState(null);

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // UI
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");

  // Feedback
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feedback");
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const decoded = jwtDecode(res.data.token);
      setUserId(decoded.id);
      setIsLoggedIn(true);
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setIsLoggedIn(false);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    if (!userId) {
      alert("Please login first");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/feedback", {
        userId,
        message,
      });

      setMessage("");
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  // Chart Data
  const analyticsData = data
    ? {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [
          {
            label: "Sentiment",
            data: [
              data?.positive || 0,
              data?.negative || 0,
              data?.neutral || 0,
            ],
            backgroundColor: ["#22c55e", "#ef4444", "#facc15"],
          },
        ],
      }
    : null;

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* LOGIN */}
      {!isLoggedIn ? (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-black">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-80 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Welcome Back
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded dark:bg-gray-700 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={handleLogin}
              className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        /* DASHBOARD */
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center p-6">
          <div className="w-full max-w-4xl">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Customer Feedback Dashboard
              </h1>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
                >
                  🌙
                </button>

                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {email.charAt(0).toUpperCase()}
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab("feedback")}
                className={`px-4 py-2 rounded ${
                  activeTab === "feedback"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                Feedback
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 rounded ${
                  activeTab === "analytics"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                Analytics
              </button>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">

              {/* FEEDBACK TAB */}
              {data && activeTab === "feedback" && (
                <>
                  <div className="flex gap-2 mb-4">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter feedback..."
                      className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleSubmit}
                      className="bg-indigo-500 text-white px-4 rounded"
                    >
                      Submit
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-3">
                    {data.feedbacks
                      ?.slice(-5)
                      .reverse()
                      .map((item) => (
                        <div
                          key={item._id}
                          className="p-3 rounded border-l-4 bg-gray-50 dark:bg-gray-700"
                          style={{
                            borderColor:
                              item.sentiment === "positive"
                                ? "green"
                                : item.sentiment === "negative"
                                ? "red"
                                : "orange",
                          }}
                        >
                          <p>{item.message}</p>
                          <p className="text-sm">{item.sentiment}</p>

                          {item.sentiment === "negative" && (
                            <p className="text-red-500 text-xs">
                              ⚠ Critical Feedback
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}

              {/* ANALYTICS TAB */}
              {data && activeTab === "analytics" && (
                <div className="grid md:grid-cols-2 gap-6">

                  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      Sentiment Distribution
                    </h3>
                    <Doughnut data={analyticsData} />
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-3 text-center">
                      Sentiment Comparison
                    </h3>
                    <Bar data={analyticsData} />
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;