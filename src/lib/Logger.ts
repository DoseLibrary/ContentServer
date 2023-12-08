enum LogLevel {
  INFO = 0,
  WARNING = 1,
  ERROR = 2,
  DEBUG = 3
}

enum Color {
  BLACK = "\x1b[30m",
  RED = "\x1b[31m",
  GREEN = "\x1b[32m",
  YELLOW = "\x1b[33m",
  BLUE = "\x1b[34m",
  MAGENTA = "\x1b[35m",
  CYAN = "\x1b[36m",
  WHITE = "\x1b[37m",
  RESET = "\x1b[0m"
}

class Logger {
  private level: LogLevel = LogLevel.DEBUG;

  private getTime() {
    const d = new Date();
    const minutes = ('0'+d.getMinutes()).slice(-2);
    const hours = ('0'+d.getHours()).slice(-2);
    return `${hours}:${minutes}`;
  }

  public info(message: unknown) {
    if (LogLevel.INFO < this.level) {
      this.print(message, Color.CYAN);
    }
  }

  public warning(message: unknown) {
    if (LogLevel.WARNING < this.level) {
      this.print(message, Color.YELLOW);
    }
  }

  public error(message: unknown) {
    if (LogLevel.ERROR < this.level) {
      this.print(message, Color.RED);
    }
  }

  public debug(message: unknown) {
    if (LogLevel.DEBUG <= this.level) {
      this.print(message, Color.MAGENTA);
    }
  }

  private print(message: unknown, color: Color) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message, null, 2);
    }
    console.log(`${color}${this.getTime()} > ${message}${Color.RESET}`);
  }
}

// The one and only Logger instance
const Log = new Logger();

export { Log, LogLevel };