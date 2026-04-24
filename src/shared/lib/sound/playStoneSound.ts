const soundSrcs = ['/sounds/stone1.mp3', '/sounds/stone2.mp3', '/sounds/stone3.mp3'];

export const playStoneSound = () => {
  const randomIndex = Math.floor(Math.random() * soundSrcs.length);

  const audio = new Audio(soundSrcs[randomIndex]);
  audio.volume = 0.3 + Math.random() * 0.1;

  void audio.play();
};
