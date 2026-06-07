import { MissionsRepository } from "./missions.repo.js";
import type { Mission, MissionDto } from "./missions.types.js";

export class MissionsService {
  constructor(private readonly missionsRepository: MissionsRepository) {}

  async listActiveMissions(): Promise<MissionDto[]> {
    const missions = await this.missionsRepository.findActive();
    return missions.map((mission) => this.toDto(mission));
  }

  private toDto(mission: Mission): MissionDto {
    return {
      id: mission.id,
      slug: mission.slug,
      title: mission.title,
      category: mission.category,
      description: mission.description,
      points: mission.points,
      verificationPromptHint: mission.verificationPromptHint,
    };
  }
}
