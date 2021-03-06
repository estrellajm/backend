import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GraphQLError } from 'graphql';
import { Model, Types } from 'mongoose';
import { CreateScore, UpdateScore } from '../GraphQL/scores.graphql';
import { Score, ScoreDocument } from '../MongoDB/scores.schema';

@Injectable()
export class ScoresService {
  private logger: Logger = new Logger('NestJS - Gateway');

  constructor(
    @InjectModel(Score.name)
    private readonly scoreModel: Model<ScoreDocument>
  ) {}

  async getLiveScores() {
    try {
      return this.scoreModel.find().sort('order').exec();
      // return await this.scoreModel.find().sort('order').exec();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'This is a custom exception message'
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  async getScores() {
    try {
      return await this.scoreModel.find().sort('order').exec();
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async getScore(_id: string) {
    try {
      return await this.scoreModel.findOne({
        _id: _id
      });
    } catch (error) {
      throw new GraphQLError(error);
    }
  }
  async getScoreByBatchID(batchID: string) {
    try {
      return await this.scoreModel
        .find({
          batchID: { $regex: batchID } // finds scores by batchID
        })
        .sort({ inProgress: -1 }) // sorts by "inProgress: true" to the top
        .sort({ batchID: -1 }) // sorts by "batchID: true" to the top
        .exec();
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }
  async getActiveScores() {
    try {
      return await this.scoreModel.find({
        inProgress: true
      });
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async addRandomStuff(tmcHostname: string) {
    const scoreGuid = tmcHostname;
    const batchID = tmcHostname;
    const score: Score = new Score({ tmcHostname, scoreGuid, batchID });
    score.startTime = new Date();
    try {
      return await new this.scoreModel(score).save();
    } catch (error) {
      throw new HttpException(error, HttpStatus.EXPECTATION_FAILED);
    }
  }
  async deleteRandomStuff(name: string): Promise<any> {
    try {
      return await this.scoreModel.findOneAndDelete({ tmcHostname: name });
    } catch (error) {
      throw new HttpException(error, HttpStatus.EXPECTATION_FAILED);
    }
  }
  async scoreStart(tmcHostname: string, scoreGuid: string, batchID: string) {
    const score: Score = new Score({ tmcHostname, scoreGuid, batchID });
    score.startTime = new Date();
    try {
      return await new this.scoreModel(score).save();
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async scoreFinish(tmcHostname: string, scoreGuid: string, batchID: string) {
    const score = await this.scoreModel.findOne({
      batchID: batchID
    });

    score.inProgress = false;
    score.status = 'Finished';
    score.endTime = new Date();
    score.updatedAt = new Date();

    const date1 = new Date(score.startTime);
    const date2 = new Date(score.endTime);
    const diff = Math.round((date2.valueOf() - date1.valueOf()) / 1000);
    score.seconds = diff;

    //TODO: Get Test Case results

    try {
      return await this.scoreModel
        .findByIdAndUpdate(score._id, score, {
          new: true
        })
        .exec();
    } catch (error) {
      return new HttpException(error, HttpStatus.SEE_OTHER);
    }
  }

  private genSlug(createScore: CreateScore) {
    return (
      createScore.slug ??
      createScore.abbreviation
        .trim() // trims the leading and trailing whitespaces
        .replace(/[\s]+/g, '-') // replaces whitespaces with '-'
        .replace(/(?!-)[\W]+/g, '') // removes all non alpha-numeric characters
        .toLowerCase()
    ); // lowercase to all!
  }

  async createScore(createScore: CreateScore) {
    try {
      createScore.slug = this.genSlug(createScore);
      return await new this.scoreModel(createScore).save().then((pd) => {
        return pd;
      });
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async updateScore(_id: string, updateScore: UpdateScore) {
    try {
      // checks for a valid ObjectId
      const validID = Types.ObjectId.isValid(_id);
      if (!validID) throw new GraphQLError('_id is not valid');
      // checks if Score exists
      const isScore = await this.scoreModel.findById(_id);
      if (!isScore) throw new GraphQLError('Score not found');
      return await this.scoreModel
        .findByIdAndUpdate(_id, updateScore, {
          new: true
        })
        .exec();
    } catch (error) {
      throw new HttpException('Failed', HttpStatus.EXPECTATION_FAILED);
    }
  }

  async getScoreBySlug(slug: string) {
    try {
      return await this.scoreModel.findOne({
        slug: slug
      });
    } catch (error) {
      throw new GraphQLError(error);
    }
  }
  async deleteScore(_id: string) {
    return Promise.resolve();
  }
}
