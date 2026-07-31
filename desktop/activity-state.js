export const PET_STATES = Object.freeze({
  idle: {
    asset: "idle.gif",
    label: "Đang nghỉ"
  },
  typing: {
    asset: "writing.gif",
    label: "Đang gõ"
  },
  thinking: {
    asset: "thinking.gif",
    label: "AI đang suy nghĩ"
  },
  aiWriting: {
    asset: "writing.gif",
    label: "AI đang trả lời"
  },
  result: {
    asset: "result.gif",
    label: "AI đã trả lời"
  },
  hover: {
    asset: "result.gif",
    label: "Xin chào"
  },
  waiting: {
    asset: "waiting-input.gif",
    label: "Đang chờ bạn"
  }
});

export class ActivityState {
  constructor({
    emit,
    now = () => Date.now(),
    setTimer = setTimeout,
    clearTimer = clearTimeout,
    typingHoldMs = 900
  }) {
    this.emit = emit;
    this.now = now;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.typingHoldMs = typingHoldMs;
    this.state = "idle";
    this.lastInputAt = this.now();
    this.releaseTimer = null;
    this.resultTimer = null;
    this.hovering = false;
    this.aiSources = new Set();
    this.aiWritingSources = new Set();
    this.aiWaitingSources = new Set();
    this.pendingResult = false;
  }

  setState(nextState) {
    if (this.state === nextState) return;
    this.state = nextState;
    this.emit(nextState);
  }

  noteKeyboard() {
    this.lastInputAt = this.now();
    this.hovering = false;
    this.scheduleRelease(this.typingHoldMs);
    this.setState("typing");
  }

  notePointerAction() {
    this.lastInputAt = this.now();
  }

  notePointerMove() {
    this.lastInputAt = this.now();
  }

  setHovering(value) {
    this.hovering = value;
    if (this.aiSources.size) return;
    this.clearRelease();
    if (value) {
      this.setState("hover");
    } else {
      this.setState("idle");
    }
  }

  noteIdleSeconds(seconds) {
    if (this.aiSources.size) return;
    if (seconds >= 45 && !this.hovering) {
      this.clearRelease();
      this.setState("idle");
    }
  }

  noteLock() {
    this.clearRelease();
    this.clearResult();
    this.setState("idle");
  }

  noteUnlock() {
    this.lastInputAt = this.now();
    this.aiSources.clear();
    this.aiWritingSources.clear();
    this.aiWaitingSources.clear();
    this.setState("idle");
  }

  setAiThinking(source, isThinking) {
    this.setAiMode(source, isThinking ? "thinking" : false);
  }

  setAiMode(source, mode) {
    this.clearResult();
    if (mode === "thinking" || mode === "writing" || mode === "waiting") {
      this.aiSources.add(source);
      if (mode === "writing") {
        this.aiWritingSources.add(source);
      } else {
        this.aiWritingSources.delete(source);
      }
      if (mode === "waiting") {
        this.aiWaitingSources.add(source);
      } else {
        this.aiWaitingSources.delete(source);
      }
      this.pendingResult = false;
      if (this.state === "typing") {
        return;
      } else {
        this.clearRelease();
        this.setState(this.currentAiState());
      }
      return;
    }

    this.aiSources.delete(source);
    this.aiWritingSources.delete(source);
    this.aiWaitingSources.delete(source);
    if (this.aiSources.size) {
      if (this.state !== "typing") {
        this.setState(this.currentAiState());
      }
      return;
    }

    this.pendingResult = true;
    if (this.state === "typing") return;
    this.showResult();
  }

  showResult() {
    this.pendingResult = false;
    this.setState("result");
    this.resultTimer = this.setTimer(() => {
      this.resultTimer = null;
      this.setState(this.hovering ? "hover" : "idle");
    }, 4200);
  }

  currentAiState() {
    if (this.aiWritingSources.size) return "aiWriting";
    if (this.aiWaitingSources.size) return "waiting";
    return "thinking";
  }

  hasAiProvider(provider) {
    const prefix = `${provider}:`;
    return [...this.aiSources].some((source) => source.startsWith(prefix));
  }

  scheduleRelease(delay) {
    this.clearRelease();
    this.releaseTimer = this.setTimer(() => {
      this.releaseTimer = null;
      if (this.pendingResult && !this.aiSources.size) {
        this.showResult();
      } else if (this.aiSources.size) {
        this.setState(this.currentAiState());
      } else if (!this.hovering) {
        this.setState("idle");
      }
    }, delay);
  }

  clearRelease() {
    if (this.releaseTimer) {
      this.clearTimer(this.releaseTimer);
      this.releaseTimer = null;
    }
  }

  clearResult() {
    if (this.resultTimer) {
      this.clearTimer(this.resultTimer);
      this.resultTimer = null;
    }
  }

  dispose() {
    this.clearRelease();
    this.clearResult();
  }
}
