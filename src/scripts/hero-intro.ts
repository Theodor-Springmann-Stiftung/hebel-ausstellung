const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const animations = new Set<Animation>();

const introduceHero = async (image: HTMLImageElement) => {
  if (reducedMotion.matches) return;
  try {
    await image.decode();
  } catch {
    return;
  }
  if (reducedMotion.matches || !image.isConnected) return;
  const bounds = image.getBoundingClientRect();
  // Deep links should not animate a hero that is already above the viewport.
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

  const animation = image.animate([
    { transform: "scale(1.06)" },
    { transform: "scale(1)" },
  ], { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
  animations.add(animation);
  void animation.finished.then(
    () => animations.delete(animation),
    () => animations.delete(animation),
  );
};

document.querySelectorAll<HTMLImageElement>("[data-hero-intro]").forEach(image => {
  void introduceHero(image);
});

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) animations.forEach(animation => animation.cancel());
});
