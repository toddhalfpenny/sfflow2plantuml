let loggerInstance: Logger;

export class Logger {
  outputChannel: any;

  constructor(vsCodeWindow: any) {
    this.outputChannel = vsCodeWindow.createOutputChannel("SF Flow Visualiser");
    loggerInstance = this;
  }

  static log(str: any): void {
    if (loggerInstance) {
      console.log(str);
      for (const line of str.toString().split("\n")) {
        loggerInstance.outputChannelLog(line);
      }
    } else {
      console.log(str);
    }
  }

  outputChannelLog(str: string) {
    this.outputChannel.appendLine(str);
  }
}
