
function EarTrainer(base_freq, sustain, delay) {
    this.base_freq = base_freq || 440;  // base frequency for 'A'
    this.sustain   = sustain   || 1000; // time to sustain note (ms)
    this.delay     = delay     || 250;  // delay between notes (ms)
    this._lock = new Semaphore(1);  // max notes to play simultaneously
    var AudioContext = (AudioContext || webkitAudioContext);
    this._ctx = new AudioContext();
}
EarTrainer.prototype = {
    play_interval:  function (lower_note, interval) {
        lower_note = parseInt(lower_note);
        interval   = parseInt(interval);
        this.play_note(lower_note, this.sustain);
        this.play_note(null, this.delay);
        this.play_note(lower_note + interval, this.sustain);
    },
    play_random_interval: function (note) {
        var interval = Math.round(Math.random() * 12);
        this.play_interval(note || this.random_note(), interval);
        return interval;
    },
    play_note:  function (note, duration) {
        var self = this;
        this._lock.acquire(function () {
            duration = duration || 1000;
            var osc = self._ctx.createOscillator();
            osc.connect(self._ctx.destination);
            if (note != undefined) {
                osc.frequency.value = self.note_freq(note);
                osc.start(0);
            };
            setTimeout(function () {
                osc.stop(0);
                self._lock.release();
            }, duration);
        });
    },
    random_note: function () {
        var note = Math.round(Math.random() * 12);
        return note;
    },
    play_random_note: function () {
        var note = this.random_note();
        this.play_note(note);
        return note;
    },
    note_freq:  function (note) {
        return this.base_freq * Math.pow(2, note/12);
    },
    note_step_lookup: {
        'Ab': 11, 'A': 0,  'A#': 1,
        'Bb': 1,  'B': 2,  'B#': 3,
        'Cb': 2,  'C': 3,  'C#': 4,
        'Db': 4,  'D': 5,  'D#': 6,
        'Eb': 6,  'E': 7,  'E#': 8,
        'Fb': 7,  'F': 8,  'F#': 9,
        'Gb': 9,  'G': 10, 'G#': 11,
    },
    note_symbol_lookup: [
        'A', 'Bb', 'B', 'C', 'C#', 'D',
        'Eb', 'E', 'F', 'F#', 'G', 'Ab'
    ],
};
function Semaphore(count, delay) {
    this._count = (count !== undefined) ? count : 1;
    this._queue = [];
}
Semaphore.prototype = {
    acquire: function (cb) {
        if (this._count > 0) {
            -- this._count;
            cb();
        } else this._queue.push(cb);
    },
    release: function () {
        ++ this._count;
        if (this._queue.length)
            this.acquire(this._queue.shift());
    },
    constructor: Semaphore,
};
