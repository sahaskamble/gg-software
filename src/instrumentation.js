import mongoose from 'mongoose';
import dbConnect from './lib/db';
import { userSchema, UserRole } from './lib/models/Users';
import { branchSchema } from './lib/models/Branch';
import { snackSchema } from './lib/models/Snacks';
import { sessionSchema } from './lib/models/Sessions';
import { deviceCategorySchema } from './lib/models/DeviceCategory';
import { deviceSchema } from './lib/models/Device';
import { PricingSchema } from './lib/models/Pricing';

export async function register() {
  try {
    await dbConnect();
    await initializeModels();
    console.log("✅ Database connected and models initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

async function initializeModels() {
  const modelDefinitions = [
    { name: 'Users', schema: userSchema },
    { name: 'Branch', schema: branchSchema },
    { name: 'Snack', schema: snackSchema },
    { name: 'Session', schema: sessionSchema },
    { name: 'DeviceCategory', schema: deviceCategorySchema },
    { name: 'Device', schema: deviceSchema },
    { name: 'Pricing', schema: PricingSchema },
  ];

  // First, initialize all models
  for (const { name, schema } of modelDefinitions) {
    try {
      // Check if model exists, if not create it
      mongoose.models[name] || mongoose.model(name, schema);
      console.log(`✅ Model ${name} initialized successfully`);
    } catch (error) {
      console.error(`❌ Error initializing model ${name}:`, error);
      throw error;
    }
  }

  // Then, handle the admin user creation separately
  try {
    const Users = mongoose.model('Users');
    const adminExists = await Users.exists({});

    if (!adminExists) {
      // Create the Super admin user
      const superAdmin = await Users.create({
        username: 'admin',
        passwordHash: 'admin@123', // Will be hashed by pre-save hook
        role: UserRole.SuperAdmin,
        email: 'admin@arcade.com'
      });
      console.log(superAdmin);

      // Create default branch for Super admin
      const Branch = mongoose.model('Branch');
      await Branch.create({
        name: 'Main Branch',
        location: 'Dombivli',
        createdBy: superAdmin._id
      });
      console.log(await Branch.find());
      // console.log('✅ Admin user and branch created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}
