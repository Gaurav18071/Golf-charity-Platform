"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

type Score = {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
};

export default function Admin() {

  const router = useRouter();

  const ADMIN_EMAIL = "its.gaurav.2705@gmail.com";

  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async () => {

    const { data } = await supabase.auth.getUser();

    const email = data.user?.email;

    if (!email) {
      router.push("/login");
      return;
    }

    if (email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }

    setLoading(false);
  }, [router, ADMIN_EMAIL]);

  const fetchScores = useCallback(async () => {

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setScores(data || []);
  }, []);

  const deleteScore = async (id: string) => {

    const confirmDelete = confirm("Delete this score?");

    if (!confirmDelete) return;

    await supabase
      .from("scores")
      .delete()
      .eq("id", id);

    fetchScores();
  };

  useEffect(() => {

    const init = async () => {
      await checkAdmin();
      await fetchScores();
    };

    init();

  }, [checkAdmin, fetchScores]);

  if (loading) {
    return <div className="p-10 text-xl">Checking Admin Access...</div>;
  }

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Admin Panel
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-200">
          <tr>
            <th className="border p-3">User ID</th>
            <th className="border p-3">Score</th>
            <th className="border p-3">Game Date</th>
            <th className="border p-3">Uploaded</th>
            <th className="border p-3">Action</th>
          </tr>
        </thead>

        <tbody>

          {scores.map((s) => (

            <tr key={s.id}>

              <td className="border p-3">
                {s.user_id.slice(0,8)}...
              </td>

              <td className="border p-3">
                {s.score}
              </td>

              <td className="border p-3">
                {new Date(s.date).toLocaleDateString()}
              </td>

              <td className="border p-3">
                {new Date(s.created_at).toLocaleString()}
              </td>

              <td className="border p-3">

                <button
                  onClick={() => deleteScore(s.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}