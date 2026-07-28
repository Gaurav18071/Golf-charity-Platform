"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type ScoreRecord = {
  id: string;
  score: number;
  date: string;
  created_at: string;
};

export default function Dashboard() {

  const [score, setScore] = useState("");
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  // Fetch latest 5 scores
  const fetchScores = async () => {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error) {
      setScores((data as ScoreRecord[]) || []);
    }
  };

  // Add new score
  const handleAddScore = async () => {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    const { error } = await supabase
      .from("scores")
      .insert([
        {
          user_id: user.id,
          score: Number(score),
          date: new Date().toISOString()
        }
      ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Score added successfully!");
      setScore("");
      fetchScores();
    }
  };

  // Load scores on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchScores();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        User Dashboard
      </h1>

      {/* Score Input */}

      <div className="mb-8">

        <input
          type="number"
          placeholder="Enter golf score"
          className="border p-2 mr-4"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <button
          onClick={handleAddScore}
          className="bg-green-700 text-white px-5 py-2 rounded"
        >
          Add Score
        </button>

      </div>


      {/* Score List */}

      <h2 className="text-xl font-semibold mb-4">
        Last 5 Scores
      </h2>

      {scores.length === 0 ? (
        <p>No scores yet.</p>
      ) : (

        <ul className="space-y-2">

          {scores.map((s) => (

            <li
              key={s.id}
              className="border p-3 rounded bg-gray-50"
            >
              <strong>Score:</strong> {s.score} <br />

              <strong>Game Date:</strong>{" "}
              {new Date(s.date).toLocaleDateString()} <br />

              <strong>Uploaded:</strong>{" "}
              {new Date(s.created_at).toLocaleString()}

            </li>

          ))}

        </ul>

      )}

    </div>
  );
}