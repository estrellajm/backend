import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScoresModule } from './app/main/scores/scores.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { environment } from './environment';
import { UserModule } from './app/main/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(`${environment.URI}/estrella`, {
      directConnection: true,
      connectionName: 'estrella'
    }),
    MongooseModule.forRoot(`${environment.URI}/users`, {
      directConnection: true,
      connectionName: 'users'
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      debug: false
    }),
    UserModule,
    ScoresModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
