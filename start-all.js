const { execSync, spawn } = require('child_process');

function runSync(cmd, cwd) {
  console.log(`\n[${cwd}] > ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function startDev() {
  try {
    runSync('npm install', 'backend');
    runSync('npx prisma migrate dev', 'backend');
    runSync('npm run seed', 'backend');
    runSync('npm install', 'frontend');

    console.log('\nIniciando backend (npm run dev)...');
    const backend = spawn('npm run dev', {
      cwd: 'backend',
      stdio: 'inherit',
      shell: true
    });

    console.log('\nIniciando frontend (npm run dev)...');
    const frontend = spawn('npm run dev', {
      cwd: 'frontend',
      stdio: 'inherit',
      shell: true
    });

    backend.on('close', (code) => {
      console.log(`\nBackend finalizado com código ${code}`);
    });

    frontend.on('close', (code) => {
      console.log(`\nFrontend finalizado com código ${code}`);
    });
  } catch (err) {
    console.error('\nErro ao executar start-all:', err.message || err);
    process.exit(1);
  }
}

startDev();
