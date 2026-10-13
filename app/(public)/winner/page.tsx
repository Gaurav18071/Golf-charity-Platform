import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle2, Users, Target, Award } from "lucide-react";
import { Prisma } from "@prisma/client";

// Force dynamic rendering to avoid database connection during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type FeaturedCampaignType = {
  id: string;
  title: string;
  description: string | null;
  currentAmount: Prisma.Decimal;
  goalAmount: Prisma.Decimal;
  category: string;
  organization: {
    name: string;
    description: string | null;
    type: string;
  };
  _count: {
    donations: number;
  };
} | null;

export default async function FeaturedCampaign() {
  let featuredCampaign: FeaturedCampaignType = null;
  
  try {
    // Get the campaign with the most funds raised that is currently active
    featuredCampaign = await prisma.campaign.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        currentAmount: "desc",
      },
      include: {
        organization: {
          select: {
            name: true,
            description: true,
            type: true,
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch featured campaign:", error);
    featuredCampaign = null;
  }

  if (!featuredCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-12 bg-white rounded-2xl shadow-lg max-w-2xl">
          <Award className="w-20 h-20 mx-auto mb-6 text-gray-400" />
          <h1 className="text-4xl font-bold text-gray-700 mb-4">
            Featured Campaign
          </h1>
          <p className="text-xl text-gray-500 mb-8">
            No active campaigns available at the moment. Check back soon!
          </p>
          <Link
            href="/campaigns/browse"
            className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse All Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(
    Math.round((Number(featuredCampaign.currentAmount) / Number(featuredCampaign.goalAmount)) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <Award className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-5xl font-bold text-green-700 mb-4">
            🏆 Featured Campaign
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This month&apos;s spotlight campaign is making an incredible impact. Join the cause and help us reach the goal!
          </p>
        </div>

        {/* Featured Campaign Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-3">
                  {featuredCampaign.title}
                </h2>
                <p className="text-green-100 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  by {featuredCampaign.organization.name}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                  {featuredCampaign.category}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-green-600" />
                <p className="text-sm text-gray-600 mb-1">Funds Raised</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(Number(featuredCampaign.currentAmount))}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <p className="text-sm text-gray-600 mb-1">Goal Amount</p>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrency(Number(featuredCampaign.goalAmount))}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center">
                <Users className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                <p className="text-sm text-gray-600 mb-1">Total Donors</p>
                <p className="text-3xl font-bold text-purple-700">
                  {featuredCampaign._count.donations}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold text-gray-700">
                  Campaign Progress
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${progressPercent}%` }}
                >
                  {progressPercent > 10 && (
                    <span className="text-white text-xs font-bold">
                      {progressPercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                About This Campaign
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {featuredCampaign.description || "This campaign is making a meaningful difference in our community."}
              </p>
            </div>

            {/* Organization Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                About the Organization
              </h3>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">{featuredCampaign.organization.name}</span>
                {" · "}
                <span className="text-gray-600">{featuredCampaign.organization.type}</span>
              </p>
              {featuredCampaign.organization.description && (
                <p className="text-gray-600 leading-relaxed">
                  {featuredCampaign.organization.description}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href={`/campaigns/${featuredCampaign.id}`}
                className="inline-block px-12 py-5 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Support This Campaign
              </Link>
              <p className="text-gray-500 mt-4">
                Every contribution makes a difference
              </p>
            </div>
          </div>
        </div>

        {/* Browse More */}
        <div className="text-center mt-12">
          <Link
            href="/campaigns/browse"
            className="inline-block px-8 py-4 bg-white text-green-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
          >
            Browse All Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
