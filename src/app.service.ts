import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const pathToData = '../data';

@Injectable()
export class AppService implements OnModuleInit {
  private pyxelShares = new Map();
  private lastPings = new Map();
  private pixelUpdateEmitter = new EventEmitter(); // Event emitter for pixel updates

  async onModuleInit() {
    try {
      const files = readdirSync(join(__dirname, pathToData));
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(__dirname, pathToData, file);
          const data = readFileSync(filePath, 'utf8');
          const jsonData = JSON.parse(data);
          const id = file.split('.json')[0];
          // Check if pixels array is present and has 64 elements
          if (
            !jsonData.frames ||
            !jsonData.frames[0] ||
            jsonData.frames[0].pixels.length !== 64
          ) {
            // Initialize pixels array with default values
            jsonData.frames = [
              { pixels: Array(64).fill({ r: 0, g: 0, b: 0 }), duration: 1000 },
            ];

            // Save the updated data back to the file
            writeFileSync(filePath, JSON.stringify(jsonData));
          }

          this.pyxelShares.set(id, jsonData);
        }
      }
    } catch (error) {
      console.error('Error reading JSON files:', error);
    }
  }

  validateCredentials(id: string, password: string): boolean {
    const pyxelShare = this.pyxelShares.get(id);
    if (!pyxelShare) return false;
    return pyxelShare.password === password;
  }

  getFrames(id: string) {
    return this.pyxelShares.get(id)?.frames;
  }

  setFrames(id: string, frames: any[]): boolean {
    for (const frame of frames) {
      if (frame.pixels.length !== 64) return false;
    }

    const pyxelShare = this.pyxelShares.get(id);
    if (pyxelShare) {
      pyxelShare.frames = frames;
      writeFileSync(
        join(__dirname, pathToData, `${id}.json`),
        JSON.stringify(pyxelShare),
      );

      this.pixelUpdateEmitter.emit('pixelsUpdate', { id, frames });

      return true;
    }
    return false;
  }

  // Method to register a callback for pixel updates
  onPixelsUpdate(id: string, callback: (frames: any[]) => void) {
    this.pixelUpdateEmitter.on('pixelsUpdate', (update) => {
      if (update.id === id) {
        callback(update.frames);
      }
    });
  }

  getLastPing(id: string) {
    if (this.lastPings.has(id)) {
      return this.lastPings.get(id);
    } else {
      return undefined;
    }
  }

  setPingToNow(id: string) {
    this.lastPings.set(id, new Date().getTime());
  }
}
