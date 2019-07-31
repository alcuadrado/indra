import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppRegistryModule } from "../appRegistry/appRegistry.module";
import { AppRegistryRepository } from "../appRegistry/appRegistry.repository";
import { ConfigModule } from "../config/config.module";
import { MessagingModule } from "../messaging/messaging.module";
import { NodeModule } from "../node/node.module";
import { PaymentProfileRepository } from "../paymentProfile/paymentProfile.repository";
import { UserModule } from "../user/user.module";
import { UserRepository } from "../user/user.repository";

import { channelProviderFactory } from "./channel.provider";
import { ChannelRepository } from "./channel.repository";
import { ChannelService } from "./channel.service";

@Module({
  controllers: [],
  exports: [ChannelService],
  imports: [
    ConfigModule,
    MessagingModule,
    NodeModule,
    TypeOrmModule.forFeature([
      ChannelRepository,
      UserRepository,
      PaymentProfileRepository,
      AppRegistryRepository,
    ]),
    UserModule,
    AppRegistryModule,
  ],
  providers: [ChannelService, channelProviderFactory],
})
export class ChannelModule {}
