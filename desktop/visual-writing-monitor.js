const SAMPLE_WIDTH = 180;
const SAMPLE_HEIGHT = 110;
const CHANGE_THRESHOLD = 3.2;

function frameDifference(previous, current) {
  if (!previous || previous.length !== current.length) return 0;
  let difference = 0;
  let samples = 0;

  const rowBytes = SAMPLE_WIDTH * 4;
  const start = Math.floor(SAMPLE_HEIGHT * 0.16) * rowBytes;
  for (let index = start; index < current.length; index += 16) {
    difference += Math.abs(current[index] - previous[index]);
    difference += Math.abs(current[index + 1] - previous[index + 1]);
    difference += Math.abs(current[index + 2] - previous[index + 2]);
    samples += 3;
  }

  return samples ? difference / samples : 0;
}

export class VisualWritingMonitor {
  constructor({ desktopCapturer, activity }) {
    this.desktopCapturer = desktopCapturer;
    this.activity = activity;
    this.foreground = null;
    this.timer = null;
    this.running = false;
    this.previousFrame = null;
    this.changingFrames = 0;
    this.stableFrames = 0;
    this.visualSource = null;
  }

  start() {
    this.timer = setInterval(() => this.tick(), 550);
  }

  setForeground(info) {
    const changed =
      info?.id !== this.foreground?.id ||
      info?.provider !== this.foreground?.provider;
    this.foreground = info;
    if (changed) this.reset();
  }

  reset() {
    this.previousFrame = null;
    this.changingFrames = 0;
    this.stableFrames = 0;
    if (this.visualSource) {
      this.activity.setAiMode(this.visualSource, false);
      this.visualSource = null;
    }
  }

  async tick() {
    if (this.running) return;
    const foreground = this.foreground;
    if (
      !foreground?.provider ||
      !this.activity.hasAiProvider(foreground.provider)
    ) {
      this.reset();
      return;
    }

    if (Date.now() - this.activity.lastInputAt < 900) return;

    this.running = true;
    try {
      const sources = await this.desktopCapturer.getSources({
        types: ["window"],
        thumbnailSize: {
          width: SAMPLE_WIDTH,
          height: SAMPLE_HEIGHT
        },
        fetchWindowIcons: false
      });

      const idText = String(foreground.id);
      const source =
        sources.find((item) => item.id.split(":")[1] === idText) ??
        sources.find((item) => item.name === foreground.title);
      if (!source || source.thumbnail.isEmpty()) return;

      const frame = source.thumbnail.toBitmap();
      const difference = frameDifference(this.previousFrame, frame);
      this.previousFrame = frame;
      if (!difference) return;

      if (difference >= CHANGE_THRESHOLD) {
        this.changingFrames += 1;
        this.stableFrames = 0;
      } else {
        this.stableFrames += 1;
        this.changingFrames = 0;
      }

      const sourceName = `visual:${foreground.provider}`;
      if (this.changingFrames >= 2 && this.visualSource !== sourceName) {
        this.visualSource = sourceName;
        this.activity.setAiMode(sourceName, "writing");
      } else if (this.stableFrames >= 3 && this.visualSource) {
        this.activity.setAiMode(this.visualSource, false);
        this.visualSource = null;
      }
    } catch {
      // Protected or closing windows can reject one capture sample.
    } finally {
      this.running = false;
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.reset();
  }
}

export { frameDifference };
