import * as fs from 'fs';
import os from 'os';
import path from 'path';
import { TranscodingPreset, TranscodingSettings, TranscodingVideoCodec } from '../types/TranscodingTypes';

interface ConfigData {
  mainServer: string;
  database: {
    host: string;
    password: string;
    port: string;
    user: string;
    name: string; // database name
  };
  setupComplete: boolean;
  transcoding: {
    directory: string;
    h265: TranscodingSettings;
    h264: TranscodingSettings;
    h264_nvenc: TranscodingSettings;
    primaryVideoCodec: TranscodingVideoCodec;
    secondaryVideoCodec: TranscodingVideoCodec;
  }
};

const isValidConfigData = (obj: unknown): obj is ConfigData => {
  const data = obj as ConfigData;
  return data && typeof data.mainServer === 'string';
}

export class Config {
  private data: ConfigData;

  constructor(path: string) {
    if (!fs.existsSync(path)) {
      this.createConfigFile(path);
    }
    const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
    if (!isValidConfigData(data)) {
      throw new Error(`${path} does not contain valid data`);
    }
    this.data = data;
  }

  public get mainServer() {
    return this.data.mainServer;
  }

  public get database() {
    return this.data.database;
  }

  public get transcoding() {
    return this.data.transcoding;
  }

  public get setupComplete() {
    return this.data.setupComplete;
  }

  private createConfigFile(filePath: string) {
    const tmpPath = path.join(os.tmpdir(), 'Dose');
    const defaultTranscodingPath = path.join(tmpPath, 'transcodings');
    const defaultTranscodingSettings: TranscodingSettings = {
      crf: 22,
      preset: TranscodingPreset.ULTRAFAST,
      threads: 8
    };

    const data: ConfigData = {
      mainServer: '',
      setupComplete: false,
      database: {
        host: '',
        password: '',
        port: '',
        user: '',
        name: ''
      },
      transcoding: {
        directory: defaultTranscodingPath,
        h265: defaultTranscodingSettings,
        h264: defaultTranscodingSettings,
        h264_nvenc: defaultTranscodingSettings,
        primaryVideoCodec: TranscodingVideoCodec.H264,
        secondaryVideoCodec: TranscodingVideoCodec.H264
      }
    };
    fs.mkdirSync(tmpPath);
    fs.mkdirSync(defaultTranscodingPath);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  }
}