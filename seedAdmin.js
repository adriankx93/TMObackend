async function createAdmin() {
  try {
    const exists = await User.findOne({ email: 'admin' });
    if (!exists) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin',
        password: 'adrian128',
        role: 'Admin'
      });
      console.log('Admin utworzony!');
    } else {
      console.log('Admin już istnieje.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
    process.exit();
  }
}
createAdmin();
