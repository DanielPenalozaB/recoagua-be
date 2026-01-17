import { ApiProperty } from "@nestjs/swagger";

export class PopularGuideDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Water Conservation" })
  name: string;

  @ApiProperty({ example: 1240 })
  userCount: number;

  @ApiProperty({ example: 85, description: "Percentage completed" })
  completionPercentage: number;
}

export class RegionDistributionDto {
  @ApiProperty({ example: "Bogotá" })
  region: string;

  @ApiProperty({ example: 150 })
  count: number;
}

export class ChallengeProgressDto {
  @ApiProperty({ example: 65 })
  completed: number;

  @ApiProperty({ example: 25 })
  inProgress: number;

  @ApiProperty({ example: 10 })
  notStarted: number;
}

export class TrendMetricDto {
  @ApiProperty({ example: "2024-01-01" })
  date: string;

  @ApiProperty({ example: 15 })
  count: number;
}

export class EducationalImpactDto {
  @ApiProperty({
    example: 75.5,
    description: "Global percentage of correct answers",
  })
  globalAccuracy: number;

  @ApiProperty({ example: 500, description: "Total questions attempted" })
  totalQuestionsAnswered: number;
}

export class DashboardMetricsDto {
  @ApiProperty({ example: 2548 })
  totalUsers: number;

  @ApiProperty({ example: 1237 })
  completedGuides: number;

  @ApiProperty({ example: 48 })
  activeChallenges: number;

  @ApiProperty({
    example: 78,
    description: "Percentage of users participating",
  })
  participationPercentage: number;

  @ApiProperty({ type: [PopularGuideDto] })
  popularGuides: PopularGuideDto[];

  @ApiProperty({ type: [RegionDistributionDto] })
  usersByRegion: RegionDistributionDto[];

  @ApiProperty({ type: ChallengeProgressDto })
  challengeProgress: ChallengeProgressDto;

  @ApiProperty({ example: 1500 })
  badgesGranted: number;

  @ApiProperty({
    type: [TrendMetricDto],
    description: "Daily user registrations (last 30 days)",
  })
  userAcquisition: TrendMetricDto[];

  @ApiProperty({
    type: [TrendMetricDto],
    description: "Daily user actions (last 30 days)",
  })
  userEngagement: TrendMetricDto[];

  @ApiProperty({ type: EducationalImpactDto })
  educationalImpact: EducationalImpactDto;
}
