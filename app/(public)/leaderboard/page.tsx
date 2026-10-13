import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// Force dynamic rendering to avoid database connection during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Leaderboard() {
  let topCampaigns: Array<{
    id: string;
    title: string;
    currentAmount: Prisma.Decimal;
    goalAmount: Prisma.Decimal;
    category: string;
    organization: { name: string };
  }> = [];
  
  try {
    topCampaigns = await prisma.campaign.findMany({
      where: {
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      select: {
        id: true,
        title: true,
        currentAmount: true,
        goalAmount: true,
        category: true,
        organization: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        currentAmount: "desc",
      },
      take: 10,
    });
  } catch (error) {
    console.error("Failed to fetch campaigns for leaderboard:", error);
    // Return empty array - page will show "no campaigns" message
    topCampaigns = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            🏆 Campaign Leaderboard
          </h1>
          <p className="text-xl text-gray-600">
            Top campaigns making the biggest impact in our community
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden max-w-6xl mx-auto">
          {topCampaigns.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No campaigns available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <tr>
                    <th className="p-4 text-left">Rank</th>
                    <th className="p-4 text-left">Campaign</th>
                    <th className="p-4 text-left">Organization</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-right">Funds Raised</th>
                    <th className="p-4 text-right">Goal</th>
                    <th className="p-4 text-center">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((campaign, index) => {
                    const currentAmt = Number(campaign.currentAmount);
                    const goalAmt = Number(campaign.goalAmount);
                    const progressPercent = Math.min(
                      Math.round((currentAmt / goalAmt) * 100),
                      100
                    );
                    const isTopThree = index < 3;

                    return (
                      <tr
                        key={campaign.id}
                        className={`border-b hover:bg-green-50 transition-colors ${
                          isTopThree ? "bg-yellow-50" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            <span className="font-bold text-lg text-gray-700">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="font-semibold text-green-700 hover:text-green-900 hover:underline"
                          >
                            {campaign.title}
                          </Link>
                        </td>
                        <td className="p-4 text-gray-700">
                          {campaign.organization.name}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {campaign.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-green-600">
                          {formatCurrency(currentAmt)}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          {formatCurrency(goalAmt)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-gray-700 mb-1">
                              {progressPercent}%
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600 transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/campaigns/browse"
            className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Browse All Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}