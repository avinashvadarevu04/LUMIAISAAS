import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { PrdsModule } from './prds/prds.module';
import { SowsModule } from './sows/sows.module';
import { MilestonesModule } from './milestones/milestones.module';
import { MilestonesSubmissionsModule } from './milestones-submissions/milestones-submissions.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, PrdsModule, SowsModule, MilestonesModule, MilestonesSubmissionsModule, ClientsModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}