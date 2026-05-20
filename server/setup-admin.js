const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('./database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🛡️  LectureVault - Admin Account Setup\n');
console.log('This tool creates the first administrator account.');
console.log('Keep these credentials secure!\n');

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

(async () => {
  const email = await ask('Admin Email: ');
  const fullName = await ask('Admin Full Name: ');
  const password = await ask('Admin Password (min 8 chars): ');
  
  if (!email || !fullName || password.length < 8) {
    console.log('\n❌ All fields required. Password must be 8+ characters.\n');
    process.exit(1);
  }
  
  // Check if email already exists
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) {
    console.log('\n❌ A user with that email already exists.\n');
    process.exit(1);
  }
  
  const hash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO users (email, password, fullName, role) VALUES (?, ?, ?, ?)').run(email, hash, fullName, 'admin');
  
  console.log('\n✅ Admin account created successfully!');
  console.log(`   Email: ${email}`);
  console.log('   Role: admin\n');
  
  rl.close();
})();