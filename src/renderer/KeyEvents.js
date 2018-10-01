class KeyEvents {
  downMap = {};
  upMap = {};
  pressed = new Set();

  addDownListener = (key, listener) => {
    const listeners = this.downMap[key] || [];
    listeners.push(listener);
    this.downMap[key] = listeners;
    return () => (this.downMap[key] = this.downMap[key].filter(l => l !== listener));
  };

  addUpListener = (key, listener) => {
    const listeners = this.upMap[key] || [];
    listeners.push(listener);
    this.upMap[key] = listeners;
    return () => (this.upMap[key] = this.upMap[key].filter(l => l !== listener));
  };

  keyDownListener = event => {
    if (this.pressed.has(event.key)) return;
    this.pressed.add(event.key);
    if (process.env.NODE_ENV !== 'production') {
      console.log(event.key);
    }
    const listeners = this.downMap[event.key] || [];
    listeners.forEach(l => l(event));
  };

  keyUpListener = event => {
    this.pressed.delete(event.key);
    const listeners = this.upMap[event.key] || [];
    listeners.forEach(l => l(event));
  };

  isPressed = key => {
    return this.pressed.has(key);
  };
}

export default KeyEvents;
