import { ApiProperty } from "@nestjs/swagger";
import { Badge } from "src/badges/entities/badge.entity";
import { Challenge } from "src/challenges/entities/challenge.entity";
import { City } from "src/cities/entities/city.entity";
import { Guide } from "src/guides/entities/guide.entity";
import { Level } from "src/levels/entities/level.entity";
import { UserRole } from "../enums/user-role.enum";
import { UserStatus } from "../enums/user-status.enum";

export class UserProfileDto {
  @ApiProperty({ example: 1, description: "The unique identifier of the user" })
  id: number;

  @ApiProperty({
    example: "John Doe",
    description: "The full name of the user",
  })
  name: string;

  @ApiProperty({
    example: "user@example.com",
    description: "The email of the user",
  })
  email: string;

  @ApiProperty({ example: 100, description: "Total experience points" })
  experience: number;

  @ApiProperty({ type: () => Level, description: "Current level of the user" })
  level: Level;

  @ApiProperty({ type: () => City, description: "The city of the user" })
  city: City;

  @ApiProperty({ enum: UserRole, description: "The role of the user" })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, description: "The status of the user" })
  status: UserStatus;

  @ApiProperty({ type: [Guide], description: "Guides completed by the user" })
  completedGuides: Guide[];

  @ApiProperty({ type: [Guide], description: "Guides currently in progress" })
  inProgressGuides: Guide[];

  @ApiProperty({
    type: [Level],
    description: "All levels obtained by the user based on experience",
  })
  levelsObtained: Level[];

  @ApiProperty({ type: [Badge], description: "Badges earned by the user" })
  badges: Badge[];

  @ApiProperty({
    type: [Challenge],
    description: "Challenges participated in or completed",
  })
  challenges: Challenge[];

  @ApiProperty({ example: 5, description: "Number of completed guides" })
  completedGuidesCount: number;

  @ApiProperty({ example: 2, description: "Number of badges earned" })
  badgesCount: number;
}
