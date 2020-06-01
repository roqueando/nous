const {Router} = require('../../../../dist');

const router = new Router();

router.use((req, res, next) => {
    req.test = 'testing';
    next();
});
router.register("GET", '/hello', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write('<h1>Hello</h1>');
    res.end();
});

router.register("DELETE", "/test/:id/post", (req, res) => {
    res.write(`Deleting id: ${req.params.id}`);
})

router.register("GET", "/test/:id/post/:post_id", (req, res) => {
    res.write(`Get id: ${req.params.id} the post id: ${req.params.post_id}`);
})

router.register("GET", "/test/:id/edit/:name", (req, res) => {
    res.write(`Test ${req.params.name} ${req.params.id}`);
})

router.register("GET", "/test/:id", (req, res) => {
    res.write(`Test ${req.params.id}!`);
})

router.register("POST", '/say', (req, res) => { 
    const { name } = req.body;
    res.write(`Aloha ${name}`);
});

router.register("GET", '/middle', (req, res) => {
    res.write(`Hey middleware ${req.test}`);
    res.end();
})

module.exports = router;
