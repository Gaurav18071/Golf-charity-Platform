"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Score = {
  id: string;
  score: number;
  date: string;
  created_at: string;
};

export default function Profile() {

  const [scores, setScores] = useState<Score[]>([]);
  const [email, setEmail] = useState("");

  const fetchData = async () => {

    const { data: userData } = await supabase.auth.getUser();

    const user = userData.user;

    if (!user) return;

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setScores(data || []);
    }

  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const bestScore =
    scores.length > 0
      ? Math.max(...scores.map((s) => s.score))
      : 0;

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((a, b) => a + b.score, 0) / scores.length
        )
      : 0;

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Profile
      </h1>

      <p>Email: {email}</p>

      <p>Total Games: {scores.length}</p>

      <p>Best Score: {bestScore}</p>

      <p>Average Score: {averageScore}</p>

      <h2 className="text-xl mt-6 mb-4">
        Your Scores
      </h2>

      <table className="w-full border">

        <thead>
          <tr>
            <th className="border p-3">Score</th>
            <th className="border p-3">Game Date</th>
            <th className="border p-3">Uploaded</th>
          </tr>
        </thead>

        <tbody>

          {scores.map((s) => (

            <tr key={s.id}>

              <td className="border p-3">{s.score}</td>

              <td className="border p-3">
                {new Date(s.date).toLocaleDateString()}
              </td>

              <td className="border p-3">
                {new Date(s.created_at).toLocaleString()}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}