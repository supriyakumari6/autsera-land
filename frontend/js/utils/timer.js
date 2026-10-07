
const Timer = (() => {
  let interval = null;
  let elapsed  = 0;
  let limit    = null;
  let onTick   = null;
  let onEnd    = null;

  function start(opts = {}) {
    stop();
    elapsed = opts.startAt || 0;
    limit   = opts.limit   || null;   
    onTick  = opts.onTick  || null;
    onEnd   = opts.onEnd   || null;

    interval = setInterval(() => {
      elapsed++;
      if (onTick) onTick(elapsed);
      if (limit && elapsed >= limit) { stop(); if (onEnd) onEnd(); }
    }, 1000);
  }

  function stop()  { clearInterval(interval); interval = null; }
  function pause() { stop(); }
  function resume(opts = {}) { start({ limit, onTick, onEnd, ...opts, startAt: elapsed }); }  
  function reset() { stop(); elapsed = 0; }
  function getElapsed() { return elapsed; }

  return { start, stop, pause, resume, reset, getElapsed };
})();
