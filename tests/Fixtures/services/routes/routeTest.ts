import {Router, HTTPMethods} from '../../../../src/index';

const router = new Router();

router.use((req: any, _: any, next: Function) => {
    req.test = 'testing';
    next();
});
router.register(HTTPMethods.GET, '/hello', (_: any, res: any) => {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.write('<h1>Hello</h1>');
    res.end();
});

router.register(HTTPMethods.DELETE, "/test/:id/post", (req: any, res: any) => {
    res.write(`Deleting id: ${req.params.id}`);
})

router.register(HTTPMethods.GET, "/test/:id/post/:post_id", (req: any, res: any) => {
    res.write(`Get id: ${req.params.id} the post id: ${req.params.post_id}`);
})

router.register(HTTPMethods.GET, "/test/:id/edit/:name", (req: any, res: any) => {
    res.write(`Test ${req.params.name} ${req.params.id}`);
})

router.register(HTTPMethods.GET, "/test/:id", (req: any, res: any) => {
    res.write(`Test ${req.params.id}!`);
})

router.register(HTTPMethods.POST, '/say', (req: any, res: any) => { 
    const { name } = req.body;
    res.write(`Aloha ${name}`);
});

router.register(HTTPMethods.GET, '/middle', (req: any, res: any) => {
    res.write(`Hey middleware ${req.test}`);
    res.end();
})

export default router;
