import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Enter the admin password to hash: ', async (password) => {
	try {
		// Generate a salt
		const salt = await bcrypt.genSalt(10);

		// Hash the password with the salt
		const hash = await bcrypt.hash(password, salt);

		console.log('\nPassword hash generated successfully:');
		console.log(hash);
		console.log('\nAdd this to your .env file as:');
		console.log(`ADMIN_PASSWORD_HASH=${hash}`);
	} catch (error) {
		console.error('Error generating hash:', error);
	} finally {
		rl.close();
	}
});
