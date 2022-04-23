import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Score, ScoreDocument } from './MongoDB/scores.schema';
import { ScoresGateway } from './scores.gateway';
import { ScoresService } from './service/scores.service';
import { Model } from 'mongoose';

@Controller('scores')
export class ScoresController {
  private logger: Logger = new Logger('NestJS - Gateway');

  constructor(
    private readonly scoresService: ScoresService,
    private readonly scoreGateway: ScoresGateway,
    @InjectModel(Score.name) private readonly scoreModel: Model<ScoreDocument>
  ) {
    this.scoreModel.watch().on('change', (data: any) => {
      console.log('\n ========================= \n');
      this.scoreGateway.emitNewLiveScores();
    });
  }

  @Get()
  getScores(): any {
    return this.scoresService.getLiveScores();
  }

  @Get('socket/:socket')
  async getSocket(@Param('socket') socket: string): Promise<any> {
    this.logger.log(socket);
    const scores = await this.scoresService.getLiveScores();
    this.logger.log(scores);
    this.scoreGateway.emitMessage(socket);
  }

  @Get('add/batchID/:batchID')
  getScore(@Param('batchID') batchID: string): any {
    return this.scoresService.addRandomStuff(batchID);
  }
  @Get('delete/batchID/:batchID')
  deleteScore(@Param('batchID') batchID: string): any {
    return this.scoresService.deleteRandomStuff(batchID);
  }
  // @Get('batchID/:batchID')
  // getScore(@Param('batchID') batchID: string): any {
  //   return this.scoresService.getScoreByBatchID(batchID);
  // }

  // @Get('active')
  // getActiveScores(): any {
  //   return this.scoresService.getActiveScores();
  // }
}
