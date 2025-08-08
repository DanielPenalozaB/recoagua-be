import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RegionsModule } from './regions/regions.module';
import { CitiesModule } from './cities/cities.module';
import { GuidesModule } from './guides/guides.module';
import { ModulesModule } from './modules/modules.module';
import { BlocksModule } from './blocks/blocks.module';
import { ChallengesModule } from './challenges/challenges.module';
import { LevelsModule } from './levels/levels.module';
import { BadgesModule } from './badges/badges.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { UserChallengesModule } from './user-challenges/user-challenges.module';
import { UserBlockResponseModule } from './user-block-response/user-block-response.module';
import { UserAnswerDetailsModule } from './user-answer-details/user-answer-details.module';
import { UserActionsModule } from './user-actions/user-actions.module';
import { AuthModule } from './auth/auth.module';
import { ZoneModule } from './zone/zone.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './configs/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    RegionsModule,
    CitiesModule,
    GuidesModule,
    ModulesModule,
    BlocksModule,
    ChallengesModule,
    LevelsModule,
    BadgesModule,
    UserProgressModule,
    UserChallengesModule,
    UserBlockResponseModule,
    UserAnswerDetailsModule,
    UserActionsModule,
    AuthModule,
    ZoneModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
