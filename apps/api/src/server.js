const { port } = require('./config/env');
const { server } = require('./app');

const PORT = process.env.PORT || port;

server.listen(PORT, () => {
    console.log('\n' + 'âš”ï¸ '.repeat(20));
    console.log(`\x1b[35mðŸš€ RPG BACKEND ENGINE v2.0\x1b[0m`);
    console.log(`\x1b[32mâœ” Status: ONLINE\x1b[0m`);
    console.log(`\x1b[36mâš¡ Port:   ${PORT}\x1b[0m`);
    console.log('âš”ï¸ '.repeat(20) + '\n');
});
