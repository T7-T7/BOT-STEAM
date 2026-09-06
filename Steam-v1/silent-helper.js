const originalLog = console.log;

function installSilentInteractiveLog() {
    console.log = function (...args) {
        if (
            typeof args[0] === 'string' &&
            args[0].startsWith('Interactive send:')
        ) {
            return;
        }

        return originalLog.apply(console, args);
    };
}

module.exports = {
    installSilentInteractiveLog
};
