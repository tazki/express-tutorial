import express from 'express';
import { query, validationResult, body, matchedData } from 'express-validator';

const app = express();
app.use(express.json());

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method}` - `${req.url}`);
    next();
};

// Middleware
const resolveIndexByUserId = (req, res, next) => {
    const {
        params: { id } 
    } = req;   
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) return res.sendStatus(400);
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
    if (findUserIndex === -1) return res.sendStatus(404);
    req.findUserIndex = findUserIndex;
    next();
};

const PORT = process.env.PORT || 3000;

const mockUsers = [
    { id: 1, username: "mark", displayName: "Mark"},
    { id: 2, username: "tina", displayName: "Tina"},
    { id: 3, username: "john", displayName: "John"},
    { id: 4, username: "joe", displayName: "Joe"},
    { id: 5, username: "henry", displayName: "Henry"}
];

app.get('/', (req, res) => {
    res.status(200).send({
        msg: "Hello"
    });
});

app.get('/api/users', 
    query('filter').isString().notEmpty().withMessage('Must no be empty').isLength({ min:3, max:10 }).withMessage('Must be at least 3 to 10 characters'), 
    (req, res) => {
        const result = validationResult(req);
        console.log(result);
        const { 
            query: { filter, value }, 
        } = req;

        if (filter && value) 
            return res.send(
                mockUsers.filter((user) => user[filter].includes(value))
            );

        return res.send(mockUsers);
    }
);

app.post('/api/users', 
    [
        body('username')
        .notEmpty().withMessage('Username cannot be empty')
        .isLength({ min:5, max:32}).withMessage('Must be at least 5 to 32 characters')
        .isString().withMessage('Username must be string'),
    body('displayName').notEmpty(),
    ],
    (req, res) => {
        const result = validationResult(req);

        if (!result.isEmpty())
            return res.status(400).send({ errors: result.array() });

        const data = matchedData(req);
        const newUser = { id: mockUsers[mockUsers.length - 1] .id + 1, ...data };
        mockUsers.push(newUser);
        return res.status(201).send(newUser);
    }
);

app.get('/api/users/:id', resolveIndexByUserId, (req, res) => {
    const { findUserIndex } = req;
    const findUser = mockUsers[findUserIndex];
    if (!findUser) return res.sendStatus(404);

    return res.send(findUser);
});

app.put('/api/users/:id', resolveIndexByUserId, (req, res) => {
    const { body, findUserIndex } = req;
    mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };
    return res.sendStatus(200);
});

app.patch('/api/users/:id', resolveIndexByUserId, (req, res) => {
    const { body, findUserIndex } = req;
    mockUsers[findUserIndex] = { ...mockUsers[findUserIndex],  ...body };
    return res.sendStatus(200);
});

app.delete('/api/users/:id', resolveIndexByUserId, (req, res) => {
    const { findUserIndex } = req;
    mockUsers.splice(findUserIndex, 1);
    return res.sendStatus(200);
});

app.get('/api/products', (req, res) => {
    res.send([
        { id: 123, name: "chicken", "price": 12.99},
    ]);
});

app.listen(PORT, () => {
    console.log(`Running on ${PORT}`);
});