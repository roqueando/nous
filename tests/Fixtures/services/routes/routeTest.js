const {Router} = require('../../../../dist');

const router = new Router();

router.register("GET", '/hello', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write('<h1>Hello</h1>');
    res.end();
});

router.register("GET", "/test/:name/edit/:id", (req, res) => {
    res.write(`Test ${req.params.name} ${req.params.id}`);
})

module.exports = router;
