import { supabase } from "../../lib/supabase";

type Score = {
  id: string;
  score: number;
  date: string;
  created_at: string;
};

export default async function Leaderboard() {

  const { data, error } = await supabase
    .from("scores")
    .select("id,score,date,created_at")
    .order("score", { ascending: false })
    .limit(10);

  const scores: Score[] = !error ? (data || []) : [];

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold text-green-700 mb-8">
        🏆 Leaderboard
      </h1>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-green-600 text-white">

            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">Score</th>
              <th className="p-4">Game Date</th>
              <th className="p-4">Uploaded</th>
            </tr>

          </thead>

          <tbody>

            {scores.map((s, index) => (

              <tr
                key={s.id}
                className="text-center border-b hover:bg-green-50"
              >

                <td className="p-4 font-bold">
                  {index + 1}
                </td>

                <td className="p-4">
                  {s.score}
                </td>

                <td className="p-4">
                  {new Date(s.date).toLocaleDateString()}
                </td>

                <td className="p-4">
                  {new Date(s.created_at).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}