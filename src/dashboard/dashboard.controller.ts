import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { DashboardMetricsDto } from "./dto/dashboard-metrics.dto";

@ApiTags("Dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: "Get dashboard analytics and metrics" })
  @ApiResponse({ status: 200, type: DashboardMetricsDto })
  async getMetrics(): Promise<DashboardMetricsDto> {
    return this.dashboardService.getMetrics();
  }
}
