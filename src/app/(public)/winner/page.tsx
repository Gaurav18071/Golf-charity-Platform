"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Score = {
  id: string;
  score: number;
  date: string;
};

export default function Winner() {

  const [winner, setWinner] = useState<Score | null>(null);

  const fetchWinner = async (): Promise<Score | null> => {

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("score", { ascending: false });

    if (!error && data) {

      const filtered = data.filter((s: { date: string }) => {

        const d = new Date(s.date);

        return (
          d.getMonth() + 1 === currentMonth &&
          d.getFullYear() === currentYear
        );

      });

      if (filtered.length > 0) {
        return filtered[0];
      }

    }

    return null;

  };

  useEffect(() => {
    let isMounted = true;

    void fetchWinner().then((monthlyWinner) => {
      if (isMounted) {
        setWinner(monthlyWinner);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Monthly Champion
      </h1>

      {winner ? (

        <div>

          <p>
            🏆 Highest Score: {winner.score}
          </p>

          <p>
            Date Played: {new Date(winner.date).toLocaleDateString()}
          </p>

        </div>

      ) : (

        <p>No scores submitted this month.</p>

      )}

    </div>

  );

}