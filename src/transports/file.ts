import fs from 'node:fs';
import path from 'node:path';
import { stripColors } from 'colors/safe';
import { StandardTransport } from '../lib/Logger';

export default class FileTransport implements StandardTransport {

  private delayed: boolean;
  private combined: fs.WriteStream;
  private error: fs.WriteStream;

  constructor(options?: { nextTick?: boolean; combined?: string; error?: string; }) {

    this.delayed = options?.nextTick ?? false;

    const dir = process.cwd();
    let combinedPath = dir + '/combined.log';
    let errorPath = dir + '/error.log';

    if (options && options.combined) {
      combinedPath = options.combined;
    }

    if(options && options.error) {
      errorPath = options.error;
    }

    try {
      this.combined = fs.createWriteStream(combinedPath as string, { flags: 'a' });
      this.error = fs.createWriteStream(errorPath as string, { flags: 'a' });
    }
    catch (err) {
      err.message = 'FileTransport is unable to open log files for writing. ' + err.message;
      throw err;
    }

  }

  internalWrite(stream, message) {
    try {
      message = stripColors(message);
      if (!Buffer.isBuffer(message)) {
        message = Buffer.from(message, 'utf8');
        this.delayed ? process.nextTick(() => stream.write(message)) : stream.write(message);
      }
    }
    catch (err) {
      process.stderr.write(err.toString());
    }
  }

  public write(message, level, logger) {
    if (logger.isError(level)) {
      this.internalWrite(this.error, message);
    }
    this.internalWrite(this.combined, message);
  }

}