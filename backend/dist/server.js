"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' }
});
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/society_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-society', (societyId) => {
        socket.join(societyId);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.set('io', io);
const auth_1 = __importDefault(require("./routes/auth"));
const residents_1 = __importDefault(require("./routes/residents"));
const units_1 = __importDefault(require("./routes/units"));
const bills_1 = __importDefault(require("./routes/bills"));
const payments_1 = __importDefault(require("./routes/payments"));
const facilities_1 = __importDefault(require("./routes/facilities"));
const visitors_1 = __importDefault(require("./routes/visitors"));
const complaints_1 = __importDefault(require("./routes/complaints"));
const announcements_1 = __importDefault(require("./routes/announcements"));
const security_1 = __importDefault(require("./routes/security"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/residents', apiLimiter, residents_1.default);
app.use('/api/units', apiLimiter, units_1.default);
app.use('/api/bills', apiLimiter, bills_1.default);
app.use('/api/payments', apiLimiter, payments_1.default);
app.use('/api/facilities', apiLimiter, facilities_1.default);
app.use('/api/visitors', apiLimiter, visitors_1.default);
app.use('/api/complaints', apiLimiter, complaints_1.default);
app.use('/api/announcements', apiLimiter, announcements_1.default);
app.use('/api/security', apiLimiter, security_1.default);
app.use('/api/vehicles', apiLimiter, vehicles_1.default);
app.use('/api/dashboard', apiLimiter, dashboard_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error' });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
