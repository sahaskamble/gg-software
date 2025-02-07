import mongoose, { Model, Schema } from 'mongoose';
import dbConnect from './lib/db';
import { userSchema } from './lib/models/Users';
import { deviceSchema } from './lib/models/Device';
import { deviceCategorySchema } from './lib/models/DeviceCategory';
import { gameSchema } from './lib/models/Games';
import { snackSchema } from './lib/models/Snacks';
import { sessionSchema } from './lib/models/Sessions';
import { UserRole } from './lib/models/Users';
import { UserBranchSchema } from './lib/models/UserBranches';

interface ModelDefinition {
  name: string;
  schema: Schema;
}

export async function register(): Promise<void> {
  try {
    await dbConnect();
    await initializeModels();
    console.log("✅ Database connected and models initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
}

async function initializeModels(): Promise<void> {
  const modelDefinitions: ModelDefinition[] = [
    { name: 'UserBranches', schema: UserBranchSchema }, 
    { name: 'Users', schema: userSchema },
    { name: 'Device', schema: deviceSchema },
    { name: 'DeviceCategory', schema: deviceCategorySchema },
    { name: 'Game', schema: gameSchema },
    { name: 'Snack', schema: snackSchema },
    { name: 'Session', schema: sessionSchema },
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
    const User = mongoose.model('Users') as Model<any>;
    const adminUser = await User.exists({});

    if (!adminUser) {
      // Create the Super admin user
      const superUser = await User.create({
        username: 'Super',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        role: UserRole.SuperAdmin,
      });

      // Create default branch for Super admin
      const UserBranches = mongoose.model('UserBranches');
      await UserBranches.create({
        userId: superUser._id.toString(),
        branches: [{
          branchId: 'main-branch',
          branchName: 'Main Branch',
          canAccess: true
        }]
      });
      console.log('✅ Admin user and branch created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}
