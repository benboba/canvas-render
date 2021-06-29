const cbList: Array<() => void> = [];

let running = false;

const frame = () => {
    while (cbList.length > 0) {
        const fn = cbList.shift() as () => void;
        fn();
    }
    running = false;
};

export const raf = (fn: () => void) => {
    cbList.push(fn);
    if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
    }
}
