type DragHandlers = {
  onStart: () => void;
  onMove: (deltaX: number) => void;
  /** Vitesse de lâcher en px/ms, nulle si le geste s'est arrêté avant le lâcher. */
  onEnd: (flick: number) => void;
};

const FLICK_WINDOW_MS = 90;

/** Maintenir et glisser, à la souris comme au doigt. Les boutons et liens restent cliquables. */
export function enableDrag(element: HTMLElement, { onStart, onMove, onEnd }: DragHandlers) {
  let dragging = false;
  let startX = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || (event.target as Element).closest('button, a')) return;
    dragging = true;
    startX = lastX = event.clientX;
    lastTime = event.timeStamp;
    velocity = 0;
    element.classList.add('is-dragging');
    onStart();
  });

  window.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const elapsed = event.timeStamp - lastTime;
    if (elapsed > 0) velocity += ((event.clientX - lastX) / elapsed - velocity) * 0.4;
    lastX = event.clientX;
    lastTime = event.timeStamp;
    onMove(event.clientX - startX);
  });

  const release = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    element.classList.remove('is-dragging');
    onEnd(event.timeStamp - lastTime > FLICK_WINDOW_MS ? 0 : velocity);
  };

  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}
