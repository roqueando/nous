const {Router} = require('../../../../dist');

const router = new Router();

router.register("GET", '/hello', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write('<h1>Hello</h1>');
    res.end();
});

router.register("GET", "/test/:name", (req, res) => {
    res.write('teste');
})

module.exports = router;
