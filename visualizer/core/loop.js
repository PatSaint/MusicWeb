export function startLoop(fn) {
    function loop() {
        fn();
        requestAnimationFrame(loop);
    }
    loop();
}
