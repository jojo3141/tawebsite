export const smoothScrollToTop = (duration: number) => {
    const start = window.scrollY;
    const startTime = performance.now();

    const easeInOutQuad = (t: number) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const scroll = (currentTime: number) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutQuad(progress);

        window.scrollTo(0, start * (1 - ease));

        if (timeElapsed < duration) {
            requestAnimationFrame(scroll);
        }
    };

    requestAnimationFrame(scroll);
};
