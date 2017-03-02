let Unzip = require('zlibjs/bin/unzip.min').Zlib.Unzip;

export default class ZipAnimation {
  constructor(opts = {}) {
    this.elm = opts.elm;

    let file = opts.src || this.elm.getAttribute('data-src');

    const ctx = this.elm.getContext('2d');

    const imgArr = [];

    fetch(file).then(res => {
      res.arrayBuffer().then(buffer => {
        const uint8Array = new Uint8Array(buffer);
        const unzip = new Unzip(uint8Array);

        let filenameArr = unzip.getFilenames();

        Promise.all(filenameArr.map((filename, i) => {
          let promise = new Promise(resolve => {
            let buffer = new Buffer(unzip.decompress(filename));

            let blob = new Blob([buffer], {
              type: 'image/png',
            });
            let url = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = function() {
              imgArr[i] = this;
              URL.revokeObjectURL(url);

              resolve();
            }

            img.src = url;
          });

          return promise;
        }))
          .then(
            () => {
              let frame = 0;
              setInterval(() => {
                ctx.clearRect(0, 0, this.elm.width, this.elm.height);
                ctx.drawImage(imgArr[frame % imgArr.length], 0, 0);

                frame++;
              }, 500);
            },
            err => {
              console.error(err);
            }
          )
        ;
      });
    });
  }
}

document.querySelectorAll('[data-zip-animation]').forEach((elm) => {
  new ZipAnimation({
    elm,
  });
});

// export
global.ZipAnimation = ZipAnimation;
