import express from 'express';

const app = express();

app.get('/', (_req, res) => {
    res.send('Hello World');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server listening on ${port}`);
});
