import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import * as path from 'path';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  login(@Body() body: { id: string; password: string }, @Res() res: Response) {
    if (this.appService.validateCredentials(body.id, body.password)) {
      return res.status(HttpStatus.OK).send();
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  @Get('status/:id/:password')
  getStatus(
    @Param('id') id: string,
    @Param('password') password: string,
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(id, password)) {
      const lastPing = this.appService.getLastPing(id);
      return res.status(HttpStatus.OK).json({ lastPing });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  @Get('getData/:id/:password')
  getData(
    @Param('id') id: string,
    @Param('password') password: string,
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(id, password)) {
      const data = this.appService.getFrames(id);
      return res.status(HttpStatus.OK).json({ frames: data });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  @Put('setData')
  setData(
    @Body() body: { id: string; password: string; pixels: any[] },
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(body.id, body.password)) {
      if (this.appService.setFrames(body.id, body.pixels)) {
        return res.status(HttpStatus.OK).send();
      } else {
        return res.status(HttpStatus.BAD_REQUEST).send('Invalid pixel data');
      }
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  @Get('getFramesRaw/:id/:password')
  getDataRaw(
    @Param('id') id: string,
    @Param('password') password: string,
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(id, password)) {
      console.log(`Sending update to ${id}`);
      // mark as pinged from pyxelSync
      this.appService.setPingToNow(id);

      const frames = this.appService.getFrames(id); // Assuming this returns an array of pixel objects
      let data = [];
      for (const frame of frames) {
        const reorderedPixels = [];

        // KLUDGE: Rotate 90 degrees to the right for 'nateowl' as I glued the matrix on wrong
        let tempPixels = [];
        if (id === 'nateowl') {
          for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
              const newIndex = col * 8 + (7 - row); // New index for rotation
              tempPixels[newIndex] = frame.pixels[row * 8 + col];
            }
          }
        } else {
          tempPixels = frame.pixels;
        }

        // Apply zig-zag reorder logic to either rotated or original pixel array
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const index = row % 2 === 0 ? row * 8 + (7 - col) : row * 8 + col;
            reorderedPixels.push(tempPixels[index]);
          }
        }

        // Flatten the pixel data
        const flattenedPixels = reorderedPixels.reduce((acc, pixel) => {
          acc.push(pixel.r, pixel.g, pixel.b);
          return acc;
        }, []);

        // add the frame duration as 32 bits (4 bytes)
        flattenedPixels.push();
        const dur = frame.duration >>> 0;
        // Push each byte into the array
        flattenedPixels.push((dur & 0xff000000) >>> 24);
        flattenedPixels.push((dur & 0x00ff0000) >>> 16);
        flattenedPixels.push((dur & 0x0000ff00) >>> 8);
        flattenedPixels.push(dur & 0x000000ff);

        data = data.concat(flattenedPixels);
      }

      res.type('application/octet-stream');

      // Convert to a binary buffer
      const binaryBuffer = Buffer.from(data);

      // Send the binary data
      return res.status(HttpStatus.OK).send(binaryBuffer);
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  /**
   * @deprecated only used for versions before 0.1.0
   */
  @Get('getDataRaw/:id/:password')
  getDataRaw_Deprecated(
    @Param('id') id: string,
    @Param('password') password: string,
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(id, password)) {
      console.log(`Sending old update to ${id}`);
      // mark as pinged from pyxelSync
      this.appService.setPingToNow(id);

      res.type('application/octet-stream');

      // Convert to a binary buffer
      const binaryBuffer = Buffer.from(new Array(192).fill(15));

      // Send the binary data
      return res.status(HttpStatus.OK).send(binaryBuffer);
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }

  static latestFirmwareVersion = '0.1.0';
  @Get('firmware/:id/:password/:version')
  getFirmware(
    @Param('id') id: string,
    @Param('password') password: string,
    @Param('version') version: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (this.appService.validateCredentials(id, password)) {
      // mark recent ping from pyxelSync
      this.appService.setPingToNow(id);
      if (version !== AppController.latestFirmwareVersion) {
        console.log(
          `Sending firmware update to ${id}. Current version: ${version}, New version: ${AppController.latestFirmwareVersion}`,
        );
        const firmwarePath = path.join(
          __dirname,
          '..',
          'firmware',
          `${id}-${AppController.latestFirmwareVersion}.bin`,
        );
        res.sendFile(firmwarePath);
      } else {
        console.log(`No update needed for ${id}. Current version: ${version}`);
        res.status(304).send('No update needed'); // 204 Not Modified
      }
    } else {
      res.status(403).send('Invalid credentials');
    }
  }
}
