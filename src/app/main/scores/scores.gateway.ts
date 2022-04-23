import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ScoresService } from './service/scores.service';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ScoresGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private scoresService: ScoresService) {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NestJS - Gateway');

  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: string): Promise<any> {
    this.logger.log(payload);
    this.logger.verbose(payload);
    // const scores = await this.scoresService.getLiveScores();
    this.server.emit('msgToClient', 'it worked bitches!');

    // this.server.emit('msgToClient', payload);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  async emitNewLiveScores() {
    const scores = await this.scoresService.getLiveScores();
    this.server.emit('msgToClient', scores);
  }
  async emitMessage(msg: any) {
    this.server.emit('msgToClient', msg);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const scores = await this.scoresService.getLiveScores();
    this.server.emit('msgToClient', scores);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
