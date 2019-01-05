export const Config = {
  fake: false,
  model: 1,
  logged: false,
};

if (typeof window !== 'undefined' && window.location.hash && window.location.hash.length > 0) {
  const opts = new URLSearchParams(window.location.hash.substr(1));
  Config.fake = opts.has('fake');
  Config.logged = opts.has('logged');
  if (opts.has('model')) {
    Config.model = parseInt(opts.get('model')!, 10);
  }
} else if (process.env.B4TCONF) {
  const opts = new URLSearchParams(process.env.B4TCONF);
  Config.fake = opts.has('fake');
  Config.logged = opts.has('logged');
  if (opts.has('model')) {
    Config.model = parseInt(opts.get('model')!, 10);
  }
}
